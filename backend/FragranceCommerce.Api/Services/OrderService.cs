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

    public async Task<OrderDto> CreateOrderAsync(Guid currentUserId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(currentUserId);

        if (cart == null || !cart.Items.Any())
            throw new InvalidOperationException("Cart is empty.");

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

            var order = new Order
            {
                UserId = currentUserId,
                OrderNumber = GenerateOrderNumber(),
                Status = OrderStatus.Pending,
                OrderedAt = DateTime.UtcNow,
                Items = cart.Items.Select(item => new OrderItem
                {
                    ProductVariantId = item.ProductVariantId,
                    UnitPrice = item.ProductVariant.SellingPrice,
                    Quantity = item.Quantity
                }).ToList()
            };

            order.TotalAmount = order.Items.Sum(i => i.UnitPrice * i.Quantity);

            foreach (var item in cart.Items)
            {
                item.ProductVariant.StockQuantity -= item.Quantity;
            }

            _context.CartItems.RemoveRange(cart.Items);

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
            Items = order.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductVariant.Product.Name,
                VariantName = i.ProductVariant.VariantName,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                TotalPrice = i.UnitPrice * i.Quantity
            }).ToList()
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