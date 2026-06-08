namespace FragranceCommerce.Api.DTOs;

public class CreateProductVariantImageDto
{
    public string ImageUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsPrimary { get; set; }
}