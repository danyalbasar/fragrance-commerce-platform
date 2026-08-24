using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FragranceCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class SiteSettingsController : ControllerBase
{
    private readonly ISiteSettingsService _settingsService;

    public SiteSettingsController(ISiteSettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet]
    public async Task<ActionResult<List<SiteSettingDto>>> GetAll()
    {
        var settings = await _settingsService.GetAllAsync();
        return Ok(settings);
    }

    [HttpGet("{key}")]
    public async Task<ActionResult<SiteSettingDto>> GetByKey(string key)
    {
        var setting = await _settingsService.GetByKeyAsync(key);
        if (setting == null) return NotFound();
        return Ok(setting);
    }

    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<ActionResult<Dictionary<string, string>>> GetPublicSettings()
    {
        var keys = new[]
        {
            "active_theme", "hero_image_url", "hero_title", "hero_subtitle",
            "hero_cta_text", "hero_cta_link", "hero_secondary_cta_text", "hero_secondary_cta_link",
            "category_panel_1_image", "category_panel_1_eyebrow", "category_panel_1_title",
            "category_panel_1_text", "category_panel_1_link", "category_panel_1_cta",
            "category_panel_2_image", "category_panel_2_eyebrow", "category_panel_2_title",
            "category_panel_2_text", "category_panel_2_link", "category_panel_2_cta",
            "product_banner_image", "product_banner_title", "product_banner_text",
            "available_genders", "house_brands"
        };

        var settings = await _settingsService.GetSettingsAsync(keys);
        return Ok(settings);
    }

    [HttpPut("{key}")]
    public async Task<IActionResult> Update(string key, UpdateSiteSettingDto dto)
    {
        await _settingsService.UpdateAsync(key, dto.Value, dto.Description);
        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<SiteSettingDto>> Upsert(UpsertSiteSettingDto dto)
    {
        await _settingsService.UpsertAsync(dto.Key, dto.Value, dto.Description);
        var setting = await _settingsService.GetByKeyAsync(dto.Key);
        return Ok(setting);
    }
}
