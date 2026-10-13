using System.Security.Claims;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/customer/chat")]
[Authorize]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
[EnableRateLimiting("ChatPerIp")]
public class CustomerChatController(ICustomerChatService chat) : ControllerBase
{
    [HttpPost]
    [RequestSizeLimit(4096)]
    public async Task<ActionResult<CustomerChatResponseDto>> Send(CustomerChatRequestDto request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId) || userId == Guid.Empty)
            return Unauthorized();
        if (string.IsNullOrWhiteSpace(request.Message)) return BadRequest(new { message = "Please enter a question." });
        try
        {
            request.Message = request.Message.Trim();
            return Ok(await chat.ReplyAsync(userId, request, cancellationToken));
        }
        catch (ChatUnavailableException error) { return StatusCode(error.StatusCode, new { message = error.Message, code = error.Code }); }
    }
}
