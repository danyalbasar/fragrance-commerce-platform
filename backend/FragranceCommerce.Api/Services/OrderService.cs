using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Repositories;
using Microsoft.EntityFrameworkCore;
using FragranceCommerce.Api.Enums;

namespace FragranceCommerce.Api.Services;

public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _context;
    private readonly ICartRepository _cartRepository;
    private readonly IOrderRepository _orderRepository;

    public OrderService(
        ApplicationDbContext context,
        ICartRepository cartRepository,
        IOrderRepository orderRepository)
    {
        _context = context;
        _cartRepository = cartRepository;
        _orderRepository = orderRepository;
    }

    public async Task<OrderDto> CreateOrderAsync(CreateOrderDto dto, Guid currentUserId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(currentUserId);

        if (cart == null || !cart.Items.Any())
            throw new InvalidOperationException("Cart is empty.");

        var address = await _context.Addresses
            .FirstOrDefaultAsync(a =>
                a.Id == dto.AddressId &&
                a.UserId == currentUserId);

        if (address == null)
            throw new InvalidOperationException("Address not found.");

        using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            foreach (var item in cart.Items)
            {
                if (item.Quantity > item.ProductVariant.StockQuantity)
                    throw new InvalidOperationException(
                        $"Insufficient stock for {item.ProductVariant.Product.Name} - {item.ProductVariant.VariantName}.");
            }

            var totalAmount = cart.Items.Sum(i => i.ProductVariant.SellingPrice * i.Quantity);

            var discountAmount = cart.DiscountAmount;

            if (discountAmount > totalAmount)
                discountAmount = totalAmount;

            var finalAmount = totalAmount - discountAmount;

            var order = new Order
            {
                UserId = currentUserId,
                OrderNumber = GenerateOrderNumber(),
                Status = OrderStatus.Pending,
                OrderedAt = DateTime.UtcNow,

                TotalAmount = totalAmount,
                CouponCode = cart.CouponCode,
                DiscountAmount = discountAmount,
                FinalAmount = finalAmount,

                Items = cart.Items.Select(item => new OrderItem
                {
                    ProductVariantId = item.ProductVariantId,
                    UnitPrice = item.ProductVariant.SellingPrice,
                    Quantity = item.Quantity
                }).ToList(),

                ShippingAddress = new OrderAddress
                {
                    FullName = address.FullName,
                    PhoneNumber = address.PhoneNumber,
                    AddressLine1 = address.AddressLine1,
                    AddressLine2 = address.AddressLine2,
                    City = address.City,
                    State = address.State,
                    PostalCode = address.PostalCode,
                    Country = address.Country
                },

                Payment = new Payment
                {
                    Amount = finalAmount,
                    PaymentMethod = dto.PaymentMethod,
                    PaymentStatus = PaymentStatus.Pending
                }
            };

            order.TotalAmount = order.Items.Sum(i => i.UnitPrice * i.Quantity);

            foreach (var item in cart.Items)
            {
                item.ProductVariant.StockQuantity -= item.Quantity;
            }

            if (!string.IsNullOrWhiteSpace(cart.CouponCode))
            {
                var coupon = await _context.Coupons
                    .FirstOrDefaultAsync(c => c.Code == cart.CouponCode);

                if (coupon != null)
                {
                    coupon.UsedCount++;
                }
            }

            _context.CartItems.RemoveRange(cart.Items);

            cart.CouponCode = null;
            cart.DiscountAmount = 0;
            cart.UpdatedAt = DateTime.UtcNow;

            await _orderRepository.AddAsync(order);
            await _orderRepository.SaveChangesAsync();

            await transaction.CommitAsync();

            return MapToOrderDto(order);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderDto?> GetByIdAsync(Guid orderId, Guid currentUserId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);

        if (order == null || order.UserId != currentUserId)
            return null;

        return MapToOrderDto(order);
    }

    public async Task<List<OrderDto>> GetMyOrdersAsync(Guid currentUserId)
    {
        var orders = await _orderRepository.GetByUserIdAsync(currentUserId);

        return orders.Select(MapToOrderDto).ToList();
    }

    private static OrderDto MapToOrderDto(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            Status = order.Status,
            OrderedAt = order.OrderedAt,

            TotalAmount = order.TotalAmount,
            CouponCode = order.CouponCode,
            DiscountAmount = order.DiscountAmount,
            FinalAmount = order.FinalAmount,

            Items = order.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductVariant.Product.Name,
                VariantName = i.ProductVariant.VariantName,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                TotalPrice = i.UnitPrice * i.Quantity
            }).ToList(),

            ShippingAddress = order.ShippingAddress == null
                ? null
                : new OrderAddressDto
                {
                    FullName = order.ShippingAddress.FullName,
                    PhoneNumber = order.ShippingAddress.PhoneNumber,
                    AddressLine1 = order.ShippingAddress.AddressLine1,
                    AddressLine2 = order.ShippingAddress.AddressLine2,
                    City = order.ShippingAddress.City,
                    State = order.ShippingAddress.State,
                    PostalCode = order.ShippingAddress.PostalCode,
                    Country = order.ShippingAddress.Country
                },

            Payment = order.Payment == null
                    ? null
                    : new PaymentDto
                    {
                        Id = order.Payment.Id,
                        Amount = order.Payment.Amount,
                        PaymentMethod = order.Payment.PaymentMethod,
                        PaymentStatus = order.Payment.PaymentStatus,
                        TransactionId = order.Payment.TransactionId,
                        PaidAt = order.Payment.PaidAt
                    }
        };
    }

    public async Task<OrderDto> UpdateStatusAsync(
        Guid orderId,
        UpdateOrderStatusDto dto)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);

        if (order == null)
            throw new InvalidOperationException("Order not found.");

        if (!IsValidStatusTransition(order.Status, dto.Status))
            throw new InvalidOperationException(
                $"Cannot change order status from {order.Status} to {dto.Status}.");

        using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            if (dto.Status == OrderStatus.Cancelled)
            {
                foreach (var item in order.Items)
                {
                    item.ProductVariant.StockQuantity += item.Quantity;
                }
            }

            order.Status = dto.Status;
            order.UpdatedAt = DateTime.UtcNow;

            await _orderRepository.SaveChangesAsync();

            await transaction.CommitAsync();

            return MapToOrderDto(order);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderDto> CancelOrderAsync(
        Guid orderId,
        Guid currentUserId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);

        if (order == null || order.UserId != currentUserId)
            throw new InvalidOperationException("Order not found.");

        if (order.Status != OrderStatus.Pending)
            throw new InvalidOperationException(
                "Only pending orders can be cancelled.");

        using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            foreach (var item in order.Items)
            {
                item.ProductVariant.StockQuantity += item.Quantity;
            }

            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            await _orderRepository.SaveChangesAsync();

            await transaction.CommitAsync();

            return MapToOrderDto(order);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static bool IsValidStatusTransition(
        OrderStatus currentStatus,
        OrderStatus newStatus)
    {
        return currentStatus switch
        {
            OrderStatus.Pending =>
                newStatus == OrderStatus.Confirmed ||
                newStatus == OrderStatus.Cancelled,

            OrderStatus.Confirmed =>
                newStatus == OrderStatus.Shipped ||
                newStatus == OrderStatus.Cancelled,

            OrderStatus.Shipped =>
                newStatus == OrderStatus.Delivered,

            OrderStatus.Delivered =>
                false,

            OrderStatus.Cancelled =>
                false,

            _ => false
        };
    }

    private static string GenerateOrderNumber()
    {
        return $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";
    }
}