namespace FragranceCommerce.Api.Models;

public class Cart : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string? CouponCode { get; set; }
    public decimal DiscountAmount { get; set; }
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}