using System.Linq.Expressions;
using System.Text.RegularExpressions;
using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Enums;
using FragranceCommerce.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Services;

public class VendorChatDataProvider(ApplicationDbContext context, TimeProvider clock) : IVendorChatDataProvider
{
    private static readonly HashSet<string> GenericWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "what", "how", "are", "the", "and", "for", "with", "which", "show", "tell", "about", "please",
        "sales", "sold", "selling", "seller", "sellers", "inventory", "stock", "orders", "order", "products",
        "product", "items", "units", "quantity", "revenue", "profit", "price", "cost", "sku", "status", "summary",
        "overview", "need", "restock", "low", "out", "top", "best", "have", "can", "this", "all", "last",
        "today", "yesterday", "week", "month", "days", "period", "pending", "confirmed", "shipped", "delivered", "cancelled"
    };

    public async Task<VendorChatSnapshot> GetSnapshotAsync(Guid currentUserId, string message, string period, CancellationToken cancellationToken)
    {
        var now = clock.GetUtcNow().UtcDateTime;
        var (from, to) = VendorChatPeriods.Resolve(period, now);
        // No client-supplied vendor ID is accepted. Resolve ownership from the authenticated user.
        var vendorId = await context.Vendors.AsNoTracking().Where(v => v.UserId == currentUserId)
            .Select(v => (Guid?)v.Id).SingleOrDefaultAsync(cancellationToken)
            ?? throw new VendorChatAccessException();
        var products = VendorChatQueries.Products(context.Products.AsNoTracking(), vendorId);
        var variants = VendorChatQueries.Variants(context.ProductVariants.AsNoTracking(), vendorId);
        var items = VendorChatQueries.Items(context.OrderItems.AsNoTracking(), vendorId)
            .Where(i => i.Order.OrderedAt < to && (!from.HasValue || i.Order.OrderedAt >= from.Value));
        var orders = VendorChatQueries.Orders(context.Orders.AsNoTracking(), vendorId)
            .Where(o => o.OrderedAt < to && (!from.HasValue || o.OrderedAt >= from.Value));
        var delivered = items.Where(i => i.Order.Status == OrderStatus.Delivered);
        var active = variants.Where(v => v.IsActive && v.Product.Status == ProductStatus.Active);

        var deliveredSales = await delivered.SumAsync(i => (decimal?)(i.UnitPrice * i.Quantity), cancellationToken) ?? 0;
        var deliveredUnits = await delivered.SumAsync(i => (int?)i.Quantity, cancellationToken) ?? 0;
        var statusCounts = await orders.GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() }).ToListAsync(cancellationToken);
        var inventory = await variants.GroupBy(v => 1).Select(g => new
        {
            Skus = g.Count(), Units = g.Sum(v => v.StockQuantity),
            Value = g.Sum(v => v.StockQuantity * v.CostPrice)
        }).SingleOrDefaultAsync(cancellationToken);
        var lowStock = await InventoryRows(active.Where(v => v.StockQuantity <= 5)
            .OrderBy(v => v.StockQuantity).ThenBy(v => v.SKU).Take(6)).ToListAsync(cancellationToken);
        var topSellers = await delivered.GroupBy(i => new { i.ProductVariant.ProductId, i.ProductVariant.Product.Name })
            .Select(g => new { ProductId = g.Key.ProductId, ProductName = g.Key.Name, Units = g.Sum(i => i.Quantity), GrossSales = g.Sum(i => i.UnitPrice * i.Quantity) })
            .OrderByDescending(p => p.Units).ThenBy(p => p.ProductName).Take(5)
            .Select(p => new VendorChatTopSeller(p.ProductId, p.ProductName, p.Units, p.GrossSales)).ToListAsync(cancellationToken);
        // Group only scoped items: a shared order's full total and other vendors' items never enter the snapshot.
        var recentOrders = await items.GroupBy(i => new { i.OrderId, i.Order.OrderNumber, i.Order.OrderedAt, i.Order.Status })
            .Select(g => new { g.Key.OrderNumber, g.Key.OrderedAt, g.Key.Status, Units = g.Sum(i => i.Quantity), Amount = g.Sum(i => i.UnitPrice * i.Quantity) })
            .OrderByDescending(o => o.OrderedAt).ThenBy(o => o.OrderNumber).Take(5)
            .Select(o => new VendorChatOrder(o.OrderNumber, o.OrderedAt, o.Status.ToString(), o.Units, o.Amount)).ToListAsync(cancellationToken);

        var terms = Regex.Matches(message.ToLowerInvariant(), @"[\p{L}\p{N}]{3,}")
            .Select(m => m.Value).Where(t => !GenericWords.Contains(t)).Distinct().Take(6).ToList();
        var matches = new List<VendorChatInventoryItem>();
        if (terms.Count > 0)
        {
            var parameter = Expression.Parameter(typeof(ProductVariant), "variant");
            Expression body = Expression.Constant(false);
            foreach (var term in terms)
            {
                Expression<Func<ProductVariant, bool>> match = v => v.Product.Name.ToLower().Contains(term) ||
                    v.SKU.ToLower().Contains(term) || v.VariantName.ToLower().Contains(term);
                body = Expression.OrElse(body, new ReplaceParameter(match.Parameters[0], parameter).Visit(match.Body)!);
            }
            matches = await InventoryRows(variants.Where(Expression.Lambda<Func<ProductVariant, bool>>(body, parameter))
                .OrderBy(v => v.Product.Name).ThenBy(v => v.SKU).Take(6)).ToListAsync(cancellationToken);
        }
        return new VendorChatSnapshot
        {
            AsOfUtc = now, Period = period, SalesFromUtc = from, SalesToUtc = to,
            DeliveredItemSales = deliveredSales, DeliveredUnits = deliveredUnits,
            TotalOrders = statusCounts.Sum(s => s.Count),
            OrderCounts = Enum.GetValues<OrderStatus>().ToDictionary(s => s.ToString(), s => statusCounts.FirstOrDefault(c => c.Status == s)?.Count ?? 0),
            TotalProducts = await products.CountAsync(cancellationToken),
            ActiveProducts = await products.CountAsync(p => p.Status == ProductStatus.Active, cancellationToken),
            TotalSkus = inventory?.Skus ?? 0, TotalStockUnits = inventory?.Units ?? 0,
            InventoryAtRecordedCost = inventory?.Value ?? 0,
            ActiveLowStockSkus = await active.CountAsync(v => v.StockQuantity <= 5, cancellationToken),
            ActiveOutOfStockSkus = await active.CountAsync(v => v.StockQuantity <= 0, cancellationToken),
            TopSellers = topSellers, LowStock = lowStock, MatchingInventory = matches, RecentOrders = recentOrders
        };
    }

    private static IQueryable<VendorChatInventoryItem> InventoryRows(IQueryable<ProductVariant> variants) =>
        variants.Select(v => new VendorChatInventoryItem(v.ProductId, v.Product.Name, v.VariantName, v.SKU,
            v.StockQuantity, v.SellingPrice, v.CostPrice, v.IsActive, v.Product.Status.ToString()));

    private class ReplaceParameter(ParameterExpression oldParameter, ParameterExpression newParameter) : ExpressionVisitor
    {
        protected override Expression VisitParameter(ParameterExpression node) => node == oldParameter ? newParameter : base.VisitParameter(node);
    }
}
