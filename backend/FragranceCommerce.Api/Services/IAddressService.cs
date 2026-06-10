using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface IAddressService
{
    Task<List<AddressDto>> GetMyAddressesAsync(Guid currentUserId);
    Task<AddressDto> CreateAsync(
        CreateAddressDto dto,
        Guid currentUserId);
    Task<AddressDto> UpdateAsync(
        Guid addressId,
        UpdateAddressDto dto,
        Guid currentUserId);
    Task DeleteAsync(
        Guid addressId,
        Guid currentUserId);
}