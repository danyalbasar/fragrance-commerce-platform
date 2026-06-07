using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet("public")]
    public IActionResult Public()
    {
        return Ok("Everyone can access this.");
    }

    [Authorize]
    [HttpGet("authenticated")]
    public IActionResult Authenticated()
    {
        return Ok("You are authenticated.");
    }

    [Authorize(Roles = "Customer")]
    [HttpGet("customer")]
    public IActionResult Customer()
    {
        return Ok("Customer access granted.");
    }

    [Authorize(Roles = "Vendor")]
    [HttpGet("vendor")]
    public IActionResult Vendor()
    {
        return Ok("Vendor access granted.");
    }
}