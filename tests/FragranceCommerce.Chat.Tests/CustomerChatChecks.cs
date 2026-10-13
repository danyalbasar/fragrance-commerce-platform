using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.RateLimiting;
using FragranceCommerce.Api.Controllers;
using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Enums;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

static class CustomerChatChecks
{
    public static async Task RunAsync()
    {
        var owner = Guid.NewGuid();
        var otherUser = Guid.NewGuid();
        var product = new Product { Name = "Purchased perfume" };
        var sku = new ProductVariant { Product = product, ProductId = product.Id, VariantName = "50ml", SellingPrice = 900, CostPrice = 71 };
        var orders = Enumerable.Range(0, 7).Select(i => new Order
        {
            UserId = owner, OrderNumber = $"ORD-2026101300000{i}-1234", OrderedAt = DateTime.UtcNow.AddDays(-i),
            Status = OrderStatus.Shipped, TotalAmount = 250, DiscountAmount = 50, FinalAmount = 200,
            Items = [new OrderItem { ProductVariant = sku, ProductVariantId = sku.Id, Quantity = 2, UnitPrice = 125 }],
            ShippingAddress = new OrderAddress { FullName = "PRIVATE-NAME", AddressLine1 = "PRIVATE-ADDRESS", PhoneNumber = "PRIVATE-PHONE" },
            Payment = new Payment { PaymentStatus = PaymentStatus.Completed, TransactionId = "PRIVATE-TRANSACTION", GatewayOrderId = "PRIVATE-GATEWAY" }
        }).ToList();
        var foreign = new Order { UserId = otherUser, OrderNumber = "ORD-20261013010101-9876", FinalAmount = 87654 };
        var root = new InMemoryDatabaseRoot();
        var database = "customer-chat-" + Guid.NewGuid();
        await using (var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(database, root).Options))
        {
            db.AddRange(product, sku, foreign);
            db.AddRange(orders);
            await db.SaveChangesAsync();
        }
        var shopping = new CustomerShoppingFixture();
        var builder = WebApplication.CreateBuilder();
        builder.Logging.ClearProviders();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Services.AddControllers().AddApplicationPart(typeof(CustomerChatController).Assembly);
        builder.Services.AddAuthentication("VendorFixture").AddScheme<AuthenticationSchemeOptions, VendorFixtureAuth>("VendorFixture", null);
        builder.Services.AddAuthorization();
        builder.Services.AddRateLimiter(o => o.AddPolicy("ChatPerIp", _ => RateLimitPartition.GetNoLimiter("fixture")));
        builder.Services.AddDbContext<ApplicationDbContext>(o => o.UseInMemoryDatabase(database, root));
        builder.Services.AddSingleton<IChatService>(shopping);
        builder.Services.AddScoped<ICustomerChatService, CustomerChatService>();
        await using var app = builder.Build();
        app.UseAuthentication(); app.UseAuthorization(); app.UseRateLimiter(); app.MapControllers();
        await app.StartAsync();
        var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.Single();
        using var client = new HttpClient { BaseAddress = new Uri(address) };
        Check((await client.PostAsJsonAsync("/api/customer/chat", new { message = "My orders" })).StatusCode == HttpStatusCode.Unauthorized, "Anonymous customers must be rejected.");
        var response = await Send(owner, new { message = "My order history", userId = otherUser });
        Check(response.IsSuccessStatusCode && response.Headers.CacheControl?.NoStore == true, "Authenticated order replies must succeed without caching.");
        var reply = (await response.Content.ReadFromJsonAsync<CustomerChatResponseDto>())!;
        Check(reply.CustomerData!.TotalOrders == 7 && reply.CustomerData.Orders.Count == 5 && reply.CustomerData.HasMore, "History must page only the authenticated user's orders.");
        var first = reply.CustomerData.Orders.First();
        Check(first.Id == orders[0].Id && first.FinalAmount == 200 && first.DiscountAmount == 50 && first.Items.Single().UnitPrice == 125,
            "Replies must use recorded purchase prices and order discounts, not today's catalog prices.");
        var json = JsonSerializer.Serialize(reply);
        Check(!json.Contains("PRIVATE-") && !json.Contains(foreign.OrderNumber) && !json.Contains("87654"), "Order replies must exclude contact information, transactions, and other accounts.");
        var older = await Read(owner, new { message = "Show more order history", offset = 5 });
        Check(older.CustomerData!.Orders.Count == 2 && !older.CustomerData.HasMore, "Older history must page correctly.");
        var latest = await Read(owner, new { message = "What is the status of my latest order?" });
        Check(latest.CustomerData!.Orders.Single().Id == orders[0].Id, "Latest order must use the newest owned record.");
        var detail = await Read(owner, new { message = "Order details", orderId = orders[3].Id });
        Check(detail.CustomerData!.Orders.Single().Id == orders[3].Id && detail.Reply.Contains("Completed"), "Specific owned order details and payment status must be accessible.");
        var typed = await Read(owner, new { message = $"Where is {orders[2].OrderNumber}?" });
        Check(typed.CustomerData!.Orders.Single().Id == orders[2].Id, "Typed order references must resolve within the account.");
        foreach (var body in new object[] { new { message = "Order details", orderId = foreign.Id }, new { message = $"Details for {foreign.OrderNumber}" }, new { message = $"Details for {foreign.Id}" } })
        {
            var denied = await Read(owner, body);
            Check(denied.CustomerData!.Orders.Count == 0 && denied.Reply.Contains("couldn't find"), "Foreign IDs and references must never reveal another customer's order.");
        }
        var empty = await Read(Guid.NewGuid(), new { message = "My orders" });
        Check(empty.CustomerData!.TotalOrders == 0 && empty.CustomerData.Orders.Count == 0, "New customers must have empty history.");
        var cancel = await Read(owner, new { message = "Cancel my latest order" });
        Check(cancel.CustomerData!.Orders.Single().Status == "Shipped" && cancel.Reply.Contains("cannot cancel"), "Chat must be read-only.");
        Check(shopping.Calls == 0, "Order records must never be passed to the external shopping model.");
        var scent = await Read(owner, new { message = "What is attar?" });
        Check(scent.CustomerData == null && shopping.Calls == 1, "General fragrance questions must retain the shopping assistant without order context.");
        var policy = await Read(owner, new { message = "What is the shipping policy?" });
        Check(policy.CustomerData == null && shopping.Calls == 2, "Public policy questions must not retrieve private order history.");
        Check((await Send(owner, new { message = "My orders", offset = -1 })).StatusCode == HttpStatusCode.BadRequest, "Invalid paging must be rejected.");
        Check((await Send(owner, new { message = new string('a', 601) })).StatusCode == HttpStatusCode.BadRequest, "Oversized prompts must be rejected.");
        Check((await Send(Guid.Empty, new { message = "My orders" })).StatusCode == HttpStatusCode.Unauthorized, "Invalid authenticated claims must fail closed.");
        await app.StopAsync();
        Console.WriteLine("Customer HTTP authorization, order isolation, reference lookup, paging, recorded prices, and privacy checks passed.");

        async Task<HttpResponseMessage> Send(Guid user, object body)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "/api/customer/chat") { Content = JsonContent.Create(body) };
            request.Headers.Add("X-Fixture-User", user.ToString()); request.Headers.Add("X-Fixture-Role", "Customer");
            return await client.SendAsync(request);
        }
        async Task<CustomerChatResponseDto> Read(Guid user, object body)
        {
            using var result = await Send(user, body);
            Check(result.IsSuccessStatusCode, "Customer request must succeed.");
            return (await result.Content.ReadFromJsonAsync<CustomerChatResponseDto>())!;
        }
    }
    static void Check(bool ok, string message) { if (!ok) throw new Exception(message); }
}

sealed class CustomerShoppingFixture : IChatService
{
    public int Calls { get; private set; }
    public Task<ChatStatusDto> GetStatusAsync(CancellationToken cancellationToken) => Task.FromResult(new ChatStatusDto(true));
    public Task<ChatResponseDto> ReplyAsync(string message, CancellationToken cancellationToken)
    {
        Calls++;
        return Task.FromResult(new ChatResponseDto("Fragrance answer", "open-model", true, []));
    }
}
