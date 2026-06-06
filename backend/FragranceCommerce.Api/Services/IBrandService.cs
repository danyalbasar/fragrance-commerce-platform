using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface IBrandService
{
    Task<List<BrandDto>> GetAllAsync();
    Task<BrandDto?> GetByIdAsync(Guid id);
    Task<BrandDto> CreateAsync(CreateBrandDto dto);
    Task<bool> UpdateAsync(Guid id, UpdateBrandDto dto);
    Task<bool> DeleteAsync(Guid id);
}