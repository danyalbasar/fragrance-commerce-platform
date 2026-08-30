using System.Security.Claims;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PaymentDto>> GetById(Guid id)
    {
        var payment = await _paymentService.GetByIdAsync(id);

        if (payment == null)
            return NotFound();

        return Ok(payment);
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<PaymentDto>> UpdateStatus(
        Guid id,
        UpdatePaymentStatusDto dto)
    {
        try
        {
            var payment = await _paymentService.UpdateStatusAsync(id, dto);

            return Ok(payment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/razorpay/order")]
    public async Task<ActionResult<RazorpayOrderDto>> CreateRazorpayOrder(Guid id)
    {
        try
        {
            var order = await _paymentService.CreateRazorpayOrderAsync(
                id,
                GetCurrentUserId());

            return Ok(order);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status401Unauthorized, ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("razorpay/verify")]
    public async Task<ActionResult<PaymentDto>> VerifyRazorpayPayment(
        VerifyRazorpayPaymentDto dto)
    {
        try
        {
            var payment = await _paymentService.VerifyRazorpayPaymentAsync(
                dto,
                GetCurrentUserId());

            return Ok(payment);
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