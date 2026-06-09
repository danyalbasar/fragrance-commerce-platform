using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface IWishlistService
{
    Task<WishlistDto> GetWishlistAsync(Guid currentUserId);
    Task AddAsync(Guid productId, Guid currentUserId);
    Task RemoveAsync(Guid productId, Guid currentUserId);
}