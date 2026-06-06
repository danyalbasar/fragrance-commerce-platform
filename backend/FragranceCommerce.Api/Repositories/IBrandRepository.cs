using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Repositories;

public interface IBrandRepository
{
    Task<List<Brand>> GetAllAsync();
    Task<Brand?> GetByIdAsync(Guid id);
    Task<Brand?> GetByNameAsync(string name);
    Task AddAsync(Brand brand);
    void Update(Brand brand);
    void Delete(Brand brand);
    Task SaveChangesAsync();
}