using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync();
    Task<ProductDto?> GetByIdAsync(Guid id);
    Task<ProductDto> CreateAsync(
        CreateProductDto dto,
        Guid currentUserId);
}