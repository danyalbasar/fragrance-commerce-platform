using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Repositories;

namespace FragranceCommerce.Api.Services;

public class AddressService : IAddressService
{
    private readonly IAddressRepository _addressRepository;

    public AddressService(IAddressRepository addressRepository)
    {
        _addressRepository = addressRepository;
    }

    public async Task<List<AddressDto>> GetMyAddressesAsync(
        Guid currentUserId)
    {
        var addresses =
            await _addressRepository.GetByUserIdAsync(currentUserId);

        return addresses.Select(MapToDto).ToList();
    }

    public async Task<AddressDto> CreateAsync(
        CreateAddressDto dto,
        Guid currentUserId)
    {
        var addresses =
            await _addressRepository.GetByUserIdAsync(currentUserId);

        if (dto.IsDefault)
        {
            foreach (var address in addresses)
            {
                address.IsDefault = false;
            }
        }

        var newAddress = new Address
        {
            UserId = currentUserId,
            FullName = dto.FullName,
            PhoneNumber = dto.PhoneNumber,
            AddressLine1 = dto.AddressLine1,
            AddressLine2 = dto.AddressLine2,
            City = dto.City,
            State = dto.State,
            PostalCode = dto.PostalCode,
            Country = dto.Country,
            IsDefault = dto.IsDefault
        };

        await _addressRepository.AddAsync(newAddress);
        await _addressRepository.SaveChangesAsync();

        return MapToDto(newAddress);
    }

    public async Task<AddressDto> UpdateAsync(
        Guid addressId,
        UpdateAddressDto dto,
        Guid currentUserId)
    {
        var address =
            await _addressRepository.GetByIdAsync(addressId);

        if (address == null || address.UserId != currentUserId)
            throw new InvalidOperationException("Address not found.");

        if (dto.IsDefault)
        {
            var addresses =
                await _addressRepository.GetByUserIdAsync(currentUserId);

            foreach (var a in addresses)
            {
                a.IsDefault = false;
            }
        }

        address.FullName = dto.FullName;
        address.PhoneNumber = dto.PhoneNumber;
        address.AddressLine1 = dto.AddressLine1;
        address.AddressLine2 = dto.AddressLine2;
        address.City = dto.City;
        address.State = dto.State;
        address.PostalCode = dto.PostalCode;
        address.Country = dto.Country;
        address.IsDefault = dto.IsDefault;
        address.UpdatedAt = DateTime.UtcNow;

        await _addressRepository.SaveChangesAsync();

        return MapToDto(address);
    }

    public async Task DeleteAsync(
        Guid addressId,
        Guid currentUserId)
    {
        var address =
            await _addressRepository.GetByIdAsync(addressId);

        if (address == null || address.UserId != currentUserId)
            throw new InvalidOperationException("Address not found.");

        _addressRepository.Delete(address);

        await _addressRepository.SaveChangesAsync();
    }

    private static AddressDto MapToDto(Address address)
    {
        return new AddressDto
        {
            Id = address.Id,
            FullName = address.FullName,
            PhoneNumber = address.PhoneNumber,
            AddressLine1 = address.AddressLine1,
            AddressLine2 = address.AddressLine2,
            City = address.City,
            State = address.State,
            PostalCode = address.PostalCode,
            Country = address.Country,
            IsDefault = address.IsDefault
        };
    }
}