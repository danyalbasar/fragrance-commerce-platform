using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Repositories;

public interface IContactMessageRepository
{
    Task<List<ContactMessage>> GetAllAsync(bool? resolved = null);
    Task<ContactMessage?> GetByIdAsync(Guid id);
    Task AddAsync(ContactMessage contactMessage);
    Task SaveChangesAsync();
}
