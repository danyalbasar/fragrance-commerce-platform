using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandsController : ControllerBase
{
    private readonly IBrandService _brandService;

    public BrandsController(IBrandService brandService)
    {
        _brandService = brandService;
    }

    [HttpGet]
    public async Task<ActionResult<List<BrandDto>>> GetBrands()
    {
        var brands = await _brandService.GetAllAsync();
        return Ok(brands);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BrandDto>> GetBrand(Guid id)
    {
        var brand = await _brandService.GetByIdAsync(id);

        if (brand == null)
            return NotFound();

        return Ok(brand);
    }

    [HttpPost]
    public async Task<ActionResult<BrandDto>> CreateBrand(CreateBrandDto dto)
    {
        try
        {
            var brand = await _brandService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetBrand), new { id = brand.Id }, brand);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBrand(Guid id, UpdateBrandDto dto)
    {
        var updated = await _brandService.UpdateAsync(id, dto);

        if (!updated)
            return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBrand(Guid id)
    {
        var deleted = await _brandService.DeleteAsync(id);

        if (!deleted)
            return NotFound();

        return NoContent();
    }
}