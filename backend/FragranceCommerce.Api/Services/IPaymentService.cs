using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface IPaymentService
{
    Task<PaymentDto?> GetByIdAsync(Guid paymentId);
    Task<PaymentDto> UpdateStatusAsync(
        Guid paymentId,
        UpdatePaymentStatusDto dto);
    Task<RazorpayOrderDto> CreateRazorpayOrderAsync(
        Guid paymentId,
        Guid currentUserId);
    Task<PaymentDto> VerifyRazorpayPaymentAsync(
        VerifyRazorpayPaymentDto dto,
        Guid currentUserId);
}