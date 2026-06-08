using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Repositories;

public interface IProductRepository
{
    Task<List<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(Guid id);
    Task AddAsync(Product product);
    void Update(Product product);
    void Delete(Product product);
    Task SaveChangesAsync();
    Task<(List<Product> Products, int TotalCount)> SearchAsync(ProductSearchRequestDto request);
}