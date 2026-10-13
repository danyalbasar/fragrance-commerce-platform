using System.Net;
using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.Enums;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Services;
using FragranceCommerce.Api.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

static class CatalogRecommendationChecks
{
    public static async Task RunAsync()
    {
        await using var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase("catalog-recommendations-" + Guid.NewGuid()).Options);
        var perfume = new Category { Name = "Perfume" };
        var wash = new Category { Name = "Face Wash" };
        var brand = new Brand { Name = "Test house" };
        var fragrance = Product("Fresh Citrus", "Fresh green tea and clean citrus notes", perfume, 1234);
        fragrance.Images = [new ProductImage { ImageUrl = "https://res.cloudinary.com/test/secondary.png", DisplayOrder = 0 },
            new ProductImage { ImageUrl = "https://res.cloudinary.com/test/primary.png", DisplayOrder = 9, IsPrimary = true }];
        var variantOnly = Product("Clean Tea", "Light tea fragrance", perfume, 567);
        variantOnly.Variants.Single().Images = [new ProductVariantImage { ImageUrl = "https://res.cloudinary.com/test/variant.png", IsPrimary = true }];
        var skincare = Product("Fresh Citrus Wash", "Fresh green tea and clean light citrus", wash, 1);
        var draft = Product("Hidden Fresh Citrus", "Fresh citrus", perfume, 2); draft.Status = ProductStatus.Draft;
        var inactive = Product("Inactive Fresh Citrus", "Fresh citrus", perfume, 3); inactive.Variants.Single().IsActive = false;
        db.AddRange(fragrance, variantOnly, skincare, draft, inactive);
        await db.SaveChangesAsync();
        var catalog = new ChatCatalogProvider(db);
        var matches = await catalog.GetMatchesAsync("something for office use?", CancellationToken.None);
        Check(matches.Count == 2 && matches.All(p => p.CategoryName == "Perfume"), "Office recommendations must retrieve active fragrances rather than unrelated skincare or hidden records.");
        Check(matches[0].Name == "Fresh Citrus" && matches[0].Price == 1234 && matches[0].ImageUrl!.EndsWith("primary.png"), "Relevance, recorded prices, and primary photos must remain attached to the same product.");
        Check(matches.Single(p => p.Name == "Clean Tea").ImageUrl!.EndsWith("variant.png"), "Variant photos must be available when product photos are missing.");
        var upstream = new FakeHandler(HttpStatusCode.OK, "{\"success\":true,\"result\":{\"response\":\"Our Citrus Burst costs 850\"}}");
        var service = new ChatService(new HttpClient(upstream), catalog, Options.Create(new ChatbotSettings { Provider = "cloudflare" }));
        var reply = await service.ReplyAsync("something for office use?", CancellationToken.None);
        Check(reply.Products.Count == 2 && reply.Reply.Contains("Fresh Citrus") && reply.Reply.Contains("1,234") && !reply.Reply.Contains("Citrus Burst"), "Broad recommendations must use catalog facts rather than a hallucinated upstream product.");
        Check(reply.Source == "reviewed-reference" && !reply.Experimental && upstream.Calls == 0, "Catalog recommendations must not consume inference or accept invented product claims.");
        var unknown = await service.ReplyAsync("Price of nonexistent ZZZXYZ?", CancellationToken.None);
        Check(unknown.Products.Count == 0 && unknown.Reply.Contains("couldn't find") && upstream.Calls == 0, "An empty product lookup must say no match, never invent a product or price.");
        Check((await catalog.GetMatchesAsync("Explain the history of zzzxyz", CancellationToken.None)).Count == 0, "Unmatched education questions must not acquire arbitrary fallback recommendations.");
        Console.WriteLine("Office-use retrieval, category scope, product photos, and hallucinated recommendation regression checks passed.");

        Product Product(string name, string description, Category category, decimal price) => new()
        {
            Name = name, Description = description, Category = category, CategoryId = category.Id, Brand = brand, BrandId = brand.Id,
            Status = ProductStatus.Active, Variants = [new ProductVariant { SellingPrice = price, StockQuantity = 10 }]
        };
    }
    static void Check(bool value, string message) { if (!value) throw new Exception(message); }
}
