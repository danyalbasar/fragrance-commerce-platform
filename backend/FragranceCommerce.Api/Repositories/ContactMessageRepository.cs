using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Repositories;

public class ContactMessageRepository : IContactMessageRepository
{
    private readonly ApplicationDbContext _context;

    public ContactMessageRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ContactMessage>> GetAllAsync(bool? resolved = null)
    {
        var query = _context.ContactMessages.AsNoTracking();

        if (resolved.HasValue)
            query = query.Where(message => message.IsResolved == resolved.Value);

        return await query
            .OrderByDescending(message => message.CreatedAt)
            .ToListAsync();
    }

    public async Task<ContactMessage?> GetByIdAsync(Guid id)
    {
        return await _context.ContactMessages
            .AsNoTracking()
            .FirstOrDefaultAsync(message => message.Id == id);
    }

    public async Task AddAsync(ContactMessage contactMessage)
    {
        await _context.ContactMessages.AddAsync(contactMessage);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
