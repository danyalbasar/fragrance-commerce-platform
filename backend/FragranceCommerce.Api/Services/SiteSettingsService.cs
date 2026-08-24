using System.Text.Json;
using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Services;

public class SiteSettingsService : ISiteSettingsService
{
    private readonly ApplicationDbContext _context;

    public SiteSettingsService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<DTOs.SiteSettingDto>> GetAllAsync()
    {
        return await _context.SiteSettings
            .OrderBy(s => s.Key)
            .Select(s => new DTOs.SiteSettingDto
            {
                Id = s.Id,
                Key = s.Key,
                Value = s.Value,
                Description = s.Description
            })
            .ToListAsync();
    }

    public async Task<DTOs.SiteSettingDto?> GetByKeyAsync(string key)
    {
        var setting = await _context.SiteSettings
            .FirstOrDefaultAsync(s => s.Key == key);

        if (setting == null) return null;

        return new DTOs.SiteSettingDto
        {
            Id = setting.Id,
            Key = setting.Key,
            Value = setting.Value,
            Description = setting.Description
        };
    }

    public async Task<Dictionary<string, string>> GetSettingsAsync(IEnumerable<string> keys)
    {
        var keyList = keys.ToList();
        return await _context.SiteSettings
            .Where(s => keyList.Contains(s.Key))
            .ToDictionaryAsync(s => s.Key, s => s.Value);
    }

    public async Task UpdateAsync(string key, string value, string? description = null)
    {
        var setting = await _context.SiteSettings
            .FirstOrDefaultAsync(s => s.Key == key);

        if (setting == null)
        {
            setting = new SiteSetting { Key = key, Value = value, Description = description };
            _context.SiteSettings.Add(setting);
        }
        else
        {
            setting.Value = value;
            if (description != null) setting.Description = description;
            setting.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    public async Task UpsertAsync(string key, string value, string? description = null)
    {
        await UpdateAsync(key, value, description);
    }

    public async Task SeedDefaultsAsync()
    {
        var defaults = new Dictionary<string, (string Value, string? Description)>
        {
            ["active_theme"] = ("classic-gold", "Active site theme identifier"),
            ["hero_image_url"] = ("/home/home-hero.jpg", "Homepage hero background image URL"),
            ["hero_title"] = ("Scent, skincare, and ritual objects for a polished life.", "Homepage hero title"),
            ["hero_subtitle"] = ("Explore private house labels, expressive perfumes, quiet skincare, and daily essentials staged for discovery.", "Homepage hero subtitle"),
            ["hero_cta_text"] = ("Shop Collection", "Homepage hero primary CTA text"),
            ["hero_cta_link"] = ("/products", "Homepage hero primary CTA link"),
            ["hero_secondary_cta_text"] = ("Discover Scents", "Homepage hero secondary CTA text"),
            ["hero_secondary_cta_link"] = ("/products?category=Perfume", "Homepage hero secondary CTA link"),
            ["category_panel_1_image"] = ("/home/home-fragrance.jpg", "Category panel 1 image"),
            ["category_panel_1_eyebrow"] = ("Fragrance Wardrobe", "Category panel 1 eyebrow"),
            ["category_panel_1_title"] = ("Perfumes, attars, and customised blends", "Category panel 1 title"),
            ["category_panel_1_text"] = ("From saffroned warmth to smoky cedar, build a scent wardrobe for workdays, evenings, and close rituals.", "Category panel 1 text"),
            ["category_panel_1_link"] = ("/products?category=Perfume", "Category panel 1 link"),
            ["category_panel_1_cta"] = ("Shop Fragrance", "Category panel 1 CTA"),
            ["category_panel_2_image"] = ("/home/home-skincare.jpg", "Category panel 2 image"),
            ["category_panel_2_eyebrow"] = ("Skin Rituals", "Category panel 2 eyebrow"),
            ["category_panel_2_title"] = ("Cleansers, creams, and polished care", "Category panel 2 title"),
            ["category_panel_2_text"] = ("Soft-focus skincare essentials designed to sit beautifully beside your fragrance collection.", "Category panel 2 text"),
            ["category_panel_2_link"] = ("/products?category=Face%20Wash", "Category panel 2 link"),
            ["category_panel_2_cta"] = ("Shop Skincare", "Category panel 2 CTA"),
            ["product_banner_image"] = ("/home/home-ritual.jpg", "Product page side banner image"),
            ["product_banner_title"] = ("A storefront for house labels that still feels tactile.", "Product page banner title"),
            ["product_banner_text"] = ("The collection is staged like a real luxury catalogue: restrained navigation, visual hierarchy, product-led imagery, and clear paths into fragrance or skincare.", "Product page banner text"),
            ["available_genders"] = (JsonSerializer.Serialize(new[] { "Men", "Women", "Unisex" }), "Available gender options (JSON array)"),
            ["house_brands"] = (JsonSerializer.Serialize(new[] { "Aurelian Atelier", "Nocturne Vale", "Mira Solace", "Vellum & Dew" }), "House brands shown on homepage (JSON array)"),
            ["value_bar_items"] = (JsonSerializer.Serialize(new[] { "Cloud-like skincare", "Amber-rich attars", "Genderless signatures", "Private house labels" }), "Value proposition bar items (JSON array)"),
            ["quote_text"] = ("A fragrance should be worn like a signature — quietly, deliberately, and entirely your own.", "Quote block text"),
            ["quote_attribution"] = ("The House Motto", "Quote block attribution"),
            ["featured_product_ids"] = ("[]", "Featured product IDs to show on homepage (JSON array of GUIDs, empty = auto)"),
            ["featured_section_title"] = ("Objects of desire.", "Featured collection section title"),
            ["featured_section_subtitle"] = ("A focused selection from the private labels now available in the store.", "Featured collection section subtitle"),
            ["house_promises"] = (JsonSerializer.Serialize(new[] { new { title = "Curated Discovery", text = "Shop by gender, category, or house without losing the boutique feel." }, new { title = "Quiet Product Detail", text = "Large visuals, variant choices, wishlist controls, and cart previews keep the flow focused." }, new { title = "Ritual Ready", text = "Fragrance and skincare now share one polished visual language across the store." } }), "House promises (JSON array of objects with title+text)"),
            ["newsletter_title"] = ("Letters from the house.", "Newsletter section title"),
            ["newsletter_subtitle"] = ("New releases, private previews, and quiet notes on the collection — sent only when there is something worth saying.", "Newsletter section subtitle"),
            ["cta_title"] = ("Find the next signature.", "Bottom CTA section title"),
            ["cta_subtitle"] = ("Browse perfumes, attars, customised blends, face washes, creams, and nail care from the new house catalogue.", "Bottom CTA section subtitle"),
            ["cta_button_text"] = ("Shop the Archive", "Bottom CTA button text"),
            ["cta_button_link"] = ("/products", "Bottom CTA button link")
        };

        foreach (var (key, (value, description)) in defaults)
        {
            if (!await _context.SiteSettings.AnyAsync(s => s.Key == key))
            {
                _context.SiteSettings.Add(new SiteSetting
                {
                    Key = key,
                    Value = value,
                    Description = description
                });
            }
        }

        await _context.SaveChangesAsync();
    }
}
