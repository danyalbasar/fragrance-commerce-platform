using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Repositories;

public interface IProductRepository
{
    Task<List<Product>> GetAllAsync();
    Task<List<Product>> GetByVendorIdAsync(Guid vendorId);
    Task<Product?> GetByIdAsync(Guid id);
    Task<ProductVariant?> GetVariantByIdAsync(Guid id);
    Task<ProductImage?> GetProductImageByIdAsync(Guid id);
    Task<ProductVariantImage?> GetVariantImageByIdAsync(Guid id);
    Task AddAsync(Product product);
    void Update(Product product);
    void Delete(Product product);
    Task SaveChangesAsync();
    Task<(List<Product> Products, int TotalCount)> SearchAsync(ProductSearchRequestDto request);
}
