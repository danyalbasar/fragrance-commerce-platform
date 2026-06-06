namespace FragranceCommerce.Api.Models;

public class ReviewImage : BaseEntity
{
    public Guid ReviewId { get; set; }
    public Review Review { get; set; } = null!;

    public string ImageUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}