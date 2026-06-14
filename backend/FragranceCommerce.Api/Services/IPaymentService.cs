using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface IPaymentService
{
    Task<PaymentDto?> GetByIdAsync(Guid paymentId);
    Task<PaymentDto> UpdateStatusAsync(
        Guid paymentId,
        UpdatePaymentStatusDto dto);
}