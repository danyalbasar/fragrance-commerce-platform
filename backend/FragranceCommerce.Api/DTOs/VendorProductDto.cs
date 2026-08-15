namespace FragranceCommerce.Api.DTOs;

public class VendorProductDto
{
    public Guid Id { get; set; }
    public Guid VendorId { get; set; }
    public string? VendorName { get; set; }
    public Guid BrandId { get; set; }
    public string? BrandName { get; set; }
    public Guid CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public List<VendorProductVariantDto> Variants { get; set; } = new();
    public List<ProductImageDto> Images { get; set; } = new();
}
