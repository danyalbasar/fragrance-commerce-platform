using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Repositories;

public interface IAddressRepository
{
    Task<List<Address>> GetByUserIdAsync(Guid userId);
    Task<Address?> GetByIdAsync(Guid id);
    Task AddAsync(Address address);
    void Delete(Address address);
    Task SaveChangesAsync();
}