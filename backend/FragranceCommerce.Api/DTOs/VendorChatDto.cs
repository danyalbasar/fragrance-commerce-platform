using System.ComponentModel.DataAnnotations;

namespace FragranceCommerce.Api.DTOs;

public class VendorChatRequestDto : ChatRequestDto
{
    [RegularExpression("\\A(?:today|yesterday|7days|30days|month|all)\\z")]
    public string Period { get; set; } = "30days";
}

public class VendorChatSnapshot
{
    public DateTime AsOfUtc { get; init; }
    public string Period { get; init; } = "30days";
    public DateTime? SalesFromUtc { get; init; }
    public DateTime SalesToUtc { get; init; }
    public string Currency { get; init; } = "INR";
    public string ReportingTimeZone { get; init; } = "Asia/Kolkata";
    public string SalesDefinition { get; init; } = "Gross delivered item sales, by order date, before order-level discounts and refunds. Only this vendor's line items are included; this is not net revenue or profit.";
    public decimal DeliveredItemSales { get; init; }
    public int DeliveredUnits { get; init; }
    public int TotalOrders { get; init; }
    public Dictionary<string, int> OrderCounts { get; init; } = [];
    public int TotalProducts { get; init; }
    public int ActiveProducts { get; init; }
    public int TotalSkus { get; init; }
    public int TotalStockUnits { get; init; }
    public decimal InventoryAtRecordedCost { get; init; }
    public int ActiveLowStockSkus { get; init; }
    public int ActiveOutOfStockSkus { get; init; }
    public int LowStockThreshold { get; init; } = 5;
    public string SampleLimits { get; init; } = "Lists are bounded samples: up to 5 top sellers, 6 low-stock SKUs, 6 matching inventory SKUs, and 5 recent orders. Counts and sales totals cover all matching records. Inventory is current regardless of the sales period. Order status is shared across vendors in a mixed-vendor order.";
    public List<VendorChatTopSeller> TopSellers { get; init; } = [];
    public List<VendorChatInventoryItem> LowStock { get; init; } = [];
    public List<VendorChatInventoryItem> MatchingInventory { get; init; } = [];
    public List<VendorChatOrder> RecentOrders { get; init; } = [];
}

public record VendorChatTopSeller(Guid ProductId, string ProductName, int Units, decimal GrossSales);
public record VendorChatInventoryItem(Guid ProductId, string ProductName, string VariantName, string Sku,
    int Stock, decimal SellingPrice, decimal RecordedCost, bool VariantActive, string ProductStatus);
public record VendorChatOrder(string OrderNumber, DateTime OrderedAtUtc, string Status, int VendorUnits, decimal VendorItemAmount);
public record VendorChatResponseDto(string Reply, string Source, bool Experimental, List<ChatProductDto> Products, VendorChatSnapshot VendorData);
