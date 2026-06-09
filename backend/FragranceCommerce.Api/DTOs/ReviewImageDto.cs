namespace FragranceCommerce.Api.DTOs;

public class ReviewImageDto
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}