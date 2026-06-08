namespace FragranceCommerce.Api.Models;

public class Order : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string OrderNumber { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime OrderedAt { get; set; } = DateTime.UtcNow;
    public ICollection<OrderItem> Items { get; set; }
        = new List<OrderItem>();
}