using System.Security.Claims;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Exceptions;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private const string AuthCookieName = "authToken";
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [EnableRateLimiting("AuthPerIp")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        try
        {
            var response = await _authService.RegisterAsync(dto);
            SetAuthCookie(response.Token!);
            return Ok(WithNoToken(response));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    [EnableRateLimiting("AuthPerIp")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        try
        {
            var response = await _authService.LoginAsync(dto);
            SetAuthCookie(response.Token!);
            return Ok(WithNoToken(response));
        }
        catch (EmailNotVerifiedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("verify-email")]
    [EnableRateLimiting("AuthPerIp")]
    public async Task<ActionResult<AuthResponseDto>> VerifyEmail(VerifyEmailDto dto)
    {
        try
        {
            var response = await _authService.VerifyEmailAsync(dto.Token);
            SetAuthCookie(response.Token!);
            return Ok(WithNoToken(response));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("resend-verification")]
    [EnableRateLimiting("AuthPerIp")]
    public async Task<IActionResult> ResendVerification(ResendVerificationDto dto)
    {
        try
        {
            await _authService.ResendVerificationAsync(dto.Email);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Append(AuthCookieName, "", new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(-1),
            Path = "/"
        });

        return Ok();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthResponseDto>> Me()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        var userId = Guid.Parse(userIdClaim.Value);
        var user = await _authService.GetUserByIdAsync(userId);

        if (user == null)
            return Unauthorized();

        return Ok(new AuthResponseDto
        {
            UserId = userId,
            FullName = User.FindFirst(ClaimTypes.GivenName)?.Value ?? "",
            Email = User.FindFirst(ClaimTypes.Email)?.Value ?? "",
            Roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList(),
            EmailVerified = user.EmailVerified,
            Token = null
        });
    }

    private void SetAuthCookie(string token)
    {
        Response.Cookies.Append(AuthCookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = Request.IsHttps ? SameSiteMode.None : SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddHours(24),
            Path = "/"
        });
    }

    private static AuthResponseDto WithNoToken(AuthResponseDto response)
    {
        response.Token = null;
        return response;
    }
}
