using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface ICouponService
{
    Task<List<CouponDto>> GetAllAsync();
    Task<CouponDto?> GetByIdAsync(Guid id);
    Task<CouponDto> CreateAsync(CreateCouponDto dto);
    Task<CouponDto> UpdateAsync(
        Guid id,
        UpdateCouponDto dto);
    Task DeleteAsync(Guid id);
}