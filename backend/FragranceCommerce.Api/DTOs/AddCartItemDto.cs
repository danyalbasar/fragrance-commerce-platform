namespace FragranceCommerce.Api.DTOs;

public class AddCartItemDto
{
    public Guid ProductVariantId { get; set; }
    public int Quantity { get; set; }
}