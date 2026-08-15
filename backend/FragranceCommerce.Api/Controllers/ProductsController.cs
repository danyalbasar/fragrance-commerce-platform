using System.Security.Claims;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductDto>>> GetProducts()
    {
        var products = await _productService.GetAllAsync();
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(Guid id)
    {
        var product = await _productService.GetByIdAsync(id);

        if (product == null)
            return NotFound();

        return Ok(product);
    }

    [Authorize(Roles = "Vendor")]
    [HttpGet("vendor")]
    public async Task<ActionResult<List<VendorProductDto>>> GetVendorProducts()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return Unauthorized();

            var currentUserId = Guid.Parse(userIdClaim.Value);

            var products = await _productService.GetVendorProductsAsync(currentUserId);

            return Ok(products);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Vendor")]
    [HttpPost]
    public async Task<ActionResult<VendorProductDto>> CreateProduct(CreateProductDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return Unauthorized();

            var currentUserId = Guid.Parse(userIdClaim.Value);

            var product = await _productService.CreateAsync(
                dto,
                currentUserId);

            return CreatedAtAction(
                nameof(GetProduct),
                new { id = product.Id },
                product);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Vendor")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(
        Guid id,
        UpdateProductDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return Unauthorized();

            var currentUserId = Guid.Parse(userIdClaim.Value);

            var updated = await _productService.UpdateAsync(
                id,
                dto,
                currentUserId);

            if (!updated)
                return NotFound();

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Vendor")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return Unauthorized();

            var currentUserId =
                Guid.Parse(userIdClaim.Value);

            var deleted = await _productService.DeleteAsync(
                id,
                currentUserId);

            if (!deleted)
                return NotFound();

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("search")]
    public async Task<ActionResult<PagedResultDto<ProductDto>>> SearchProducts(
        [FromQuery] ProductSearchRequestDto request)
    {
        var result = await _productService.SearchAsync(request);
        return Ok(result);
    }

    [Authorize(Roles = "Vendor")]
    [HttpPut("variants/{variantId}/stock")]
    public async Task<ActionResult<VendorProductVariantDto>> UpdateStock(
        Guid variantId,
        UpdateStockDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return Unauthorized();

            var currentUserId = Guid.Parse(userIdClaim.Value);

            var variant = await _productService.UpdateStockAsync(
                variantId,
                dto,
                currentUserId);

            return Ok(variant);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Vendor")]
    [HttpPut("variants/{variantId}")]
    public async Task<ActionResult<VendorProductVariantDto>> UpdateVariant(
        Guid variantId,
        UpdateProductVariantDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return Unauthorized();

            var currentUserId = Guid.Parse(userIdClaim.Value);

            var variant = await _productService.UpdateVariantAsync(
                variantId,
                dto,
                currentUserId);

            return Ok(variant);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Vendor")]
    [HttpPut("images/{imageId}")]
    public async Task<ActionResult<ProductImageDto>> UpdateProductImage(
        Guid imageId,
        UpdateImageMetadataDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return Unauthorized();

            var currentUserId = Guid.Parse(userIdClaim.Value);

            var image = await _productService.UpdateProductImageAsync(
                imageId,
                dto,
                currentUserId);

            return Ok(image);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Vendor")]
    [HttpPut("variants/images/{imageId}")]
    public async Task<ActionResult<ProductVariantImageDto>> UpdateVariantImage(
        Guid imageId,
        UpdateImageMetadataDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return Unauthorized();

            var currentUserId = Guid.Parse(userIdClaim.Value);

            var image = await _productService.UpdateVariantImageAsync(
                imageId,
                dto,
                currentUserId);

            return Ok(image);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Vendor")]
    [HttpPost("{productId}/images")]
    public async Task<ActionResult<ProductImageDto>> AddProductImage(
        Guid productId,
        IFormFile file,
        [FromForm] bool isPrimary,
        [FromForm] int displayOrder)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return Unauthorized();

            var currentUserId = Guid.Parse(userIdClaim.Value);

            var image = await _productService.AddProductImageAsync(
                productId,
                file,
                isPrimary,
                displayOrder,
                currentUserId);

            return Ok(image);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Vendor")]
    [HttpPost("variants/{variantId}/images")]
    public async Task<ActionResult<ProductVariantImageDto>> AddVariantImage(
        Guid variantId,
        IFormFile file,
        [FromForm] bool isPrimary,
        [FromForm] int displayOrder)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return Unauthorized();

            var currentUserId = Guid.Parse(userIdClaim.Value);

            var image = await _productService.AddVariantImageAsync(
                variantId,
                file,
                isPrimary,
                displayOrder,
                currentUserId);

            return Ok(image);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
