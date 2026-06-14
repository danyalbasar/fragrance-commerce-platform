using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Enums;
using FragranceCommerce.Api.Repositories;

namespace FragranceCommerce.Api.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;

    public PaymentService(IPaymentRepository paymentRepository)
    {
        _paymentRepository = paymentRepository;
    }

    public async Task<PaymentDto?> GetByIdAsync(Guid paymentId)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId);

        return payment == null
            ? null
            : MapToDto(payment);
    }

    public async Task<PaymentDto> UpdateStatusAsync(
        Guid paymentId,
        UpdatePaymentStatusDto dto)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId);

        if (payment == null)
            throw new InvalidOperationException("Payment not found.");

        if (payment.PaymentStatus == PaymentStatus.Completed)
            throw new InvalidOperationException(
                "Payment is already completed.");

        if (dto.Status == PaymentStatus.Completed)
        {
            if (payment.PaymentMethod != PaymentMethod.CashOnDelivery &&
                string.IsNullOrWhiteSpace(dto.TransactionId))
            {
                throw new InvalidOperationException(
                    "Transaction Id is required.");
            }

            payment.PaymentStatus = PaymentStatus.Completed;
            payment.TransactionId = dto.TransactionId;
            payment.PaidAt = DateTime.UtcNow;

            payment.Order.Status = OrderStatus.Confirmed;
        }
        else if (dto.Status == PaymentStatus.Failed)
        {
            payment.PaymentStatus = PaymentStatus.Failed;
        }
        else if (dto.Status == PaymentStatus.Refunded)
        {
            payment.PaymentStatus = PaymentStatus.Refunded;
        }

        payment.UpdatedAt = DateTime.UtcNow;

        await _paymentRepository.SaveChangesAsync();

        return MapToDto(payment);
    }

    private static PaymentDto MapToDto(Models.Payment payment)
    {
        return new PaymentDto
        {
            Id = payment.Id,
            Amount = payment.Amount,
            PaymentMethod = payment.PaymentMethod,
            PaymentStatus = payment.PaymentStatus,
            TransactionId = payment.TransactionId,
            PaidAt = payment.PaidAt
        };
    }
}