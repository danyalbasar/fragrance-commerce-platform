namespace FragranceCommerce.Api.Models;

public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string VariantName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;

    public decimal MRP { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal CostPrice { get; set; }

    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<ProductVariantImage> Images { get; set; } = new List<ProductVariantImage>();
}