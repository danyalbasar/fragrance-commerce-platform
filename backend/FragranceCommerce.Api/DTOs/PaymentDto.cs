using FragranceCommerce.Api.Enums;

namespace FragranceCommerce.Api.DTOs;

public class PaymentDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public string? TransactionId { get; set; }
    public DateTime? PaidAt { get; set; }
}