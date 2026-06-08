namespace FragranceCommerce.Api.Models;

public class Review : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public ICollection<ReviewImage> Images { get; set; } = new List<ReviewImage>();
}