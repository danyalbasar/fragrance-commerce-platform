using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Services;

public interface IEmailService
{
    Task SendEmailVerificationAsync(User user, string token);
}
