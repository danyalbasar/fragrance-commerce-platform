using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Repositories;

public class BrandRepository : IBrandRepository
{
    private readonly ApplicationDbContext _context;

    public BrandRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Brand>> GetAllAsync()
    {
        return await _context.Brands
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Brand?> GetByIdAsync(Guid id)
    {
        return await _context.Brands
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<Brand?> GetByNameAsync(string name)
    {
        return await _context.Brands
            .FirstOrDefaultAsync(b => b.Name.ToLower() == name.ToLower());
    }

    public async Task AddAsync(Brand brand)
    {
        await _context.Brands.AddAsync(brand);
    }

    public void Update(Brand brand)
    {
        _context.Brands.Update(brand);
    }

    public void Delete(Brand brand)
    {
        _context.Brands.Remove(brand);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}