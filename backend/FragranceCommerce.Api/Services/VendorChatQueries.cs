using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Services;

// Tenant filtering happens in database queries, before any record enters AI context.
public static class VendorChatQueries
{
    public static IQueryable<Product> Products(IQueryable<Product> products, Guid vendorId) =>
        products.Where(p => p.VendorId == vendorId);
    public static IQueryable<ProductVariant> Variants(IQueryable<ProductVariant> variants, Guid vendorId) =>
        variants.Where(v => v.Product.VendorId == vendorId);
    public static IQueryable<OrderItem> Items(IQueryable<OrderItem> items, Guid vendorId) =>
        items.Where(i => i.ProductVariant.Product.VendorId == vendorId);
    public static IQueryable<Order> Orders(IQueryable<Order> orders, Guid vendorId) =>
        orders.Where(o => o.Items.Any(i => i.ProductVariant.Product.VendorId == vendorId));
}

public static class VendorChatPeriods
{
    public static (DateTime? From, DateTime To) Resolve(string period, DateTime nowUtc)
    {
        // Store reporting uses India time; persisted timestamps and query boundaries remain UTC.
        var local = nowUtc.AddMinutes(330);
        var today = DateTime.SpecifyKind(local.Date.AddMinutes(-330), DateTimeKind.Utc);
        var month = new DateTime(local.Year, local.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMinutes(-330);
        return period switch
        {
        "today" => (today, nowUtc),
        "yesterday" => (today.AddDays(-1), today),
        "7days" => (nowUtc.AddDays(-7), nowUtc),
        "30days" => (nowUtc.AddDays(-30), nowUtc),
        "month" => (month, nowUtc),
        "all" => (null, nowUtc),
        _ => throw new ArgumentException("Choose a valid sales period.")
        };
    }
}
