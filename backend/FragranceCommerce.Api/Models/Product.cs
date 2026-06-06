namespace FragranceCommerce.Api.Models;

public class Product : BaseEntity
{
    public Guid VendorId { get; set; }
    public Vendor Vendor { get; set; } = null!;

    public Guid BrandId { get; set; }
    public Brand Brand { get; set; } = null!;

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();

    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}