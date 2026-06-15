using System.Security.Claims;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/vendor/dashboard")]
[Authorize(Roles = "Vendor")]
public class VendorDashboardController : ControllerBase
{
    private readonly IVendorDashboardService _vendorDashboardService;

    public VendorDashboardController(
        IVendorDashboardService vendorDashboardService)
    {
        _vendorDashboardService = vendorDashboardService;
    }

    [HttpGet]
    public async Task<ActionResult<VendorDashboardDto>> GetDashboard()
    {
        try
        {
            var currentUserId = GetCurrentUserId();

            var dashboard = await _vendorDashboardService.GetDashboardAsync(currentUserId);

            return Ok(dashboard);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            throw new UnauthorizedAccessException();

        return Guid.Parse(userIdClaim.Value);
    }
}