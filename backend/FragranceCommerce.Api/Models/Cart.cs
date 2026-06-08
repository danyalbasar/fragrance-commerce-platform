namespace FragranceCommerce.Api.Models;

public class Cart : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public ICollection<CartItem> Items { get; set; } 
        = new List<CartItem>();
}