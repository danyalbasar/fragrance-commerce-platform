using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Repositories;

public interface IWishlistRepository
{
    Task<List<WishlistItem>> GetByUserIdAsync(Guid userId);
    Task<WishlistItem?> GetByUserAndProductAsync(
        Guid userId,
        Guid productId);
    Task AddAsync(WishlistItem wishlistItem);
    void Delete(WishlistItem wishlistItem);
    Task SaveChangesAsync();
}