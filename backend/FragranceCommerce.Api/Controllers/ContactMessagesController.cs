using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactMessagesController : ControllerBase
{
    private readonly IContactMessageService _contactMessageService;

    public ContactMessagesController(IContactMessageService contactMessageService)
    {
        _contactMessageService = contactMessageService;
    }

    [HttpPost]
    public async Task<ActionResult<ContactMessageDto>> Create(CreateContactMessageDto dto)
    {
        var contactMessage = await _contactMessageService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(Get),
            new { id = contactMessage.Id },
            contactMessage);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ContactMessageDto>> Get(Guid id)
    {
        var contactMessage = await _contactMessageService.GetByIdAsync(id);

        if (contactMessage == null)
            return NotFound();

        return Ok(contactMessage);
    }
}
