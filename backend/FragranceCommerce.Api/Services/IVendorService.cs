using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface IVendorService
{
    Task<VendorDto> CreateAsync(CreateVendorDto dto, Guid currentUserId);
}