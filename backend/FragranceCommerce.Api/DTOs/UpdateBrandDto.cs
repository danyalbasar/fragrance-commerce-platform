namespace FragranceCommerce.Api.DTOs;

public class UpdateBrandDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
}