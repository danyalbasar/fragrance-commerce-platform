namespace FragranceCommerce.Api.DTOs;

public class VendorDashboardDto
{
    public decimal TotalSalesAmount { get; set; }
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public int ConfirmedOrders { get; set; }
    public int ShippedOrders { get; set; }
    public int DeliveredOrders { get; set; }
    public int CancelledOrders { get; set; }
    public int TotalProducts { get; set; }
    public int LowStockProducts { get; set; }
    public List<TopSellingProductDto> TopSellingProducts { get; set; } = new();
}