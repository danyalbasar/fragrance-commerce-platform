using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/chat")]
[EnableRateLimiting("ChatPerIp")]
public class ChatController(IChatService chatService) : ControllerBase
{
    [HttpGet("status")]
    public async Task<ActionResult<ChatStatusDto>> Status(CancellationToken cancellationToken) =>
        Ok(await chatService.GetStatusAsync(cancellationToken));

    [HttpPost]
    [RequestSizeLimit(4096)]
    public async Task<ActionResult<ChatResponseDto>> Send(ChatRequestDto request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "Please enter a question." });
        try
        {
            return Ok(await chatService.ReplyAsync(request.Message.Trim(), cancellationToken));
        }
        catch (ChatUnavailableException error)
        {
            return StatusCode(error.StatusCode, new { message = error.Message, code = error.Code });
        }
    }
}
