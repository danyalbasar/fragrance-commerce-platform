namespace FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Enums;

public class UpdateProductDto
{
    public Guid BrandId { get; set; }
    public Guid CategoryId { get; set; }
    public ProductGender Gender { get; set; } = ProductGender.Unisex;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProductStatus Status { get; set; }
}
