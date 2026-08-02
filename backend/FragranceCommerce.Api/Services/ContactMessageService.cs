using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Repositories;

namespace FragranceCommerce.Api.Services;

public class ContactMessageService : IContactMessageService
{
    private readonly IContactMessageRepository _contactMessageRepository;

    public ContactMessageService(IContactMessageRepository contactMessageRepository)
    {
        _contactMessageRepository = contactMessageRepository;
    }

    public async Task<ContactMessageDto?> GetByIdAsync(Guid id)
    {
        var contactMessage = await _contactMessageRepository.GetByIdAsync(id);

        return contactMessage == null
            ? null
            : ToDto(contactMessage);
    }

    public async Task<ContactMessageDto> CreateAsync(CreateContactMessageDto dto)
    {
        var contactMessage = new ContactMessage
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber)
                ? null
                : dto.PhoneNumber.Trim(),
            Subject = dto.Subject.Trim(),
            Message = dto.Message.Trim(),
            IsResolved = false
        };

        await _contactMessageRepository.AddAsync(contactMessage);
        await _contactMessageRepository.SaveChangesAsync();

        return ToDto(contactMessage);
    }

    private static ContactMessageDto ToDto(ContactMessage contactMessage)
    {
        return new ContactMessageDto
        {
            Id = contactMessage.Id,
            FullName = contactMessage.FullName,
            Email = contactMessage.Email,
            PhoneNumber = contactMessage.PhoneNumber,
            Subject = contactMessage.Subject,
            Message = contactMessage.Message,
            IsResolved = contactMessage.IsResolved,
            CreatedAt = contactMessage.CreatedAt
        };
    }
}
