using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/images")]
[Authorize(Roles = "Vendor,Admin,SuperAdmin")]
public class ImageUploadController : ControllerBase
{
    private readonly IImageUploadService _imageUploadService;

    public ImageUploadController(IImageUploadService imageUploadService)
    {
        _imageUploadService = imageUploadService;
    }

    [HttpPost("upload")]
    public async Task<ActionResult<string>> UploadImage(IFormFile file)
    {
        try
        {
            var imageUrl = await _imageUploadService.UploadImageAsync(file);

            return Ok(new {
                imageUrl
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}