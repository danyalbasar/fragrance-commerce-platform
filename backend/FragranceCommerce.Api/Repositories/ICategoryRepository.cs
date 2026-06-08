using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Repositories;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync();
    Task<Category?> GetByIdAsync(Guid id);
    Task<Category?> GetByNameAsync(string name);
    Task AddAsync(Category category);
    void Update(Category category);
    void Delete(Category category);
    Task SaveChangesAsync();
}