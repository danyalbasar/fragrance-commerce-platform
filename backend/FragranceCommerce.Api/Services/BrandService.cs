using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Repositories;

namespace FragranceCommerce.Api.Services;

public class BrandService : IBrandService
{
    private readonly IBrandRepository _brandRepository;

    public BrandService(IBrandRepository brandRepository)
    {
        _brandRepository = brandRepository;
    }

    public async Task<List<BrandDto>> GetAllAsync()
    {
        var brands = await _brandRepository.GetAllAsync();

        return brands.Select(b => new BrandDto
        {
            Id = b.Id,
            Name = b.Name,
            Description = b.Description,
            LogoUrl = b.LogoUrl
        }).ToList();
    }

    public async Task<BrandDto?> GetByIdAsync(Guid id)
    {
        var brand = await _brandRepository.GetByIdAsync(id);

        if (brand == null)
            return null;

        return new BrandDto
        {
            Id = brand.Id,
            Name = brand.Name,
            Description = brand.Description,
            LogoUrl = brand.LogoUrl
        };
    }

    public async Task<BrandDto> CreateAsync(CreateBrandDto dto)
    {
        var existingBrand = await _brandRepository.GetByNameAsync(dto.Name);

        if (existingBrand != null)
            throw new InvalidOperationException("Brand already exists.");

        var brand = new Brand
        {
            Name = dto.Name,
            Description = dto.Description,
            LogoUrl = dto.LogoUrl
        };

        await _brandRepository.AddAsync(brand);
        await _brandRepository.SaveChangesAsync();

        return new BrandDto
        {
            Id = brand.Id,
            Name = brand.Name,
            Description = brand.Description,
            LogoUrl = brand.LogoUrl
        };
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateBrandDto dto)
    {
        var brand = await _brandRepository.GetByIdAsync(id);

        if (brand == null)
            return false;

        brand.Name = dto.Name;
        brand.Description = dto.Description;
        brand.LogoUrl = dto.LogoUrl;
        brand.UpdatedAt = DateTime.UtcNow;

        _brandRepository.Update(brand);
        await _brandRepository.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var brand = await _brandRepository.GetByIdAsync(id);

        if (brand == null)
            return false;

        _brandRepository.Delete(brand);
        await _brandRepository.SaveChangesAsync();

        return true;
    }
}