using System.Net.Http.Json;
using System.Text.Json;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Settings;
using Microsoft.Extensions.Options;

namespace FragranceCommerce.Api.Services;

public class ChatService(
    HttpClient httpClient,
    IChatCatalogProvider catalog,
    IOptions<ChatbotSettings> settings) : IChatService
{
    public async Task<ChatStatusDto> GetStatusAsync(CancellationToken cancellationToken)
    {
        if (!settings.Value.Enabled) return new(false);
        try
        {
            if (IsCloudflare)
                return new(await new CloudflareChatClient(httpClient, settings.Value).IsAvailableAsync(cancellationToken));
            if (!IsLocal) return new(false);
            using var request = Request(HttpMethod.Get, "health");
            using var response = await httpClient.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode) return new(false);
            var status = await response.Content.ReadFromJsonAsync<ChatStatusDto>(cancellationToken);
            return status ?? new(false);
        }
        catch (Exception ex) when (ex is HttpRequestException or JsonException ||
                                   ex is TaskCanceledException && !cancellationToken.IsCancellationRequested)
        {
            return new(false);
        }
    }

    public async Task<ChatResponseDto> ReplyAsync(string message, CancellationToken cancellationToken)
    {
        if (System.Text.RegularExpressions.Regex.IsMatch(message,
                @"\b(my (?:orders?|purchases?|order history)|ORD-\d{14}-\d{4})\b", System.Text.RegularExpressions.RegexOptions.IgnoreCase))
            return new("Please sign in to ask about your own order history and details, or open My orders from your account.", "reviewed-reference", false, []);
        if (!settings.Value.Enabled)
            throw new ChatUnavailableException("The fragrance assistant is currently unavailable.");
        if (!IsLocal && !IsCloudflare)
            throw new ChatUnavailableException("The fragrance assistant is unavailable.");
        var products = await catalog.GetMatchesAsync(message, cancellationToken);
        var information = await catalog.GetStoreInformationAsync(cancellationToken);
        var context = JsonSerializer.Serialize(new { currency = "INR", products, information },
            new JsonSerializerOptions(JsonSerializerDefaults.Web)
            {
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            });
        // Bound the context even if unusually long names or heavily escaped CMS text is supplied.
        if (context.Length > 6000)
            context = JsonSerializer.Serialize(new { currency = "INR", information = "See the product and policy pages for current details." });
        string? reply;
        var source = "open-model";
        try
        {
            if (IsCloudflare)
            {
                reply = await new CloudflareChatClient(httpClient, settings.Value).ReplyAsync(message, context, cancellationToken);
                return new(reply, source, true, products);
            }
            using var request = Request(HttpMethod.Post, "generate");
            request.Content = JsonContent.Create(new { message, context });
            using var response = await httpClient.SendAsync(request, cancellationToken);
            if ((int)response.StatusCode == 422)
                throw new ChatUnavailableException("Please shorten your question for this small learning model.", 422);
            if ((int)response.StatusCode == 429)
                throw new ChatUnavailableException("The learning model is busy. Please try again shortly.", 429);
            if (!response.IsSuccessStatusCode)
                throw new ChatUnavailableException("The learning model is unavailable. Please try again later.");
            var result = await response.Content.ReadFromJsonAsync<ModelReply>(cancellationToken);
            reply = result?.Reply;
            if (result?.Source == "reviewed-reference") source = "reviewed-reference";
        }
        catch (Exception ex) when (ex is HttpRequestException or JsonException ||
                                   ex is TaskCanceledException && !cancellationToken.IsCancellationRequested)
        {
            throw new ChatUnavailableException("The fragrance assistant is unavailable. Please try again later.");
        }
        if (string.IsNullOrWhiteSpace(reply))
            throw new ChatUnavailableException("The learning model could not produce an answer. Please try again.");

        return new(reply, source, source == "open-model", products);
    }

    private HttpRequestMessage Request(HttpMethod method, string path)
    {
        var request = new HttpRequestMessage(method, path);
        if (!string.IsNullOrWhiteSpace(settings.Value.ServiceKey))
            request.Headers.Add("X-Chatbot-Key", settings.Value.ServiceKey);
        return request;
    }

    private record ModelReply(string Reply, string? Source = null);

    private bool IsCloudflare => string.Equals(settings.Value.Provider, "cloudflare", StringComparison.OrdinalIgnoreCase);
    private bool IsLocal => string.Equals(settings.Value.Provider, "local", StringComparison.OrdinalIgnoreCase);
}
