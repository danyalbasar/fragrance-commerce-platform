using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface IVendorChatService
{
    Task<VendorChatResponseDto> ReplyAsync(Guid currentUserId, VendorChatRequestDto request, CancellationToken cancellationToken);
}

public interface IVendorChatDataProvider
{
    Task<VendorChatSnapshot> GetSnapshotAsync(Guid currentUserId, string message, string period, CancellationToken cancellationToken);
}

public class VendorChatAccessException : Exception
{
    public VendorChatAccessException() : base("Your vendor profile could not be found.") { }
}
