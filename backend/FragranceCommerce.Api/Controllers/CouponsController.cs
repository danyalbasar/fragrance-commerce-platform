using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class CouponsController : ControllerBase
{
    private readonly ICouponService _couponService;

    public CouponsController(ICouponService couponService)
    {
        _couponService = couponService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CouponDto>>> GetAll()
    {
        return Ok(await _couponService.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CouponDto>> GetById(Guid id)
    {
        var coupon = await _couponService.GetByIdAsync(id);

        if (coupon == null)
            return NotFound();

        return Ok(coupon);
    }

    [HttpPost]
    public async Task<ActionResult<CouponDto>> Create(
        CreateCouponDto dto)
    {
        try
        {
            var coupon = await _couponService.CreateAsync(dto);

            return Ok(coupon);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CouponDto>> Update(
        Guid id,
        UpdateCouponDto dto)
    {
        try
        {
            var coupon = await _couponService.UpdateAsync(id, dto);

            return Ok(coupon);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _couponService.DeleteAsync(id);

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}