using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Services;

public class WishlistService : IWishlistService
{
    private readonly IWishlistRepository _wishlistRepository;
    private readonly ApplicationDbContext _context;

    public WishlistService(
        IWishlistRepository wishlistRepository,
        ApplicationDbContext context)
    {
        _wishlistRepository = wishlistRepository;
        _context = context;
    }

    public async Task<WishlistDto> GetWishlistAsync(Guid currentUserId)
    {
        var items = await _wishlistRepository.GetByUserIdAsync(currentUserId);

        return new WishlistDto
        {
            Items = items.Select(w => new WishlistItemDto
            {
                Id = w.Id,
                ProductId = w.ProductId,
                ProductName = w.Product.Name,
                BrandName = w.Product.Brand.Name,
                CategoryName = w.Product.Category.Name,

                PrimaryImageUrl = w.Product.Images
                    .OrderBy(i => i.DisplayOrder)
                    .FirstOrDefault(i => i.IsPrimary)?.ImageUrl
            }).ToList()
        };
    }

    public async Task AddAsync(Guid productId, Guid currentUserId)
    {
        var productExists = await _context.Products
            .AnyAsync(p => p.Id == productId);

        if (!productExists)
            throw new InvalidOperationException("Product not found.");

        var existingWishlistItem =
            await _wishlistRepository.GetByUserAndProductAsync(
                currentUserId,
                productId);

        if (existingWishlistItem != null)
            throw new InvalidOperationException(
                "Product already exists in wishlist.");

        await _wishlistRepository.AddAsync(new WishlistItem
        {
            UserId = currentUserId,
            ProductId = productId
        });

        await _wishlistRepository.SaveChangesAsync();
    }

    public async Task RemoveAsync(
        Guid productId,
        Guid currentUserId)
    {
        var wishlistItem =
            await _wishlistRepository.GetByUserAndProductAsync(
                currentUserId,
                productId);

        if (wishlistItem == null)
            throw new InvalidOperationException(
                "Product not found in wishlist.");

        _wishlistRepository.Delete(wishlistItem);

        await _wishlistRepository.SaveChangesAsync();
    }
}