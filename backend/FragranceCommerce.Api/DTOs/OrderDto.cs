namespace FragranceCommerce.Api.DTOs;

using FragranceCommerce.Api.Enums;

public class OrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public DateTime OrderedAt { get; set; }
    public decimal TotalAmount { get; set; }
    public string? CouponCode { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public OrderAddressDto? ShippingAddress { get; set; }
    public PaymentDto? Payment { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}