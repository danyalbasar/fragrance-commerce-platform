using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Repositories;

namespace FragranceCommerce.Api.Services;

public class ContactMessageService : IContactMessageService
{
    private readonly IContactMessageRepository _contactMessageRepository;
    private readonly IEmailService _emailService;

    public ContactMessageService(
        IContactMessageRepository contactMessageRepository,
        IEmailService emailService)
    {
        _contactMessageRepository = contactMessageRepository;
        _emailService = emailService;
    }

    public async Task<ContactMessageDto?> GetByIdAsync(Guid id)
    {
        var contactMessage = await _contactMessageRepository.GetByIdAsync(id);

        return contactMessage == null
            ? null
            : ToDto(contactMessage);
    }

    public async Task<List<ContactMessageDto>> GetAllAsync(bool? resolved = null)
    {
        var contactMessages = await _contactMessageRepository.GetAllAsync(resolved);

        return contactMessages.Select(ToDto).ToList();
    }

    public async Task<ContactMessageDto?> MarkResolvedAsync(Guid id)
    {
        var contactMessage = await _contactMessageRepository.GetByIdAsync(id);

        if (contactMessage == null)
            return null;

        contactMessage.IsResolved = true;

        await _contactMessageRepository.SaveChangesAsync();

        return ToDto(contactMessage);
    }

    public async Task<ContactMessageDto?> ReplyAsync(Guid id, string reply)
    {
        var contactMessage = await _contactMessageRepository.GetByIdAsync(id);

        if (contactMessage == null)
            return null;

        await _emailService.SendContactReplyAsync(
            contactMessage.Email,
            contactMessage.FullName,
            contactMessage.Subject,
            reply);

        contactMessage.IsResolved = true;

        await _contactMessageRepository.SaveChangesAsync();

        return ToDto(contactMessage);
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
