using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Repositories;

public class CartRepository : ICartRepository
{
    private readonly ApplicationDbContext _context;

    public CartRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Cart?> GetByUserIdAsync(Guid userId)
    {
        return await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
            .AsSplitQuery()
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }

    public async Task<Cart?> GetByIdAsync(Guid id)
    {
        return await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<CartItem?> GetCartItemByIdAsync(Guid id)
    {
        return await _context.CartItems
            .Include(i => i.ProductVariant)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task AddAsync(Cart cart)
    {
        await _context.Carts.AddAsync(cart);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}