using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Enums;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Repositories;

namespace FragranceCommerce.Api.Services;

public class CouponService : ICouponService
{
    private readonly ICouponRepository _couponRepository;

    public CouponService(ICouponRepository couponRepository)
    {
        _couponRepository = couponRepository;
    }

    public async Task<List<CouponDto>> GetAllAsync()
    {
        var coupons = await _couponRepository.GetAllAsync();

        return coupons.Select(MapToDto).ToList();
    }

    public async Task<CouponDto?> GetByIdAsync(Guid id)
    {
        var coupon = await _couponRepository.GetByIdAsync(id);

        return coupon == null
            ? null
            : MapToDto(coupon);
    }

    public async Task<CouponDto> CreateAsync(CreateCouponDto dto)
    {
        var normalizedCode = dto.Code.Trim().ToUpper();

        ValidateCouponAsync(
            normalizedCode,
            dto.DiscountType,
            dto.DiscountValue,
            dto.MinimumOrderAmount,
            dto.MaxDiscountAmount,
            dto.StartDate,
            dto.EndDate);

        var existingCoupon =
            await _couponRepository.GetByCodeAsync(normalizedCode);

        if (existingCoupon != null)
            throw new InvalidOperationException(
                "Coupon code already exists.");

        var coupon = new Coupon
        {
            Code = normalizedCode,
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MinimumOrderAmount = dto.MinimumOrderAmount,
            MaxDiscountAmount = dto.MaxDiscountAmount,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            UsageLimit = dto.UsageLimit,
            UsedCount = 0,
            IsActive = dto.IsActive
        };

        await _couponRepository.AddAsync(coupon);
        await _couponRepository.SaveChangesAsync();

        return MapToDto(coupon);
    }

    public async Task<CouponDto> UpdateAsync(
        Guid id,
        UpdateCouponDto dto)
    {
        var coupon = await _couponRepository.GetByIdAsync(id);

        if (coupon == null)
            throw new InvalidOperationException(
                "Coupon not found.");

        var normalizedCode = dto.Code.Trim().ToUpper();

        ValidateCouponAsync(
            normalizedCode,
            dto.DiscountType,
            dto.DiscountValue,
            dto.MinimumOrderAmount,
            dto.MaxDiscountAmount,
            dto.StartDate,
            dto.EndDate);

        var existingCoupon =
            await _couponRepository.GetByCodeAsync(normalizedCode);

        if (existingCoupon != null &&
            existingCoupon.Id != coupon.Id)
        {
            throw new InvalidOperationException(
                "Coupon code already exists.");
        }

        coupon.Code = normalizedCode;
        coupon.DiscountType = dto.DiscountType;
        coupon.DiscountValue = dto.DiscountValue;
        coupon.MinimumOrderAmount = dto.MinimumOrderAmount;
        coupon.MaxDiscountAmount = dto.MaxDiscountAmount;
        coupon.StartDate = dto.StartDate;
        coupon.EndDate = dto.EndDate;
        coupon.UsageLimit = dto.UsageLimit;
        coupon.IsActive = dto.IsActive;
        coupon.UpdatedAt = DateTime.UtcNow;

        await _couponRepository.SaveChangesAsync();

        return MapToDto(coupon);
    }

    public async Task DeleteAsync(Guid id)
    {
        var coupon = await _couponRepository.GetByIdAsync(id);

        if (coupon == null)
            throw new InvalidOperationException(
                "Coupon not found.");

        _couponRepository.Delete(coupon);

        await _couponRepository.SaveChangesAsync();
    }

    private static void ValidateCouponAsync(
        string code,
        DiscountType discountType,
        decimal discountValue,
        decimal? minimumOrderAmount,
        decimal? maxDiscountAmount,
        DateTime startDate,
        DateTime endDate)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new InvalidOperationException(
                "Coupon code is required.");

        if (discountValue <= 0)
            throw new InvalidOperationException(
                "Discount value must be greater than zero.");

        if (discountType == DiscountType.Percentage &&
            discountValue > 100)
        {
            throw new InvalidOperationException(
                "Percentage discount cannot exceed 100.");
        }

        if (minimumOrderAmount < 0)
            throw new InvalidOperationException(
                "Minimum order amount cannot be negative.");

        if (maxDiscountAmount < 0)
            throw new InvalidOperationException(
                "Maximum discount amount cannot be negative.");

        if (endDate <= startDate)
            throw new InvalidOperationException(
                "End date must be greater than start date.");
    }

    private static CouponDto MapToDto(Coupon coupon)
    {
        return new CouponDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            DiscountType = coupon.DiscountType,
            DiscountValue = coupon.DiscountValue,
            MinimumOrderAmount = coupon.MinimumOrderAmount,
            MaxDiscountAmount = coupon.MaxDiscountAmount,
            StartDate = coupon.StartDate,
            EndDate = coupon.EndDate,
            UsageLimit = coupon.UsageLimit,
            UsedCount = coupon.UsedCount,
            IsActive = coupon.IsActive
        };
    }
}