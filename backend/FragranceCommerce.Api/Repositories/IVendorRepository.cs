using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Repositories;

public interface IVendorRepository
{
    Task<Vendor?> GetByIdAsync(Guid id);
    Task<Vendor?> GetByUserIdAsync(Guid userId);
    Task AddAsync(Vendor vendor);
    Task SaveChangesAsync();
}