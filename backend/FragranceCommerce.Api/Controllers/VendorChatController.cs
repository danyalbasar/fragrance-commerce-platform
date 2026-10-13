using System.Security.Claims;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/vendor/chat")]
[Authorize(Roles = "Vendor")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
[EnableRateLimiting("ChatPerIp")]
public class VendorChatController(IVendorChatService chat) : ControllerBase
{
    [HttpPost]
    [RequestSizeLimit(4096)]
    public async Task<ActionResult<VendorChatResponseDto>> Send(VendorChatRequestDto request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId) || userId == Guid.Empty)
            return Unauthorized();
        if (string.IsNullOrWhiteSpace(request.Message)) return BadRequest(new { message = "Please enter a question." });
        try
        {
            request.Message = request.Message.Trim();
            return Ok(await chat.ReplyAsync(userId, request, cancellationToken));
        }
        catch (VendorChatAccessException error) { return NotFound(new { message = error.Message }); }
        catch (ArgumentException error) { return BadRequest(new { message = error.Message }); }
        catch (ChatUnavailableException error) { return StatusCode(error.StatusCode, new { message = error.Message, code = error.Code }); }
    }
}
