namespace FragranceCommerce.Api.Models;

public class Vendor : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string BusinessName { get; set; } = string.Empty;
    public string? GSTNumber { get; set; }
    public string? Address { get; set; }
    public bool IsApproved { get; set; } = false;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}