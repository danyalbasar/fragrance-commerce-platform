using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync();
    Task<List<VendorProductDto>> GetVendorProductsAsync(Guid currentUserId);
    Task<ProductDto?> GetByIdAsync(Guid id);
    Task<VendorProductDto> CreateAsync(
        CreateProductDto dto,
        Guid currentUserId);
    Task<bool> UpdateAsync(
        Guid id,
        UpdateProductDto dto,
        Guid currentUserId);
    Task<bool> DeleteAsync(
        Guid id,
        Guid currentUserId);
    Task<PagedResultDto<ProductDto>> SearchAsync(
        ProductSearchRequestDto request);
    Task<VendorProductVariantDto> UpdateStockAsync(
        Guid variantId,
        UpdateStockDto dto,
        Guid currentUserId);
    Task<VendorProductVariantDto> UpdateVariantAsync(
        Guid variantId,
        UpdateProductVariantDto dto,
        Guid currentUserId);
    Task<ProductImageDto> UpdateProductImageAsync(
        Guid imageId,
        UpdateImageMetadataDto dto,
        Guid currentUserId);
    Task<ProductVariantImageDto> UpdateVariantImageAsync(
        Guid imageId,
        UpdateImageMetadataDto dto,
        Guid currentUserId);
    Task<ProductImageDto> AddProductImageAsync(
        Guid productId,
        IFormFile file,
        bool isPrimary,
        int displayOrder,
        Guid currentUserId);
    Task<ProductVariantImageDto> AddVariantImageAsync(
        Guid variantId,
        IFormFile file,
        bool isPrimary,
        int displayOrder,
        Guid currentUserId);
}
