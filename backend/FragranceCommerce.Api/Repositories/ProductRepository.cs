using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.Models;
using Microsoft.EntityFrameworkCore;
using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly ApplicationDbContext _context;

    public ProductRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Product>> GetAllAsync()
    {
        return await _context.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Vendor)
            .Include(p => p.Variants)
                .ThenInclude(v => v.Images)
            .Include(p => p.Images)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<List<Product>> GetByVendorIdAsync(Guid vendorId)
    {
        return await _context.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Vendor)
            .Include(p => p.Variants)
                .ThenInclude(v => v.Images)
            .Include(p => p.Images)
            .Where(p => p.VendorId == vendorId)
            .OrderByDescending(p => p.UpdatedAt ?? p.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Product?> GetByIdAsync(Guid id)
    {
        return await _context.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Vendor)
            .Include(p => p.Variants)
                .ThenInclude(v => v.Images)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<ProductVariant?> GetVariantByIdAsync(Guid id)
    {
        return await _context.ProductVariants
            .Include(v => v.Product)
            .Include(v => v.Images)
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<ProductImage?> GetProductImageByIdAsync(Guid id)
    {
        return await _context.ProductImages
            .Include(i => i.Product)
                .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<ProductVariantImage?> GetVariantImageByIdAsync(Guid id)
    {
        return await _context.ProductVariantImages
            .Include(i => i.ProductVariant)
                .ThenInclude(v => v.Product)
            .Include(i => i.ProductVariant)
                .ThenInclude(v => v.Images)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task AddAsync(Product product)
    {
        await _context.Products.AddAsync(product);
    }

    public void Update(Product product)
    {
        _context.Products.Update(product);
    }

    public void Delete(Product product)
    {
        _context.Products.Remove(product);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<(List<Product> Products, int TotalCount)> SearchAsync(ProductSearchRequestDto request)
    {
        var query = _context.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Vendor)
            .Include(p => p.Variants)
                .ThenInclude(v => v.Images)
            .Include(p => p.Images)
            .Where(p => p.Status == FragranceCommerce.Api.Enums.ProductStatus.Active)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();

            query = query.Where(p =>
                p.Name.ToLower().StartsWith(search) ||
                (p.Description != null && p.Description.ToLower().StartsWith(search)) ||
                p.Brand.Name.ToLower().StartsWith(search));
        }

        if (request.BrandId.HasValue)
            query = query.Where(p => p.BrandId == request.BrandId.Value);

        if (request.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);

        if (request.Gender.HasValue)
            query = query.Where(p => p.Gender == request.Gender.Value);

        if (request.MinPrice.HasValue)
            query = query.Where(p => p.Variants.Any(v => v.SellingPrice >= request.MinPrice.Value));

        if (request.MaxPrice.HasValue)
            query = query.Where(p => p.Variants.Any(v => v.SellingPrice <= request.MaxPrice.Value));

        if (request.InStockOnly.HasValue)
        {
            if (request.InStockOnly.Value)
                query = query.Where(p => p.Variants.Any(v => v.StockQuantity > 0));
            else
                query = query.Where(p => p.Variants.All(v => v.StockQuantity <= 0));
        }

        query = request.SortBy?.ToLower() switch
        {
            "price" => request.SortDirection?.ToLower() == "desc"
                ? query.OrderByDescending(p => p.Variants.Min(v => v.SellingPrice))
                : query.OrderBy(p => p.Variants.Min(v => v.SellingPrice)),

            "createdat" => request.SortDirection?.ToLower() == "desc"
                ? query.OrderByDescending(p => p.CreatedAt)
                : query.OrderBy(p => p.CreatedAt),

            _ => request.SortDirection?.ToLower() == "desc"
                ? query.OrderByDescending(p => p.Name)
                : query.OrderBy(p => p.Name)
        };

        var totalCount = await query.CountAsync();

        var products = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .AsNoTracking()
            .ToListAsync();

        return (products, totalCount);
    }
}
