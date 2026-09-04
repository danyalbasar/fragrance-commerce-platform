using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface IContactMessageService
{
    Task<ContactMessageDto?> GetByIdAsync(Guid id);
    Task<ContactMessageDto> CreateAsync(CreateContactMessageDto dto);
    Task<List<ContactMessageDto>> GetAllAsync(bool? resolved = null);
    Task<ContactMessageDto?> MarkResolvedAsync(Guid id);
    Task<ContactMessageDto?> ReplyAsync(Guid id, string reply);
}
