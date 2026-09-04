using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Services;

public interface IEmailService
{
    Task SendEmailVerificationAsync(User user, string token);
    Task SendPasswordResetAsync(User user, string token);
    Task SendContactReplyAsync(
        string recipientEmail,
        string recipientName,
        string subject,
        string reply);
}
