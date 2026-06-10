using System.Security.Claims;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly IAddressService _addressService;

    public AddressesController(IAddressService addressService)
    {
        _addressService = addressService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AddressDto>>> GetMyAddresses()
    {
        var currentUserId = GetCurrentUserId();

        var addresses = await _addressService
            .GetMyAddressesAsync(currentUserId);

        return Ok(addresses);
    }

    [HttpPost]
    public async Task<ActionResult<AddressDto>> Create(
        CreateAddressDto dto)
    {
        var currentUserId = GetCurrentUserId();

        var address = await _addressService
            .CreateAsync(dto, currentUserId);

        return Ok(address);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AddressDto>> Update(
        Guid id,
        UpdateAddressDto dto)
    {
        try
        {
            var currentUserId = GetCurrentUserId();

            var address = await _addressService
                .UpdateAsync(id, dto, currentUserId);

            return Ok(address);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var currentUserId = GetCurrentUserId();

            await _addressService.DeleteAsync(
                id,
                currentUserId);

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            throw new UnauthorizedAccessException();

        return Guid.Parse(userIdClaim.Value);
    }
}