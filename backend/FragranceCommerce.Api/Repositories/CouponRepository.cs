using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Repositories;

public class CouponRepository : ICouponRepository
{
    private readonly ApplicationDbContext _context;

    public CouponRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Coupon>> GetAllAsync()
    {
        return await _context.Coupons
            .OrderBy(c => c.Code)
            .ToListAsync();
    }

    public async Task<Coupon?> GetByIdAsync(Guid id)
    {
        return await _context.Coupons
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Coupon?> GetByCodeAsync(string code)
    {
        return await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code == code);
    }

    public async Task AddAsync(Coupon coupon)
    {
        await _context.Coupons.AddAsync(coupon);
    }

    public void Delete(Coupon coupon)
    {
        _context.Coupons.Remove(coupon);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}