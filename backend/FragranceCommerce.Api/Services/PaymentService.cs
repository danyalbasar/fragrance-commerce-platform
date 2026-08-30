using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Enums;
using FragranceCommerce.Api.Repositories;

namespace FragranceCommerce.Api.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IRazorpayService _razorpayService;

    public PaymentService(
        IPaymentRepository paymentRepository,
        IRazorpayService razorpayService)
    {
        _paymentRepository = paymentRepository;
        _razorpayService = razorpayService;
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

    public async Task<RazorpayOrderDto> CreateRazorpayOrderAsync(
        Guid paymentId,
        Guid currentUserId)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId);

        if (payment == null || payment.Order.UserId != currentUserId)
            throw new InvalidOperationException("Payment not found.");

        if (payment.PaymentStatus == PaymentStatus.Completed)
            throw new InvalidOperationException("Payment is already completed.");

        if (payment.PaymentMethod == PaymentMethod.CashOnDelivery)
            throw new InvalidOperationException(
                "Cash on delivery does not require an online payment.");

        if (payment.Amount <= 0)
            throw new InvalidOperationException(
                "Payment amount must be greater than zero.");

        if (Math.Round(payment.Amount * 100) < 100)
            throw new InvalidOperationException(
                "Order amount is below the minimum payment threshold.");

        if (string.IsNullOrWhiteSpace(payment.GatewayOrderId))
        {
            var created = await _razorpayService.CreateOrderAsync(
                payment.Amount,
                payment.Order.OrderNumber);

            payment.GatewayOrderId = created.Id;
            payment.UpdatedAt = DateTime.UtcNow;

            await _paymentRepository.SaveChangesAsync();
        }

        return new RazorpayOrderDto
        {
            KeyId = _razorpayService.KeyId,
            OrderId = payment.GatewayOrderId,
            AmountPaise = (int)Math.Round(
                payment.Amount * 100,
                0,
                MidpointRounding.AwayFromZero),
            Currency = "INR",
            OrderNumber = payment.Order.OrderNumber
        };
    }

    public async Task<PaymentDto> VerifyRazorpayPaymentAsync(
        VerifyRazorpayPaymentDto dto,
        Guid currentUserId)
    {
        var payment = await _paymentRepository.GetByIdAsync(dto.PaymentId);

        if (payment == null || payment.Order.UserId != currentUserId)
            throw new InvalidOperationException("Payment not found.");

        if (payment.PaymentStatus == PaymentStatus.Completed)
            return MapToDto(payment);

        if (payment.PaymentMethod == PaymentMethod.CashOnDelivery)
            throw new InvalidOperationException(
                "Cash on delivery does not require payment verification.");

        if (string.IsNullOrWhiteSpace(payment.GatewayOrderId) ||
            payment.GatewayOrderId != dto.RazorpayOrderId)
        {
            throw new InvalidOperationException("Invalid Razorpay order.");
        }

        if (!_razorpayService.VerifySignature(
                dto.RazorpayOrderId,
                dto.RazorpayPaymentId,
                dto.Signature))
        {
            throw new InvalidOperationException("Payment verification failed.");
        }

        payment.PaymentStatus = PaymentStatus.Completed;
        payment.TransactionId = dto.RazorpayPaymentId;
        payment.PaidAt = DateTime.UtcNow;
        payment.UpdatedAt = DateTime.UtcNow;

        payment.Order.Status = OrderStatus.Confirmed;
        payment.Order.UpdatedAt = DateTime.UtcNow;

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