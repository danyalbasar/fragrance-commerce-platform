using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Repositories;

public interface IOrderRepository
{
    Task AddAsync(Order order);
    Task<Order?> GetByIdAsync(Guid id);
    Task<List<Order>> GetByUserIdAsync(Guid userId);
    Task<List<Order>> GetByVendorIdAsync(Guid vendorId);
    Task SaveChangesAsync();
}
