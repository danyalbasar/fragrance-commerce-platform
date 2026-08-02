namespace FragranceCommerce.Api.DTOs;

public class UpdateProductVariantDto
{
    public string VariantName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public decimal MRP { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal CostPrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
}
