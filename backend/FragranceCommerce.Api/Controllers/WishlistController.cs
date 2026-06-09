using System.Security.Claims;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly IWishlistService _wishlistService;

    public WishlistController(IWishlistService wishlistService)
    {
        _wishlistService = wishlistService;
    }

    [HttpGet]
    public async Task<ActionResult<WishlistDto>> GetWishlist()
    {
        var currentUserId = GetCurrentUserId();

        var wishlist = await _wishlistService
            .GetWishlistAsync(currentUserId);

        return Ok(wishlist);
    }

    [HttpPost("{productId}")]
    public async Task<IActionResult> AddToWishlist(Guid productId)
    {
        try
        {
            var currentUserId = GetCurrentUserId();

            await _wishlistService.AddAsync(
                productId,
                currentUserId);

            return Ok("Product added to wishlist.");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{productId}")]
    public async Task<IActionResult> RemoveFromWishlist(Guid productId)
    {
        try
        {
            var currentUserId = GetCurrentUserId();

            await _wishlistService.RemoveAsync(
                productId,
                currentUserId);

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            throw new UnauthorizedAccessException();

        return Guid.Parse(userIdClaim.Value);
    }
}