using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Enums;
using FragranceCommerce.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Services;

public class VendorDashboardService : IVendorDashboardService
{
    private readonly ApplicationDbContext _context;
    private readonly IVendorRepository _vendorRepository;

    public VendorDashboardService(
        ApplicationDbContext context,
        IVendorRepository vendorRepository)
    {
        _context = context;
        _vendorRepository = vendorRepository;
    }

    public async Task<VendorDashboardDto> GetDashboardAsync(Guid currentUserId)
    {
        var vendor = await _vendorRepository.GetByUserIdAsync(currentUserId);

        if (vendor == null)
            throw new InvalidOperationException("Vendor profile not found.");

        var vendorId = vendor.Id;

        var vendorProductIds = await _context.Products
            .Where(p => p.VendorId == vendorId)
            .Select(p => p.Id)
            .ToListAsync();

        var vendorOrdersQuery = _context.Orders
            .Where(o => o.Items.Any(i =>
                vendorProductIds.Contains(i.ProductVariant.ProductId)));

        var totalSalesAmount = await _context.OrderItems
            .Where(i =>
                vendorProductIds.Contains(i.ProductVariant.ProductId) &&
                i.Order.Status == OrderStatus.Delivered)
            .SumAsync(i => i.UnitPrice * i.Quantity);

        var topSellingProducts = await _context.OrderItems
            .Where(i =>
                vendorProductIds.Contains(i.ProductVariant.ProductId) &&
                i.Order.Status == OrderStatus.Delivered)
            .GroupBy(i => new
            {
                i.ProductVariant.ProductId,
                i.ProductVariant.Product.Name
            })
            .Select(g => new TopSellingProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name,
                QuantitySold = g.Sum(x => x.Quantity),
                Revenue = g.Sum(x => x.UnitPrice * x.Quantity)
            })
            .OrderByDescending(x => x.QuantitySold)
            .Take(5)
            .ToListAsync();

        return new VendorDashboardDto
        {
            TotalSalesAmount = totalSalesAmount,

            TotalOrders = await vendorOrdersQuery.CountAsync(),

            PendingOrders = await vendorOrdersQuery
                .CountAsync(o => o.Status == OrderStatus.Pending),

            ConfirmedOrders = await vendorOrdersQuery
                .CountAsync(o => o.Status == OrderStatus.Confirmed),

            ShippedOrders = await vendorOrdersQuery
                .CountAsync(o => o.Status == OrderStatus.Shipped),

            DeliveredOrders = await vendorOrdersQuery
                .CountAsync(o => o.Status == OrderStatus.Delivered),

            CancelledOrders = await vendorOrdersQuery
                .CountAsync(o => o.Status == OrderStatus.Cancelled),

            TotalProducts = await _context.Products
                .CountAsync(p => p.VendorId == vendorId),

            LowStockProducts = await _context.ProductVariants
                .CountAsync(v =>
                    v.Product.VendorId == vendorId &&
                    v.StockQuantity <= 5),

            TopSellingProducts = topSellingProducts
        };
    }
}