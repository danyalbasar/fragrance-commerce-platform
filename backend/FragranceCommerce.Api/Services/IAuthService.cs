using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> VerifyEmailAsync(string token);
    Task ResendVerificationAsync(string email);
    Task<User?> GetUserByIdAsync(Guid userId);
}
