using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Repositories;

public interface IContactMessageRepository
{
    Task<ContactMessage?> GetByIdAsync(Guid id);
    Task AddAsync(ContactMessage contactMessage);
    Task SaveChangesAsync();
}
