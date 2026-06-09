namespace FragranceCommerce.Api.DTOs;

using FragranceCommerce.Api.Enums;

public class OrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public DateTime OrderedAt { get; set; }
    public decimal TotalAmount { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}