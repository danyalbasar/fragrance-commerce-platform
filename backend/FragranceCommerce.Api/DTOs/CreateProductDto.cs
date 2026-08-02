namespace FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Enums;

public class CreateProductDto
{
    public Guid BrandId { get; set; }
    public Guid CategoryId { get; set; }
    public ProductGender Gender { get; set; } = ProductGender.Unisex;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<CreateProductVariantDto> Variants { get; set; } = new();
    public List<CreateProductImageDto> Images { get; set; } = new();
}

public class CreateProductVariantDto
{
    public string VariantName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public decimal MRP { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal CostPrice { get; set; }
    public int StockQuantity { get; set; }   
    public List<CreateProductVariantImageDto> Images { get; set; } = new();
}

public class CreateProductImageDto
{
    public string ImageUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsPrimary { get; set; }
}
