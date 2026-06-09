namespace FragranceCommerce.Api.DTOs;

public class WishlistItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? BrandName { get; set; }
    public string? CategoryName { get; set; }
    public string? PrimaryImageUrl { get; set; }
}