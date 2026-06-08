namespace FragranceCommerce.Api.DTOs;

public class CartDto
{
    public Guid Id { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
    public decimal GrandTotal => Items.Sum(i => i.TotalPrice);
}