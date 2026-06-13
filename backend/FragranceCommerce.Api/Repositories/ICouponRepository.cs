using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Repositories;

public interface ICouponRepository
{
    Task<List<Coupon>> GetAllAsync();
    Task<Coupon?> GetByIdAsync(Guid id);
    Task<Coupon?> GetByCodeAsync(string code);
    Task AddAsync(Coupon coupon);
    void Delete(Coupon coupon);
    Task SaveChangesAsync();
}