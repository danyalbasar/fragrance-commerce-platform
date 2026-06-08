using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface ICartService
{
    Task<CartDto> GetCartAsync(Guid currentUserId);
    Task<CartDto> AddItemAsync(
        AddCartItemDto dto,
        Guid currentUserId);
    Task<CartDto> UpdateItemAsync(
        Guid cartItemId,
        UpdateCartItemDto dto,
        Guid currentUserId);
    Task<bool> RemoveItemAsync(
        Guid cartItemId,
        Guid currentUserId);
}