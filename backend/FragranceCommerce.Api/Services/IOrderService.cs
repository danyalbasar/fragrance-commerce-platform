using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(
        CreateOrderDto dto,
        Guid currentUserId);
    Task<OrderDto?> GetByIdAsync(
        Guid orderId,
        Guid currentUserId);
    Task<List<OrderDto>> GetMyOrdersAsync(Guid currentUserId);
    Task<OrderDto> UpdateStatusAsync(
        Guid orderId,
        UpdateOrderStatusDto dto);
    Task<OrderDto> CancelOrderAsync(
        Guid orderId,
        Guid currentUserId);
}