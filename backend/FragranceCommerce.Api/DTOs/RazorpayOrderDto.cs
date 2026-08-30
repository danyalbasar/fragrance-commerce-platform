namespace FragranceCommerce.Api.DTOs;

public class RazorpayOrderDto
{
    public string KeyId { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
    public int AmountPaise { get; set; }
    public string Currency { get; set; } = "INR";
    public string OrderNumber { get; set; } = string.Empty;
}