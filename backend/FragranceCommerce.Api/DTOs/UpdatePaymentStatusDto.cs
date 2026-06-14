using FragranceCommerce.Api.Enums;

namespace FragranceCommerce.Api.DTOs;

public class UpdatePaymentStatusDto
{
    public PaymentStatus Status { get; set; }
    public string? TransactionId { get; set; }
}