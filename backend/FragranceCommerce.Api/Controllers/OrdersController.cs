using System.Security.Claims;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder(CreateOrderDto dto)
    {
        try
        {
            var currentUserId = GetCurrentUserId();

            var order = await _orderService.CreateOrderAsync(dto, currentUserId);

            return Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetMyOrders()
    {
        var currentUserId = GetCurrentUserId();

        var orders = await _orderService.GetMyOrdersAsync(currentUserId);

        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrder(Guid id)
    {
        var currentUserId = GetCurrentUserId();

        var order = await _orderService.GetByIdAsync(
            id,
            currentUserId);

        if (order == null)
            return NotFound();

        return Ok(order);
    }

    [Authorize(Roles = "Vendor,Admin,SuperAdmin")]
    [HttpPut("{id}/status")]
    public async Task<ActionResult<OrderDto>> UpdateStatus(
        Guid id,
        UpdateOrderStatusDto dto)
    {
        try
        {
            var order = await _orderService.UpdateStatusAsync(id, dto);
            return Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<OrderDto>> CancelOrder(Guid id)
    {
        try
        {
            var currentUserId = GetCurrentUserId();

            var order = await _orderService.CancelOrderAsync(id, currentUserId);

            return Ok(order);
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