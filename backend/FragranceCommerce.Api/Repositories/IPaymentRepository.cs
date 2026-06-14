using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Repositories;

public interface IPaymentRepository
{
    Task<Payment?> GetByIdAsync(Guid id);
    Task SaveChangesAsync();
}