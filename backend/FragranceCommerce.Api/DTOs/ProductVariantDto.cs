namespace FragranceCommerce.Api.DTOs;

public class ProductVariantDto
{
    public Guid Id { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public decimal MRP { get; set; }
    public decimal SellingPrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; }
    public string StockStatus =>
        StockQuantity == 0 ? "Out of Stock" :
        StockQuantity <= 5 ? $"Only {StockQuantity} left" :
        "In Stock";
    public List<ProductVariantImageDto> Images { get; set; } = new();
}
