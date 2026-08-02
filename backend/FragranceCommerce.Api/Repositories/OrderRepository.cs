using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly ApplicationDbContext _context;

    public OrderRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Order order)
    {
        await _context.Orders.AddAsync(order);
    }

    public async Task<Order?> GetByIdAsync(Guid id)
    {
        return await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
                        .ThenInclude(p => p.Brand)
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
                        .ThenInclude(p => p.Category)
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Images)
            .Include(o => o.ShippingAddress)
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<List<Order>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
                        .ThenInclude(p => p.Brand)
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
                        .ThenInclude(p => p.Category)
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Images)
            .Include(o => o.ShippingAddress)
            .Include(o => o.Payment)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.OrderedAt)
            .ToListAsync();
    }

    public async Task<List<Order>> GetByVendorIdAsync(Guid vendorId)
    {
        return await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
                        .ThenInclude(p => p.Brand)
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
                        .ThenInclude(p => p.Category)
            .Include(o => o.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Images)
            .Include(o => o.ShippingAddress)
            .Include(o => o.Payment)
            .Where(o => o.Items.Any(i => i.ProductVariant.Product.VendorId == vendorId))
            .OrderByDescending(o => o.OrderedAt)
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
