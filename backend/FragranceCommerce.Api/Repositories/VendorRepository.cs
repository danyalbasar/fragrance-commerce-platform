using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Repositories;

public class VendorRepository : IVendorRepository
{
    private readonly ApplicationDbContext _context;

    public VendorRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Vendor?> GetByIdAsync(Guid id)
    {
        return await _context.Vendors
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<Vendor?> GetByUserIdAsync(Guid userId)
    {
        return await _context.Vendors
            .FirstOrDefaultAsync(v => v.UserId == userId);
    }

    public async Task AddAsync(Vendor vendor)
    {
        await _context.Vendors.AddAsync(vendor);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}