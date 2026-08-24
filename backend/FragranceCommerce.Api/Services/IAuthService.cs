using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> VerifyEmailAsync(string token);
    Task ResendVerificationAsync(string email);
    Task ForgotPasswordAsync(string email);
    Task ResetPasswordAsync(string token, string newPassword);
    Task<User?> GetUserByIdAsync(Guid userId);
}
