using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface IChatService
{
    Task<ChatStatusDto> GetStatusAsync(CancellationToken cancellationToken);
    Task<ChatResponseDto> ReplyAsync(string message, CancellationToken cancellationToken);
}

public interface IChatCatalogProvider
{
    Task<List<ChatProductDto>> GetMatchesAsync(string message, CancellationToken cancellationToken);
    Task<Dictionary<string, string>> GetStoreInformationAsync(CancellationToken cancellationToken);
}

public class ChatUnavailableException(string message, int statusCode = 503, string? code = null) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
    public string? Code { get; } = code;
}
