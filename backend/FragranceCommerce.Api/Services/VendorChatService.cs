using System.Text.Json;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Settings;
using Microsoft.Extensions.Options;

namespace FragranceCommerce.Api.Services;

public class VendorChatService(HttpClient httpClient, IVendorChatDataProvider data, IOptions<ChatbotSettings> settings) : IVendorChatService
{
    public async Task<VendorChatResponseDto> ReplyAsync(Guid currentUserId, VendorChatRequestDto request, CancellationToken cancellationToken)
    {
        if (!settings.Value.Enabled || !string.Equals(settings.Value.Provider, "cloudflare", StringComparison.OrdinalIgnoreCase))
            throw new ChatUnavailableException("The vendor assistant is currently unavailable.");
        var snapshot = await data.GetSnapshotAsync(currentUserId, request.Message, request.Period, cancellationToken);
        var context = JsonSerializer.Serialize(snapshot, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        if (context.Length > 16000)
            throw new ChatUnavailableException("This business snapshot is too large. Please ask a more specific question.", 422);
        try
        {
            var reply = await new CloudflareChatClient(httpClient, settings.Value)
                .ReplyAsync(request.Message, context, cancellationToken, forVendor: true);
            return new(reply, "open-model", true, [], snapshot);
        }
        catch (Exception ex) when (ex is HttpRequestException or JsonException ||
                                   ex is TaskCanceledException && !cancellationToken.IsCancellationRequested)
        {
            throw new ChatUnavailableException("The vendor assistant is unavailable. Please try again later.");
        }
    }
}
