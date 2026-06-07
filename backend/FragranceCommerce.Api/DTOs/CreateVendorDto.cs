namespace FragranceCommerce.Api.DTOs;

public class CreateVendorDto
{
    public string BusinessName { get; set; } = string.Empty;
    public string? GSTNumber { get; set; }
    public string? Address { get; set; }
}