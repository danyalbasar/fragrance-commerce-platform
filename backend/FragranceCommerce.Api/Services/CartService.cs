using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Services;

public class CartService : ICartService
{
    private readonly ICartRepository _cartRepository;
    private readonly ApplicationDbContext _context;

    public CartService(
        ICartRepository cartRepository,
        ApplicationDbContext context)
    {
        _cartRepository = cartRepository;
        _context = context;
    }

    public async Task<CartDto> GetCartAsync(Guid currentUserId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(currentUserId);

        if (cart == null)
        {
            cart = new Cart
            {
                UserId = currentUserId
            };

            await _cartRepository.AddAsync(cart);
            await _cartRepository.SaveChangesAsync();
        }

        return MapToCartDto(cart);
    }

    public async Task<CartDto> AddItemAsync(AddCartItemDto dto, Guid currentUserId)
    {
        if (dto.Quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        var cart = await _cartRepository.GetByUserIdAsync(currentUserId);

        if (cart == null)
        {
            cart = new Cart
            {
                UserId = currentUserId
            };

            await _cartRepository.AddAsync(cart);
            await _cartRepository.SaveChangesAsync();
        }

        var variant = await _context.ProductVariants
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Id == dto.ProductVariantId && v.IsActive);

        if (variant == null)
            throw new InvalidOperationException("Product variant not found.");

        var existingItem = await _context.CartItems
            .FirstOrDefaultAsync(i =>
                i.CartId == cart.Id &&
                i.ProductVariantId == dto.ProductVariantId);

        var totalRequestedQuantity = dto.Quantity + (existingItem?.Quantity ?? 0);

        if (totalRequestedQuantity > variant.StockQuantity)
            throw new InvalidOperationException("Requested quantity exceeds available stock.");

        if (existingItem != null)
        {
            existingItem.Quantity += dto.Quantity;
            existingItem.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            _context.CartItems.Add(new CartItem
            {
                CartId = cart.Id,
                ProductVariantId = dto.ProductVariantId,
                Quantity = dto.Quantity
            });
        }

        await _cartRepository.SaveChangesAsync();

        cart = await _cartRepository.GetByUserIdAsync(currentUserId);

        return MapToCartDto(cart!);
    }

    public async Task<CartDto> UpdateItemAsync(
        Guid cartItemId,
        UpdateCartItemDto dto,
        Guid currentUserId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(currentUserId);

        if (cart == null)
            throw new InvalidOperationException("Cart not found.");

        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);

        if (item == null)
            throw new InvalidOperationException("Cart item not found.");

        if (dto.Quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        if (dto.Quantity > item.ProductVariant.StockQuantity)
            throw new InvalidOperationException("Requested quantity exceeds available stock.");

        item.Quantity = dto.Quantity;
        item.UpdatedAt = DateTime.UtcNow;

        await _cartRepository.SaveChangesAsync();

        cart = await _cartRepository.GetByUserIdAsync(currentUserId);

        return MapToCartDto(cart!);
    }

    public async Task<bool> RemoveItemAsync(Guid cartItemId, Guid currentUserId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(currentUserId);

        if (cart == null)
            return false;

        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId);

        if (item == null)
            return false;

        cart.Items.Remove(item);
        await _cartRepository.SaveChangesAsync();

        return true;
    }

    private static CartDto MapToCartDto(Cart cart)
    {
        return new CartDto
        {
            Id = cart.Id,
            Items = cart.Items.Select(i => new CartItemDto
            {
                Id = i.Id,
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductVariant.Product.Name,
                VariantName = i.ProductVariant.VariantName,
                UnitPrice = i.ProductVariant.SellingPrice,
                Quantity = i.Quantity
            }).ToList()
        };
    }
}