using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Repositories;
using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IBrandRepository _brandRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IVendorRepository _vendorRepository;

    public ProductService(
        IProductRepository productRepository,
        IBrandRepository brandRepository,
        ICategoryRepository categoryRepository,
        IVendorRepository vendorRepository)
    {
        _productRepository = productRepository;
        _brandRepository = brandRepository;
        _categoryRepository = categoryRepository;
        _vendorRepository = vendorRepository;
    }

    public async Task<List<ProductDto>> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<ProductDto?> GetByIdAsync(Guid id)
    {
        throw new NotImplementedException();
    }

    public async Task<ProductDto> CreateAsync(
        CreateProductDto dto,
        Guid currentUserId)
    {
        var vendor = await _vendorRepository.GetByUserIdAsync(currentUserId);

        if (vendor == null)
            throw new InvalidOperationException("Vendor profile not found for current user.");

        var brand = await _brandRepository.GetByIdAsync(dto.BrandId);

        if (brand == null)
            throw new InvalidOperationException("Brand not found.");

        var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);

        if (category == null)
            throw new InvalidOperationException("Category not found.");

        var product = new Product
        {
            VendorId = vendor.Id,
            BrandId = dto.BrandId,
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Description = dto.Description,
            Variants = dto.Variants.Select(v => new ProductVariant
            {
                VariantName = v.VariantName,
                SKU = v.SKU,
                MRP = v.MRP,
                SellingPrice = v.SellingPrice,
                CostPrice = v.CostPrice,
                StockQuantity = v.StockQuantity
            }).ToList(),
            Images = dto.Images.Select(i => new ProductImage
            {
                ImageUrl = i.ImageUrl,
                DisplayOrder = i.DisplayOrder,
                IsPrimary = i.IsPrimary
            }).ToList()
        };

        await _productRepository.AddAsync(product);
        await _productRepository.SaveChangesAsync();

        return new ProductDto
        {
            Id = product.Id,
            VendorId = vendor.Id,
            VendorName = vendor.BusinessName,
            BrandId = brand.Id,
            BrandName = brand.Name,
            CategoryId = category.Id,
            CategoryName = category.Name,
            Name = product.Name,
            Description = product.Description,
            IsActive = product.IsActive,
            Variants = product.Variants.Select(v => new ProductVariantDto
            {
                Id = v.Id,
                VariantName = v.VariantName,
                SKU = v.SKU,
                MRP = v.MRP,
                SellingPrice = v.SellingPrice,
                CostPrice = v.CostPrice,
                StockQuantity = v.StockQuantity
            }).ToList(),
            Images = product.Images.Select(i => new ProductImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                DisplayOrder = i.DisplayOrder,
                IsPrimary = i.IsPrimary
            }).ToList()
        };
    }
}