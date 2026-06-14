namespace FragranceCommerce.Api.Models;

using FragranceCommerce.Api.Enums;

public class Order : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string OrderNumber { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string? CouponCode { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public DateTime OrderedAt { get; set; } = DateTime.UtcNow;
    public OrderAddress? ShippingAddress { get; set; }
    public Payment? Payment { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}