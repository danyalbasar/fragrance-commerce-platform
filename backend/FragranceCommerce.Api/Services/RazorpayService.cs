using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using FragranceCommerce.Api.Settings;
using Microsoft.Extensions.Options;

namespace FragranceCommerce.Api.Services;

public interface IRazorpayService
{
    string KeyId { get; }
    Task<CreatedRazorpayOrder> CreateOrderAsync(decimal amount, string receipt);
    bool VerifySignature(string orderId, string paymentId, string signature);
}

public class RazorpayService : IRazorpayService
{
    private const string BaseUrl = "https://api.razorpay.com";
    private const string Currency = "INR";

    private readonly HttpClient _httpClient;
    private readonly RazorpaySettings _settings;

    public RazorpayService(
        HttpClient httpClient,
        IOptions<RazorpaySettings> options)
    {
        _httpClient = httpClient;
        _settings = options.Value;
    }

    public string KeyId => _settings.KeyId;

    public async Task<CreatedRazorpayOrder> CreateOrderAsync(
        decimal amount,
        string receipt)
    {
        EnsureConfigured();

        var amountPaise = (int)Math.Round(amount * 100, 0, MidpointRounding.AwayFromZero);

        var payload = new
        {
            amount = amountPaise,
            currency = Currency,
            receipt,
            notes = new { order = receipt }
        };

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"{BaseUrl}/v1/orders");

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Basic", BasicAuthToken());

        request.Content = JsonContent.Create(payload);

        var response = await _httpClient.SendAsync(request);
        var body = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException(
                $"Unable to create payment order: {body}");

        using var document = JsonDocument.Parse(body);
        var root = document.RootElement;

        return new CreatedRazorpayOrder
        {
            Id = root.GetProperty("id").GetString() ?? "",
            AmountPaise = root.TryGetProperty("amount", out var amountElement)
                ? amountElement.GetInt32()
                : amountPaise,
            Currency = root.TryGetProperty("currency", out var currencyElement)
                ? currencyElement.GetString() ?? Currency
                : Currency
        };
    }

    public bool VerifySignature(
        string orderId,
        string paymentId,
        string signature)
    {
        EnsureConfigured();

        var payload = $"{orderId}|{paymentId}";

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_settings.KeySecret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));

        var expected = Convert.ToHexString(hash).ToLowerInvariant();

        return string.Equals(
            expected,
            signature ?? "",
            StringComparison.OrdinalIgnoreCase);
    }

    private string BasicAuthToken()
    {
        var credentials = $"{_settings.KeyId}:{_settings.KeySecret}";
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(credentials));
    }

    private void EnsureConfigured()
    {
        if (string.IsNullOrWhiteSpace(_settings.KeyId) ||
            string.IsNullOrWhiteSpace(_settings.KeySecret))
        {
            throw new InvalidOperationException(
                "Razorpay is not configured. Add RazorpaySettings:KeyId and RazorpaySettings:KeySecret to your configuration.");
        }
    }
}

public class CreatedRazorpayOrder
{
    public string Id { get; set; } = string.Empty;
    public int AmountPaise { get; set; }
    public string Currency { get; set; } = "INR";
}