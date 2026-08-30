namespace FragranceCommerce.Api.DTOs;

public class VerifyRazorpayPaymentDto
{
    public Guid PaymentId { get; set; }
    public string RazorpayOrderId { get; set; } = string.Empty;
    public string RazorpayPaymentId { get; set; } = string.Empty;
    public string Signature { get; set; } = string.Empty;
}