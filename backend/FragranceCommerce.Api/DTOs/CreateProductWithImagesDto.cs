public class CreateProductWithImagesDto
{
    public Guid BrandId { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<IFormFile> ProductImages { get; set; } = new();
}