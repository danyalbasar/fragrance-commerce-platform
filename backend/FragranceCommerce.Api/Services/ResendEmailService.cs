using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Settings;
using Microsoft.Extensions.Options;

namespace FragranceCommerce.Api.Services;

public class ResendEmailService : IEmailService
{
    private const string ResendApiUrl = "https://api.resend.com/emails";

    private readonly HttpClient _httpClient;
    private readonly EmailSettings _settings;
    private readonly ILogger<ResendEmailService> _logger;

    public ResendEmailService(
        HttpClient httpClient,
        IOptions<EmailSettings> settings,
        ILogger<ResendEmailService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendEmailVerificationAsync(User user, string token)
    {
        if (string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            _logger.LogWarning(
                "EmailSettings:ApiKey is not configured. Verification link for {Email}: {Link}",
                user.Email,
                BuildVerificationUrl(token));

            return;
        }

        var verifyUrl = BuildVerificationUrl(token);

        var plainText = $"""
            Hello {user.FirstName},

            Welcome to the private house collection. Please verify your email address to activate your account.

            Verify my email:
            {verifyUrl}

            This link expires in 24 hours. If you did not create an account, you can safely ignore this email.

            Thank you,
            The Fragrance Commerce Team
            valentinemackenzie.site
            """;

        var html = $"""
            <div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; color: #16120d;">
                <div style="border-bottom: 1px solid #e5ddcf; padding-bottom: 16px;">
                    <h2 style="letter-spacing: 0.08em; color: #80661e; margin: 0;">FRAGRANCE COMMERCE</h2>
                </div>

                <p style="font-size: 15px; line-height: 1.6;">Hello {user.FirstName},</p>
                <p style="font-size: 15px; line-height: 1.6;">
                    Welcome to the private house collection. Please verify your email address to activate your account.
                </p>

                <p style="margin: 32px 0;">
                    <a href="{verifyUrl}"
                       style="display: inline-block; background: #16120d; color: #fdfaf2; text-decoration: none; padding: 14px 32px; letter-spacing: 0.08em; text-transform: uppercase; font-size: 13px;">
                        Verify my email
                    </a>
                </p>

                <p style="font-size: 13px; line-height: 1.6; color: #5f574e;">
                    If the button does not work, copy and paste this link into your browser:
                    <br/>
                    <a href="{verifyUrl}" style="color: #80661e; word-break: break-all;">{verifyUrl}</a>
                </p>

                <p style="font-size: 13px; line-height: 1.6; color: #5f574e;">
                    This link expires in 24 hours. If you did not create an account, you can safely ignore this email.
                </p>

                <div style="border-top: 1px solid #e5ddcf; margin-top: 32px; padding-top: 16px; font-size: 12px; color: #5f574e; line-height: 1.6;">
                    <p style="margin: 0;">The Fragrance Commerce Team</p>
                    <p style="margin: 4px 0 0;">valentinemackenzie.site</p>
                </div>
            </div>
            """;

        var body = new
        {
            from = $"{_settings.FromName} <{_settings.FromAddress}>",
            to = new[] { user.Email },
            subject = "Verify your email — Fragrance Commerce",
            html,
            text = plainText
        };

        var request = new HttpRequestMessage(HttpMethod.Post, ResendApiUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ApiKey);
        request.Content = new StringContent(
            JsonSerializer.Serialize(body),
            Encoding.UTF8,
            "application/json");

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var responseBody = await response.Content.ReadAsStringAsync();
            _logger.LogError(
                "Resend failed with status {Status}: {Body}",
                (int)response.StatusCode,
                responseBody);

            throw new InvalidOperationException("We could not send the verification email. Please try again later.");
        }
    }

    private string BuildVerificationUrl(string token)
    {
        var baseUrl = _settings.FrontendBaseUrl.TrimEnd('/');
        return $"{baseUrl}/verify-email?token={Uri.EscapeDataString(token)}";
    }
}
