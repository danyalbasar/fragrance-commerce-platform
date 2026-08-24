public class WishlistItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string? PrimaryImageUrl { get; set; }
    public Guid VariantId { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public decimal SellingPrice { get; set; }
    public int StockQuantity { get; set; }
    public int VariantCount { get; set; }
    public decimal LowestPrice { get; set; }
}