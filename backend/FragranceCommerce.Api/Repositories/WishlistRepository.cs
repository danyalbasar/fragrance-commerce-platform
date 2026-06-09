using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Repositories;

public class WishlistRepository : IWishlistRepository
{
    private readonly ApplicationDbContext _context;

    public WishlistRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<WishlistItem>> GetByUserIdAsync(Guid userId)
    {
        return await _context.WishlistItems
            .Include(w => w.Product)
                .ThenInclude(p => p.Brand)
            .Include(w => w.Product)
                .ThenInclude(p => p.Category)
            .Include(w => w.Product)
                .ThenInclude(p => p.Images)
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();
    }

    public async Task<WishlistItem?> GetByUserAndProductAsync(
        Guid userId,
        Guid productId)
    {
        return await _context.WishlistItems
            .FirstOrDefaultAsync(w =>
                w.UserId == userId &&
                w.ProductId == productId);
    }

    public async Task AddAsync(WishlistItem wishlistItem)
    {
        await _context.WishlistItems.AddAsync(wishlistItem);
    }

    public void Delete(WishlistItem wishlistItem)
    {
        _context.WishlistItems.Remove(wishlistItem);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}