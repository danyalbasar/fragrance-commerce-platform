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
            ["cta_button_link"] = ("/products", "Bottom CTA button link"),
            ["product_trust_badges"] = (JsonSerializer.Serialize(new[] { "100% authentic products", "Free shipping on eligible orders", "Secure payments", "Easy returns and support" }), "Product page trust badge texts (JSON array)"),
            ["product_shipping_text"] = ("Orders are packed carefully and shipped securely. Return and exchange rules can be added here later.", "Product page shipping & returns text"),
            ["pdp_banner_image"] = ("/home/home-ritual.jpg", "Product detail page banner image"),
            ["pdp_banner_title"] = ("A storefront for house labels that still feels tactile.", "Product detail page banner title"),
            ["pdp_banner_subtitle"] = ("The collection is staged like a real luxury catalogue: restrained navigation, visual hierarchy, product-led imagery, and clear paths into fragrance or skincare.", "Product detail page banner subtitle"),
            ["products_page_banner_image"] = ("/home/home-fragrance.jpg", "Products listing page banner image"),
            ["products_page_title"] = ("Discover the Collection", "Products listing page title"),
            ["products_page_subtitle"] = ("Browse perfumes, attars, skincare, and daily essentials from the private house labels.", "Products listing page subtitle"),

            // Contact page
            ["contact_heading"] = ("Contact us", "Contact page heading"),
            ["contact_description"] = ("Reach out for help with orders, product selection, account questions, or delivery support.", "Contact page description"),
            ["contact_email"] = ("care@fragrancehouse.test", "Contact page email address"),
            ["contact_phone"] = ("+91 98765 43210", "Contact page phone number"),
            ["contact_address"] = ("Bandra West, Mumbai, Maharashtra", "Contact page studio address"),
            ["contact_response_text"] = ("Most messages are reviewed within one business day. Include your order number if your message is about a purchase.", "Contact page response time text"),

            // FAQ page
            ["faq_eyebrow"] = ("Help", "FAQ page eyebrow text"),
            ["faq_title"] = ("Frequently asked questions", "FAQ page title"),
            ["faq_intro"] = ("Quick answers for shopping, ordering, wishlist, delivery, and account questions.", "FAQ page intro"),
            ["faq_sections"] = (JsonSerializer.Serialize(new[] { new { question = "How do I choose a product?", answer = "Use category, gender, brand, and price filters on the products page. Product detail pages include sizes, descriptions, reviews, and similar recommendations." }, new { question = "Can I save products?", answer = "Yes. Sign in and use the heart icon to save products to your wishlist, then move them to cart when you are ready." }, new { question = "How do I track orders?", answer = "After signing in, open the orders page from your account or footer link to view your purchase archive and order status." }, new { question = "What if my product arrives damaged?", answer = "Contact support with your order number and clear photos of the package and product so the issue can be reviewed." } }), "FAQ sections (JSON array of objects with question+answer)"),

            // Privacy Policy
            ["privacy_eyebrow"] = ("Privacy", "Privacy policy page eyebrow"),
            ["privacy_title"] = ("Privacy policy", "Privacy policy page title"),
            ["privacy_intro"] = ("This policy explains how customer information is used to run the storefront, process orders, and support account activity.", "Privacy policy page intro"),
            ["privacy_sections"] = (JsonSerializer.Serialize(new[] { new { title = "Information We Collect", body = "We may collect account details, contact information, delivery addresses, cart activity, wishlist activity, payment status, and order history." }, new { title = "How We Use It", body = "Information is used to process orders, manage deliveries, provide support, improve the catalogue experience, prevent misuse, and maintain secure account access." }, new { title = "Data Sharing", body = "Order and delivery details may be shared with service providers involved in payment, fulfilment, shipping, hosting, analytics, or customer support." }, new { title = "Your Choices", body = "You can update account information, manage saved addresses, and contact support for reasonable requests about your stored customer data." } }), "Privacy policy sections (JSON array of objects with title+body)"),

            // Return Policy
            ["return_eyebrow"] = ("Returns", "Return policy page eyebrow"),
            ["return_title"] = ("Return policy", "Return policy page title"),
            ["return_intro"] = ("Returns and exchanges are handled carefully to protect product quality, hygiene, and customer satisfaction.", "Return policy page intro"),
            ["return_sections"] = (JsonSerializer.Serialize(new[] { new { title = "Return Window", body = "Eligible return requests should be raised soon after delivery. Include the order number, product name, reason, and clear photos when relevant." }, new { title = "Condition", body = "Products should be unused, unopened, and returned with original packaging unless the item arrived damaged, incorrect, or defective." }, new { title = "Non-Returnable Items", body = "Opened fragrance, skincare, cosmetic, or hygiene-sensitive products may not qualify for return unless there is a verified issue with the order." }, new { title = "Refunds and Exchanges", body = "Approved returns may be resolved through replacement, exchange, store credit, or refund depending on the order issue and product condition." } }), "Return policy sections (JSON array of objects with title+body)"),

            // Terms & Conditions
            ["terms_eyebrow"] = ("Terms", "Terms and conditions page eyebrow"),
            ["terms_title"] = ("Terms and conditions", "Terms and conditions page title"),
            ["terms_intro"] = ("These terms outline the basic rules for browsing, purchasing, and using the Fragrance Commerce storefront.", "Terms and conditions page intro"),
            ["terms_sections"] = (JsonSerializer.Serialize(new[] { new { title = "Use of Website", body = "Customers agree to use the website lawfully, provide accurate account and delivery information, and avoid activity that disrupts the store or its services." }, new { title = "Product Information", body = "Product details, prices, images, availability, and offers may be updated as the catalogue changes. We aim to keep listings accurate and clear." }, new { title = "Orders and Payments", body = "Orders are confirmed after successful checkout and payment validation. We may contact customers if information is incomplete or verification is required." }, new { title = "Changes to Terms", body = "These terms may be revised as store operations, products, services, or legal requirements change." } }), "Terms and conditions sections (JSON array of objects with title+body)"),

            // Login page
            ["login_brand_title"] = ("Welcome back to your luxury fragrance account.", "Login page brand panel title"),
            ["login_brand_description"] = ("Sign in to revisit your wishlist, orders, and carefully selected fragrance rituals.", "Login page brand panel description"),

            // Signup page
            ["signup_brand_title"] = ("Begin your fragrance ritual.", "Signup page brand panel title"),
            ["signup_brand_description"] = ("Create an account to track orders, save favourites, and discover the private house collection.", "Signup page brand panel description"),

            // 404 page
            ["not_found_title"] = ("The scent you've been searching for has evaporated.", "404 page headline"),
            ["not_found_description"] = ("Perhaps the fragrance house has moved to a new location, or the page has drifted into the mist. Our private collection awaits your return.", "404 page description")
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
