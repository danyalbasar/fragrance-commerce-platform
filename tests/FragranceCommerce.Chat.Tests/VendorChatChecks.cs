using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text.Json;
using FragranceCommerce.Api.Controllers;
using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Enums;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Services;
using FragranceCommerce.Api.Settings;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Threading.RateLimiting;

static class VendorChatChecks
{
    public static async Task RunAsync()
    {
        var alphaUser = Guid.NewGuid();
        var betaUser = Guid.NewGuid();
        var alpha = new Vendor { UserId = alphaUser, BusinessName = "Alpha", Address = "PRIVATE-VENDOR-ADDRESS" };
        var beta = new Vendor { UserId = betaUser, BusinessName = "BETA-PRIVATE-BUSINESS" };
        var alphaProduct = new Product { VendorId = alpha.Id, Vendor = alpha, Name = "Alpha perfume", Status = ProductStatus.Active };
        var betaProduct = new Product { VendorId = beta.Id, Vendor = beta, Name = "BETA-SECRET-PRODUCT", Status = ProductStatus.Active };
        var alphaSku = new ProductVariant { ProductId = alphaProduct.Id, Product = alphaProduct, SKU = "ALPHA-OWN", VariantName = "30ml", StockQuantity = 3, SellingPrice = 100, CostPrice = 25 };
        var alphaInactive = new ProductVariant { ProductId = alphaProduct.Id, Product = alphaProduct, SKU = "ALPHA-INACTIVE", VariantName = "50ml", StockQuantity = 10, SellingPrice = 200, CostPrice = 20, IsActive = false };
        var betaSku = new ProductVariant { ProductId = betaProduct.Id, Product = betaProduct, SKU = "BETA-SECRET-SKU", StockQuantity = 99, SellingPrice = 1000, CostPrice = 300 };
        var now = new DateTime(2026, 10, 13, 10, 0, 0, DateTimeKind.Utc);
        var shared = Order("SHARED-DELIVERED", OrderStatus.Delivered, now.AddDays(-2));
        var pending = Order("SHARED-PENDING", OrderStatus.Pending, now.AddDays(-1));
        var old = Order("ALPHA-OLD", OrderStatus.Delivered, now.AddDays(-90));
        var cancelled = Order("ALPHA-CANCELLED", OrderStatus.Cancelled, now.AddDays(-3));
        var betaOnly = Order("BETA-SECRET-ORDER", OrderStatus.Delivered, now.AddDays(-1));
        var future = Order("ALPHA-FUTURE", OrderStatus.Delivered, now.AddDays(1));
        AddItem(shared, alphaSku, 2, 100);
        AddItem(shared, betaSku, 7, 1000);
        AddItem(pending, alphaSku, 4, 90);
        AddItem(pending, betaSku, 1, 2000);
        AddItem(old, alphaSku, 1, 50);
        AddItem(cancelled, alphaSku, 1, 100);
        AddItem(betaOnly, betaSku, 1, 1000);
        AddItem(future, alphaSku, 100, 100);

        var database = "vendor-chat-" + Guid.NewGuid();
        var root = new InMemoryDatabaseRoot();
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(database, root).Options;
        await using var context = new ApplicationDbContext(options);
        context.AddRange(alpha, beta, alphaProduct, betaProduct, alphaSku, alphaInactive, betaSku);
        context.AddRange(shared, pending, old, cancelled, betaOnly, future);
        await context.SaveChangesAsync();
        var clock = new FixtureClock(now);
        var provider = new VendorChatDataProvider(context, clock);
        var snapshot = await provider.GetSnapshotAsync(alphaUser, "Stock for Alpha perfume", "30days", CancellationToken.None);
        Check(snapshot.DeliveredItemSales == 200 && snapshot.DeliveredUnits == 2, "Shared orders must contribute only the signed-in vendor's delivered items.");
        Check(snapshot.TotalOrders == 3 && snapshot.OrderCounts["Pending"] == 1 && snapshot.OrderCounts["Cancelled"] == 1,
            "Orders must count once and exclude other vendors, old records, and future records.");
        Check(snapshot.TotalSkus == 2 && snapshot.TotalStockUnits == 13 && snapshot.InventoryAtRecordedCost == 275,
            "Inventory must include only owned SKUs and their recorded cost.");
        Check(snapshot.ActiveLowStockSkus == 1 && snapshot.LowStock.Single().Sku == "ALPHA-OWN", "Low-stock alerts must use active owned SKUs.");
        Check(snapshot.MatchingInventory.Count == 2 && snapshot.TopSellers.Single().GrossSales == 200, "Matching inventory and top sellers must remain scoped.");
        Check(snapshot.RecentOrders.Single(o => o.OrderNumber == "SHARED-DELIVERED").VendorItemAmount == 200,
            "A mixed-vendor order must never disclose its full basket amount.");
        var serialized = JsonSerializer.Serialize(snapshot);
        Check(!serialized.Contains("BETA-SECRET") && !serialized.Contains("PRIVATE-VENDOR") && !serialized.Contains("PRIVATE-CUSTOMER"),
            "Other vendors and customer identities must not enter the snapshot.");
        var allTime = await provider.GetSnapshotAsync(alphaUser, "Overview", "all", CancellationToken.None);
        Check(allTime.DeliveredItemSales == 250 && allTime.TotalOrders == 4, "All-time sales must include old delivered items and exclude future ones.");
        var other = await provider.GetSnapshotAsync(betaUser, "Overview", "30days", CancellationToken.None);
        Check(other.DeliveredItemSales == 8000 && other.TotalStockUnits == 99, "Each vendor must get independent totals.");
        var foreignSearch = await provider.GetSnapshotAsync(alphaUser, "BETA SECRET SKU", "30days", CancellationToken.None);
        Check(foreignSearch.MatchingInventory.Count == 0, "Searching for another vendor's SKU must not expand ownership scope.");
        var today = VendorChatPeriods.Resolve("today", now);
        Check(today.From == new DateTime(2026, 10, 12, 18, 30, 0, DateTimeKind.Utc), "Today must begin at India midnight.");
        var yesterday = VendorChatPeriods.Resolve("yesterday", now);
        Check(yesterday.To == today.From && yesterday.From == today.From.Value.AddDays(-1), "Yesterday must have an exclusive end boundary.");
        var emptyVendor = new Vendor { UserId = Guid.NewGuid(), BusinessName = "Empty" };
        context.Add(emptyVendor);
        await context.SaveChangesAsync();
        var empty = await provider.GetSnapshotAsync(emptyVendor.UserId, "Overview", "30days", CancellationToken.None);
        Check(empty.DeliveredItemSales == 0 && empty.TotalOrders == 0 && empty.TotalStockUnits == 0, "New vendors must have zero totals, not fabricated history.");

        // Run the real controller, authorization middleware, EF provider, and AI request against an isolated HTTP host.
        var builder = WebApplication.CreateBuilder();
        builder.Logging.ClearProviders();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.AddControllers().AddApplicationPart(typeof(VendorChatController).Assembly);
        builder.Services.AddAuthentication("VendorFixture").AddScheme<AuthenticationSchemeOptions, VendorFixtureAuth>("VendorFixture", null);
        builder.Services.AddAuthorization();
        builder.Services.AddRateLimiter(o => o.AddPolicy("ChatPerIp", _ => RateLimitPartition.GetNoLimiter("fixture")));
        builder.Services.AddDbContext<ApplicationDbContext>(o => o.UseInMemoryDatabase(database, root));
        builder.Services.AddSingleton<TimeProvider>(clock);
        builder.Services.AddScoped<IVendorChatDataProvider, VendorChatDataProvider>();
        builder.Services.Configure<ChatbotSettings>(s =>
        {
            s.Provider = "cloudflare";
            s.CloudflareAccountId = "0123456789abcdef0123456789abcdef";
            s.CloudflareApiToken = "fixture-token-only";
        });
        var handler = new FakeHandler(HttpStatusCode.OK, "{\"success\":true,\"result\":{\"response\":\"Review your recorded business figures below.\"}}");
        builder.Services.AddHttpClient<IVendorChatService, VendorChatService>().ConfigurePrimaryHttpMessageHandler(() => handler);
        await using var app = builder.Build();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseRateLimiter();
        app.MapControllers();
        await app.StartAsync();
        var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.Single();
        using var client = new HttpClient { BaseAddress = new Uri(address) };
        Check((await client.PostAsJsonAsync("/api/vendor/chat", new { message = "Overview" })).StatusCode == HttpStatusCode.Unauthorized,
            "Anonymous requests must be rejected.");
        Check((await Send(client, alphaUser, "Customer", new { message = "Overview" })).StatusCode == HttpStatusCode.Forbidden,
            "Customer accounts must be rejected even if they know a vendor ID.");
        Check(handler.Calls == 0, "Rejected users must never reach the model.");
        var response = await Send(client, alphaUser, "Vendor", new { message = "Overview", period = "30days", vendorId = beta.Id, userId = betaUser });
        Check(response.IsSuccessStatusCode, "The vendor endpoint must succeed for its owner.");
        Check(response.Headers.CacheControl?.NoStore == true, "Private business replies must not be cached.");
        var result = await response.Content.ReadFromJsonAsync<VendorChatResponseDto>();
        Check(result!.VendorData.DeliveredItemSales == 200 && result.VendorData.TotalStockUnits == 13,
            "Client-supplied ownership IDs must be ignored in favor of signed-in claims.");
        using (var payload = JsonDocument.Parse(handler.Body!))
        {
            var system = payload.RootElement.GetProperty("messages")[0].GetProperty("content").GetString()!;
            var suppliedData = payload.RootElement.GetProperty("messages")[1].GetProperty("content").GetString()!;
            Check(system.Contains("read-only business assistant") && system.Contains("not profit"), "Vendor prompts must define scope and sales semantics.");
            Check(!suppliedData.Contains("BETA-SECRET") && !suppliedData.Contains("PRIVATE-CUSTOMER"), "AI context must exclude unrelated private data.");
        }
        var calls = handler.Calls;
        Check((await Send(client, Guid.NewGuid(), "Vendor", new { message = "Overview" })).StatusCode == HttpStatusCode.NotFound,
            "A missing vendor profile must fail before inference.");
        Check((await Send(client, alphaUser, "Vendor", new { message = "Overview", period = "last-year" })).StatusCode == HttpStatusCode.BadRequest,
            "Unsupported periods must fail validation.");
        Check((await Send(client, alphaUser, "Vendor", new { message = new string('a', 601) })).StatusCode == HttpStatusCode.BadRequest,
            "Oversized vendor prompts must fail validation.");
        Check(handler.Calls == calls, "Invalid requests must not consume inference.");
        await app.StopAsync();
        Console.WriteLine("Vendor isolation, shared-order totals, date windows, privacy, and authenticated HTTP checks passed.");
    }

    private static Order Order(string number, OrderStatus status, DateTime at) => new()
    {
        OrderNumber = number, Status = status, OrderedAt = at, TotalAmount = 77777, FinalAmount = 66666,
        User = new User { FirstName = "PRIVATE-CUSTOMER", LastName = "NAME", Email = "PRIVATE-CUSTOMER@example.test", PasswordHash = "fixture-only" }
    };
    private static void AddItem(Order order, ProductVariant sku, int quantity, decimal price) => order.Items.Add(new OrderItem
    {
        OrderId = order.Id, Order = order, ProductVariantId = sku.Id, ProductVariant = sku, Quantity = quantity, UnitPrice = price
    });
    private static async Task<HttpResponseMessage> Send(HttpClient client, Guid userId, string role, object body)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/vendor/chat") { Content = JsonContent.Create(body) };
        request.Headers.Add("X-Fixture-User", userId.ToString());
        request.Headers.Add("X-Fixture-Role", role);
        return await client.SendAsync(request);
    }
    private static void Check(bool success, string message) { if (!success) throw new Exception(message); }
}

sealed class FixtureClock(DateTime now) : TimeProvider
{
    public override DateTimeOffset GetUtcNow() => new(now);
}

// Test-only authentication; this handler is never registered in the product API.
sealed class VendorFixtureAuth(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("X-Fixture-User", out var user)) return Task.FromResult(AuthenticateResult.NoResult());
        var identity = new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, user.ToString()),
            new Claim(ClaimTypes.Role, Request.Headers["X-Fixture-Role"].ToString())], Scheme.Name);
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), Scheme.Name)));
    }
}
