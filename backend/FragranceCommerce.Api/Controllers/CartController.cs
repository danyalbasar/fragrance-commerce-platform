using System.Security.Claims;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart()
    {
        var currentUserId = GetCurrentUserId();

        var cart = await _cartService.GetCartAsync(currentUserId);

        return Ok(cart);
    }

    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> AddItem(
        AddCartItemDto dto)
    {
        try
        {
            var currentUserId = GetCurrentUserId();

            var cart = await _cartService.AddItemAsync(
                dto,
                currentUserId);

            return Ok(cart);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("items/{id}")]
    public async Task<ActionResult<CartDto>> UpdateItem(
        Guid id,
        UpdateCartItemDto dto)
    {
        try
        {
            var currentUserId = GetCurrentUserId();

            var cart = await _cartService.UpdateItemAsync(
                id,
                dto,
                currentUserId);

            return Ok(cart);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("items/{id}")]
    public async Task<IActionResult> RemoveItem(Guid id)
    {
        var currentUserId = GetCurrentUserId();

        var removed = await _cartService.RemoveItemAsync(
            id,
            currentUserId);

        if (!removed)
            return NotFound();

        return NoContent();
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