namespace FragranceCommerce.Api.DTOs;

public class CartDto
{
    public Guid Id { get; set; }
    public string? CouponCode { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
    public decimal TotalAmount => Items.Sum(i => i.TotalPrice);
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount => TotalAmount - DiscountAmount;
}