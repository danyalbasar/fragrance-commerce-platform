namespace FragranceCommerce.Api.DTOs;

public class CreateBrandDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
}