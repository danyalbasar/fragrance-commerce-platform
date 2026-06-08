using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Repositories;

public interface ICartRepository
{
    Task<Cart?> GetByUserIdAsync(Guid userId);
    Task<Cart?> GetByIdAsync(Guid id);
    Task<CartItem?> GetCartItemByIdAsync(Guid id);
    Task AddAsync(Cart cart);
    Task SaveChangesAsync();
}