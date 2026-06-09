namespace FragranceCommerce.Api.DTOs;

public class CreateReviewDto
{
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public List<CreateReviewImageDto> Images { get; set; } = new();
}