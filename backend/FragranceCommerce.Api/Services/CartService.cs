using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Repositories;
using FragranceCommerce.Api.Enums;
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

        if (!cart.Items.Any() &&
            (!string.IsNullOrWhiteSpace(cart.CouponCode) || cart.DiscountAmount > 0))
        {
            cart.CouponCode = null;
            cart.DiscountAmount = 0;
            cart.UpdatedAt = DateTime.UtcNow;

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

        if (!cart.Items.Any())
        {
            cart.CouponCode = null;
            cart.DiscountAmount = 0;
        }

        await _cartRepository.SaveChangesAsync();

        return true;
    }

    private static CartDto MapToCartDto(Cart cart)
    {
        return new CartDto
        {
            Id = cart.Id,
            CouponCode = cart.CouponCode,
            DiscountAmount = cart.DiscountAmount,
            Items = cart.Items.Select(i => new CartItemDto
            {
                Id = i.Id,
                ProductVariantId = i.ProductVariantId,
                ProductName = i.ProductVariant.Product.Name,
                BrandName = i.ProductVariant.Product.Brand.Name,
                Gender = i.ProductVariant.Product.Gender.ToString(),
                CategoryName = i.ProductVariant.Product.Category.Name,
                VariantName = i.ProductVariant.VariantName,
                UnitPrice = i.ProductVariant.SellingPrice,
                Quantity = i.Quantity,
                ImageUrl = i.ProductVariant.Images
                    .OrderBy(img => img.DisplayOrder)
                    .FirstOrDefault(img => img.IsPrimary)?.ImageUrl
                    ?? i.ProductVariant.Product.Images
                        .OrderBy(img => img.DisplayOrder)
                        .FirstOrDefault(img => img.IsPrimary)?.ImageUrl,
            }).ToList()
        };
    }

    public async Task<CartDto> ApplyCouponAsync(
        ApplyCouponDto dto,
        Guid currentUserId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(currentUserId);

        if (cart == null || !cart.Items.Any())
            throw new InvalidOperationException("Cart is empty.");

        var normalizedCode = dto.CouponCode.Trim().ToUpper();

        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code == normalizedCode);

        if (coupon == null)
            throw new InvalidOperationException("Coupon not found.");

        if (!coupon.IsActive)
            throw new InvalidOperationException("Coupon is not active.");

        var now = DateTime.UtcNow;

        if (now < coupon.StartDate || now > coupon.EndDate)
            throw new InvalidOperationException("Coupon is not valid at this time.");

        if (coupon.UsageLimit.HasValue &&
            coupon.UsedCount >= coupon.UsageLimit.Value)
            throw new InvalidOperationException("Coupon usage limit reached.");

        var totalAmount = cart.Items.Sum(i =>
            i.ProductVariant.SellingPrice * i.Quantity);

        if (coupon.MinimumOrderAmount.HasValue &&
            totalAmount < coupon.MinimumOrderAmount.Value)
            throw new InvalidOperationException(
                $"Minimum order amount for this coupon is {coupon.MinimumOrderAmount.Value}.");

        decimal discountAmount;

        if (coupon.DiscountType == DiscountType.Percentage)
        {
            discountAmount = totalAmount * coupon.DiscountValue / 100;

            if (coupon.MaxDiscountAmount.HasValue)
            {
                discountAmount = Math.Min(
                    discountAmount,
                    coupon.MaxDiscountAmount.Value);
            }
        }
        else
        {
            discountAmount = coupon.DiscountValue;
        }

        if (discountAmount > totalAmount)
            discountAmount = totalAmount;

        cart.CouponCode = coupon.Code;
        cart.DiscountAmount = discountAmount;
        cart.UpdatedAt = DateTime.UtcNow;

        await _cartRepository.SaveChangesAsync();

        return MapToCartDto(cart);
    }

    public async Task<CartDto> RemoveCouponAsync(Guid currentUserId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(currentUserId);

        if (cart == null)
            throw new InvalidOperationException("Cart not found.");

        cart.CouponCode = null;
        cart.DiscountAmount = 0;
        cart.UpdatedAt = DateTime.UtcNow;

        await _cartRepository.SaveChangesAsync();

        return MapToCartDto(cart);
    }
}