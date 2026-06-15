using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface IVendorDashboardService
{
    Task<VendorDashboardDto> GetDashboardAsync(Guid currentUserId);
}