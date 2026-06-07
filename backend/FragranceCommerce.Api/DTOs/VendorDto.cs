namespace FragranceCommerce.Api.DTOs;

public class VendorDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string? GSTNumber { get; set; }
    public string? Address { get; set; }
    public bool IsApproved { get; set; }
}