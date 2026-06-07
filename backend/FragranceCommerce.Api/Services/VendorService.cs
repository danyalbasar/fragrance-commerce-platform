using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Services;

public class VendorService : IVendorService
{
    private readonly IVendorRepository _vendorRepository;
    private readonly ApplicationDbContext _context;

    public VendorService(
        IVendorRepository vendorRepository,
        ApplicationDbContext context)
    {
        _vendorRepository = vendorRepository;
        _context = context;
    }

    public async Task<VendorDto> CreateAsync(CreateVendorDto dto, Guid currentUserId)
    {
        var existingVendor = await _vendorRepository.GetByUserIdAsync(currentUserId);

        if (existingVendor != null)
            throw new InvalidOperationException("Vendor profile already exists.");

        var vendor = new Vendor
        {
            UserId = currentUserId,
            BusinessName = dto.BusinessName,
            GSTNumber = dto.GSTNumber,
            Address = dto.Address,
            IsApproved = true
        };

        await _vendorRepository.AddAsync(vendor);

        var vendorRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Vendor");

        if (vendorRole == null)
            throw new InvalidOperationException("Vendor role not found.");

        var alreadyVendorRole = await _context.UserRoles
            .AnyAsync(ur => ur.UserId == currentUserId && ur.RoleId == vendorRole.Id);

        if (!alreadyVendorRole)
        {
            _context.UserRoles.Add(new UserRole
            {
                UserId = currentUserId,
                RoleId = vendorRole.Id
            });
        }

        await _vendorRepository.SaveChangesAsync();

        return new VendorDto
        {
            Id = vendor.Id,
            UserId = vendor.UserId,
            BusinessName = vendor.BusinessName,
            GSTNumber = vendor.GSTNumber,
            Address = vendor.Address,
            IsApproved = vendor.IsApproved
        };
    }
}