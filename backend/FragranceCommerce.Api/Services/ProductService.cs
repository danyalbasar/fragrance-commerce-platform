using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Enums;
using FragranceCommerce.Api.Repositories;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Services;

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _context;
    private readonly IProductRepository _productRepository;
    private readonly IBrandRepository _brandRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IVendorRepository _vendorRepository;
    private readonly IImageUploadService _imageUploadService;

    public ProductService(
        ApplicationDbContext context,
        IProductRepository productRepository,
        IBrandRepository brandRepository,
        ICategoryRepository categoryRepository,
        IVendorRepository vendorRepository,
        IImageUploadService imageUploadService)
    {
        _context = context;
        _productRepository = productRepository;
        _brandRepository = brandRepository;
        _categoryRepository = categoryRepository;
        _vendorRepository = vendorRepository;
        _imageUploadService = imageUploadService;
    }

    public async Task<List<ProductDto>> GetAllAsync()
    {
        var products = await _productRepository.GetAllAsync();

        return products.Select(MapToProductDto).ToList();
    }

    public async Task<List<VendorProductDto>> GetVendorProductsAsync(Guid currentUserId)
    {
        var vendor = await _vendorRepository.GetByUserIdAsync(currentUserId);

        if (vendor == null)
            throw new InvalidOperationException("Vendor profile not found for current user.");

        var products = await _productRepository.GetByVendorIdAsync(vendor.Id);

        return products.Select(MapToVendorProductDto).ToList();
    }

    public async Task<ProductDto?> GetByIdAsync(Guid id)
    {
        var product = await _productRepository.GetByIdAsync(id);

        if (product == null)
            return null;

        return MapToProductDto(product);
    }

    public async Task<VendorProductDto> CreateAsync(
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
            Gender = dto.Gender,
            Name = dto.Name,
            Description = dto.Description,
            Status = dto.Status,
            Variants = dto.Variants.Select(v => new ProductVariant
            {
                VariantName = v.VariantName,
                SKU = v.SKU,
                MRP = v.MRP,
                SellingPrice = v.SellingPrice,
                CostPrice = v.CostPrice,
                StockQuantity = v.StockQuantity,

                Images = v.Images.Select(i => new ProductVariantImage
                {
                    ImageUrl = i.ImageUrl,
                    DisplayOrder = i.DisplayOrder,
                    IsPrimary = i.IsPrimary
                }).ToList()
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

        return MapToVendorProductDto(product);
    }
    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateProductDto dto,
        Guid currentUserId)
    {
        var vendor = await _vendorRepository.GetByUserIdAsync(currentUserId);

        if (vendor == null)
            throw new InvalidOperationException("Vendor profile not found for current user.");

        var product = await _productRepository.GetByIdAsync(id);

        if (product == null)
            return false;

        if (product.VendorId != vendor.Id)
            throw new InvalidOperationException("You are not allowed to update this product.");

        var brand = await _brandRepository.GetByIdAsync(dto.BrandId);

        if (brand == null)
            throw new InvalidOperationException("Brand not found.");

        var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);

        if (category == null)
            throw new InvalidOperationException("Category not found.");

        product.BrandId = dto.BrandId;
        product.CategoryId = dto.CategoryId;
        product.Gender = dto.Gender;
        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Status = dto.Status;
        product.UpdatedAt = DateTime.UtcNow;

        _productRepository.Update(product);
        await _productRepository.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(
        Guid id,
        Guid currentUserId)
    {
        var vendor = await _vendorRepository.GetByUserIdAsync(currentUserId);

        if (vendor == null)
            throw new InvalidOperationException("Vendor profile not found for current user.");

        var product = await _productRepository.GetByIdAsync(id);

        if (product == null)
            return false;

        if (product.VendorId != vendor.Id)
            throw new InvalidOperationException("You are not allowed to delete this product.");

        product.Status = ProductStatus.Deactivated;
        product.UpdatedAt = DateTime.UtcNow;

        _productRepository.Update(product);
        await _productRepository.SaveChangesAsync();

        return true;
    }

    public async Task<PagedResultDto<ProductDto>> SearchAsync(ProductSearchRequestDto request)
    {
        if (request.PageNumber <= 0)
            request.PageNumber = 1;

        if (request.PageSize <= 0)
            request.PageSize = 10;

        if (request.PageSize > 50)
            request.PageSize = 50;

        var result = await _productRepository.SearchAsync(request);

        var productDtos = result.Products.Select(MapToProductDto).ToList();

        return new PagedResultDto<ProductDto>
        {
            Items = productDtos,
            TotalCount = result.TotalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }

    public async Task<VendorProductVariantDto> UpdateStockAsync(
        Guid variantId,
        UpdateStockDto dto,
        Guid currentUserId)
    {
        if (dto.StockQuantity < 0)
            throw new InvalidOperationException("Stock quantity cannot be negative.");

        var vendor = await _vendorRepository.GetByUserIdAsync(currentUserId);

        if (vendor == null)
            throw new InvalidOperationException("Vendor profile not found.");

        var variant = await _context.ProductVariants
            .Include(v => v.Product)
            .Include(v => v.Images)
            .FirstOrDefaultAsync(v => v.Id == variantId);

        if (variant == null)
            throw new InvalidOperationException("Product variant not found.");

        if (variant.Product.VendorId != vendor.Id)
            throw new InvalidOperationException("You are not allowed to update this product variant.");

        variant.StockQuantity = dto.StockQuantity;
        variant.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToVendorVariantDto(variant);
    }

    public async Task<VendorProductVariantDto> UpdateVariantAsync(
        Guid variantId,
        UpdateProductVariantDto dto,
        Guid currentUserId)
    {
        if (string.IsNullOrWhiteSpace(dto.VariantName))
            throw new InvalidOperationException("Variant name is required.");

        if (string.IsNullOrWhiteSpace(dto.SKU))
            throw new InvalidOperationException("SKU is required.");

        if (dto.MRP < 0 || dto.SellingPrice < 0 || dto.CostPrice < 0)
            throw new InvalidOperationException("Prices cannot be negative.");

        if (dto.StockQuantity < 0)
            throw new InvalidOperationException("Stock quantity cannot be negative.");

        var vendor = await _vendorRepository.GetByUserIdAsync(currentUserId);

        if (vendor == null)
            throw new InvalidOperationException("Vendor profile not found.");

        var variant = await _productRepository.GetVariantByIdAsync(variantId);

        if (variant == null)
            throw new InvalidOperationException("Product variant not found.");

        if (variant.Product.VendorId != vendor.Id)
            throw new InvalidOperationException("You are not allowed to update this product variant.");

        variant.VariantName = dto.VariantName;
        variant.SKU = dto.SKU;
        variant.MRP = dto.MRP;
        variant.SellingPrice = dto.SellingPrice;
        variant.CostPrice = dto.CostPrice;
        variant.StockQuantity = dto.StockQuantity;
        variant.IsActive = dto.IsActive;
        variant.UpdatedAt = DateTime.UtcNow;

        await _productRepository.SaveChangesAsync();

        return MapToVendorVariantDto(variant);
    }

    public async Task<ProductImageDto> UpdateProductImageAsync(
        Guid imageId,
        UpdateImageMetadataDto dto,
        Guid currentUserId)
    {
        if (dto.DisplayOrder < 0)
            throw new InvalidOperationException("Display order cannot be negative.");

        var vendor = await _vendorRepository.GetByUserIdAsync(currentUserId);

        if (vendor == null)
            throw new InvalidOperationException("Vendor profile not found.");

        var image = await _productRepository.GetProductImageByIdAsync(imageId);

        if (image == null)
            throw new InvalidOperationException("Product image not found.");

        if (image.Product.VendorId != vendor.Id)
            throw new InvalidOperationException("You are not allowed to update this product image.");

        if (dto.IsPrimary)
        {
            foreach (var sibling in image.Product.Images)
            {
                sibling.IsPrimary = sibling.Id == image.Id;
            }
        }
        else
        {
            image.IsPrimary = false;
        }

        image.DisplayOrder = dto.DisplayOrder;
        image.UpdatedAt = DateTime.UtcNow;

        await _productRepository.SaveChangesAsync();

        return new ProductImageDto
        {
            Id = image.Id,
            ImageUrl = image.ImageUrl,
            DisplayOrder = image.DisplayOrder,
            IsPrimary = image.IsPrimary
        };
    }

    public async Task<ProductVariantImageDto> UpdateVariantImageAsync(
        Guid imageId,
        UpdateImageMetadataDto dto,
        Guid currentUserId)
    {
        if (dto.DisplayOrder < 0)
            throw new InvalidOperationException("Display order cannot be negative.");

        var vendor = await _vendorRepository.GetByUserIdAsync(currentUserId);

        if (vendor == null)
            throw new InvalidOperationException("Vendor profile not found.");

        var image = await _productRepository.GetVariantImageByIdAsync(imageId);

        if (image == null)
            throw new InvalidOperationException("Variant image not found.");

        if (image.ProductVariant.Product.VendorId != vendor.Id)
            throw new InvalidOperationException("You are not allowed to update this variant image.");

        if (dto.IsPrimary)
        {
            foreach (var sibling in image.ProductVariant.Images)
            {
                sibling.IsPrimary = sibling.Id == image.Id;
            }
        }
        else
        {
            image.IsPrimary = false;
        }

        image.DisplayOrder = dto.DisplayOrder;
        image.UpdatedAt = DateTime.UtcNow;

        await _productRepository.SaveChangesAsync();

        return new ProductVariantImageDto
        {
            Id = image.Id,
            ImageUrl = image.ImageUrl,
            DisplayOrder = image.DisplayOrder,
            IsPrimary = image.IsPrimary
        };
    }

    public async Task<ProductImageDto> AddProductImageAsync(
        Guid productId,
        IFormFile file,
        bool isPrimary,
        int displayOrder,
        Guid currentUserId)
    {
        var vendor = await _vendorRepository.GetByUserIdAsync(currentUserId);

        if (vendor == null)
            throw new InvalidOperationException("Vendor profile not found.");

        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == productId);

        if (product == null)
            throw new InvalidOperationException("Product not found.");

        if (product.VendorId != vendor.Id)
            throw new InvalidOperationException("You are not allowed to update this product.");

        var imageUrl = await _imageUploadService.UploadImageAsync(file);

        if (isPrimary)
        {
            foreach (var image in product.Images)
            {
                image.IsPrimary = false;
            }
        }

        var productImage = new ProductImage
        {
            ProductId = product.Id,
            ImageUrl = imageUrl,
            IsPrimary = isPrimary,
            DisplayOrder = displayOrder
        };

        _context.ProductImages.Add(productImage);

        await _context.SaveChangesAsync();

        return new ProductImageDto
        {
            Id = productImage.Id,
            ImageUrl = productImage.ImageUrl,
            IsPrimary = productImage.IsPrimary,
            DisplayOrder = productImage.DisplayOrder
        };
    }

    public async Task<ProductVariantImageDto> AddVariantImageAsync(
        Guid variantId,
        IFormFile file,
        bool isPrimary,
        int displayOrder,
        Guid currentUserId)
    {
        var vendor = await _vendorRepository.GetByUserIdAsync(currentUserId);

        if (vendor == null)
            throw new InvalidOperationException("Vendor profile not found.");

        var variant = await _context.ProductVariants
            .Include(v => v.Product)
            .Include(v => v.Images)
            .FirstOrDefaultAsync(v => v.Id == variantId);

        if (variant == null)
            throw new InvalidOperationException("Product variant not found.");

        if (variant.Product.VendorId != vendor.Id)
            throw new InvalidOperationException(
                "You are not allowed to update this product variant.");

        var imageUrl = await _imageUploadService.UploadImageAsync(file);

        if (isPrimary)
        {
            foreach (var image in variant.Images)
            {
                image.IsPrimary = false;
            }
        }

        var variantImage = new ProductVariantImage
        {
            ProductVariantId = variant.Id,
            ImageUrl = imageUrl,
            IsPrimary = isPrimary,
            DisplayOrder = displayOrder
        };

        _context.ProductVariantImages.Add(variantImage);

        await _context.SaveChangesAsync();

        return new ProductVariantImageDto
        {
            Id = variantImage.Id,
            ImageUrl = variantImage.ImageUrl,
            IsPrimary = variantImage.IsPrimary,
            DisplayOrder = variantImage.DisplayOrder
        };
    }

    private static ProductDto MapToProductDto(Product product) => new()
    {
        Id = product.Id,
        VendorId = product.VendorId,
        VendorName = product.Vendor.BusinessName,

        BrandId = product.BrandId,
        BrandName = product.Brand.Name,

        CategoryId = product.CategoryId,
        CategoryName = product.Category.Name,

        Gender = product.Gender.ToString(),

        Name = product.Name,
        Description = product.Description,
        Status = product.Status,

        Variants = product.Variants.Select(v => new ProductVariantDto
        {
            Id = v.Id,
            VariantName = v.VariantName,
            SKU = v.SKU,
            MRP = v.MRP,
            SellingPrice = v.SellingPrice,
            CostPrice = v.CostPrice,
            StockQuantity = v.StockQuantity,
            IsActive = v.IsActive,

            Images = v.Images.Select(i => new ProductVariantImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                DisplayOrder = i.DisplayOrder,
                IsPrimary = i.IsPrimary
            }).ToList()
        }).ToList(),

        Images = product.Images.Select(i => new ProductImageDto
        {
            Id = i.Id,
            ImageUrl = i.ImageUrl,
            DisplayOrder = i.DisplayOrder,
            IsPrimary = i.IsPrimary
        }).ToList()
    };

    private static VendorProductDto MapToVendorProductDto(Product product) => new()
    {
        Id = product.Id,
        VendorId = product.VendorId,
        VendorName = product.Vendor.BusinessName,

        BrandId = product.BrandId,
        BrandName = product.Brand.Name,

        CategoryId = product.CategoryId,
        CategoryName = product.Category.Name,

        Gender = product.Gender.ToString(),

        Name = product.Name,
        Description = product.Description,
        Status = product.Status,

        Variants = product.Variants.Select(v => new VendorProductVariantDto
        {
            Id = v.Id,
            VariantName = v.VariantName,
            SKU = v.SKU,
            MRP = v.MRP,
            SellingPrice = v.SellingPrice,
            CostPrice = v.CostPrice,
            StockQuantity = v.StockQuantity,
            IsActive = v.IsActive,

            Images = v.Images.Select(i => new ProductVariantImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                DisplayOrder = i.DisplayOrder,
                IsPrimary = i.IsPrimary
            }).ToList()
        }).ToList(),

        Images = product.Images.Select(i => new ProductImageDto
        {
            Id = i.Id,
            ImageUrl = i.ImageUrl,
            DisplayOrder = i.DisplayOrder,
            IsPrimary = i.IsPrimary
        }).ToList()
    };

    private static VendorProductVariantDto MapToVendorVariantDto(ProductVariant variant) => new()
    {
        Id = variant.Id,
        VariantName = variant.VariantName,
        SKU = variant.SKU,
        MRP = variant.MRP,
        SellingPrice = variant.SellingPrice,
        CostPrice = variant.CostPrice,
        StockQuantity = variant.StockQuantity,
        IsActive = variant.IsActive,
        Images = variant.Images
            .OrderBy(i => i.DisplayOrder)
            .Select(i => new ProductVariantImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                DisplayOrder = i.DisplayOrder,
                IsPrimary = i.IsPrimary
            }).ToList()
    };
}
