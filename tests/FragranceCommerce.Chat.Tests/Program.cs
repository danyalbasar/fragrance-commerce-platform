using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Services;
using FragranceCommerce.Api.Settings;
using Microsoft.Extensions.Options;

// A dependency-free contract test runner: exits nonzero on any failed assertion.
var catalog = new FakeCatalog();
var handler = new FakeHandler(HttpStatusCode.OK, "{\"reply\":\"Try a citrus scent.\"}");
var service = Create(handler, catalog);
var result = await service.ReplyAsync("Find citrus perfume", CancellationToken.None);
Assert(result.Source == "open-model" && result.Experimental, "Source must identify the open model.");
Assert(result.Products.Count == 1 && result.Products[0].Price == 1250, "Prices must come from the catalog.");
Assert(handler.Key == "backend-only-key", "Service key must be sent to the model service.");
var body = JsonDocument.Parse(handler.Body!);
Assert(body.RootElement.GetProperty("message").GetString() == "Find citrus perfume", "Message must be passed intact.");
Assert(body.RootElement.GetProperty("context").GetString()!.Contains("1250"), "Live context must reach inference.");
Assert(body.RootElement.GetProperty("context").GetString()!.Contains("return_sections"), "Public policies must reach inference.");
var reviewed = await Create(new FakeHandler(HttpStatusCode.OK, "{\"reply\":\"Attar is a fragrant oil.\",\"source\":\"reviewed-reference\"}"), catalog)
    .ReplyAsync("What is attar?", CancellationToken.None);
Assert(reviewed.Source == "reviewed-reference" && !reviewed.Experimental, "Reviewed answers must be distinguished from generation.");

await ExpectError(new FakeHandler(HttpStatusCode.TooManyRequests, "{}"), 429);
await ExpectError(new FakeHandler(HttpStatusCode.UnprocessableEntity, "{}"), 422);
await ExpectError(new FakeHandler(HttpStatusCode.ServiceUnavailable, "provider secret details"), 503);
await ExpectError(new FakeHandler(HttpStatusCode.OK, "not json"), 503);
await ExpectError(new FakeHandler(HttpStatusCode.OK, "{\"reply\":\" \"}"), 503);

var disabled = Create(new FakeHandler(HttpStatusCode.OK, "{}"), catalog, false);
Assert(!(await disabled.GetStatusAsync(CancellationToken.None)).Ready, "Disabled service must report unavailable.");
var ready = Create(new FakeHandler(HttpStatusCode.OK, "{\"ready\":true}"), catalog);
Assert((await ready.GetStatusAsync(CancellationToken.None)).Ready, "Ready status must propagate.");
var dto = new ChatRequestDto { Message = new string('a', 601) };
Assert(!Validator.TryValidateObject(dto, new ValidationContext(dto), [], true), "Oversized messages must fail validation.");
var cloudflareHandler = new FakeHandler(HttpStatusCode.OK,
    "{\"success\":true,\"result\":{\"response\":\" Citrus costs 1250 INR. \"},\"errors\":[]}");
var cloudflare = CreateCloudflare(cloudflareHandler);
var cloudflareReply = await cloudflare.ReplyAsync("Price of Citrus?", CancellationToken.None);
Assert(cloudflareReply.Reply == "Citrus costs 1250 INR." && cloudflareReply.Experimental,
    "Cloudflare replies must be parsed and identified as generated.");
Assert(cloudflareReply.Products.Single().Price == 1250, "Cloudflare product cards must use live catalog prices.");
Assert(cloudflareHandler.Uri == "https://api.cloudflare.com/client/v4/accounts/0123456789abcdef0123456789abcdef/ai/run/@cf/meta/llama-3.2-3b-instruct",
    "Cloudflare must use the fixed HTTPS endpoint and free-eligible model.");
Assert(cloudflareHandler.Authorization == "Bearer private-cloudflare-token" && cloudflareHandler.Key == null,
    "Cloudflare token must go only in Authorization; local service key must not be forwarded.");
using (var cloudflareBody = JsonDocument.Parse(cloudflareHandler.Body!))
{
    var root = cloudflareBody.RootElement;
    var messages = root.GetProperty("messages");
    Assert(messages[0].GetProperty("role").GetString() == "system", "Store context must not replace system instructions.");
    Assert(messages[1].GetProperty("content").GetString()!.Contains("1250") &&
        messages[1].GetProperty("content").GetString()!.Contains("return_sections"), "Catalog and policy context must reach Cloudflare.");
    Assert(root.GetProperty("max_tokens").GetInt32() == 192 && !root.GetProperty("stream").GetBoolean(),
        "Cloudflare generation must be bounded and non-streaming.");
    Assert(!cloudflareHandler.Body!.Contains("private-cloudflare-token"), "Token must not appear in the request body.");
}
await ExpectCloudflareError(HttpStatusCode.TooManyRequests,
    "{\"success\":false,\"errors\":[{\"code\":3036,\"message\":\"provider secret\"}]}", 429, "5:30 AM");
await ExpectCloudflareError(HttpStatusCode.TooManyRequests,
    "{\"success\":false,\"errors\":[{\"code\":3040}]}", 429, "busy");
await ExpectCloudflareError(HttpStatusCode.OK, "{\"success\":false,\"errors\":[]}", 503, "unavailable");
await ExpectCloudflareError(HttpStatusCode.Unauthorized, "{\"errors\":[{\"code\":\"secret\"}]}", 503, "unavailable");
await ExpectCloudflareError(HttpStatusCode.OK, "{\"success\":true,\"result\":{\"response\":\" \"}}", 503, "unavailable");
await ExpectCloudflareError(HttpStatusCode.OK, "not json", 503, "unavailable");
await ExpectCloudflareError(HttpStatusCode.OK, "[]", 503, "unavailable");

var statusHandler = new FakeHandler(HttpStatusCode.OK,
    "{\"success\":true,\"result\":[{\"name\":\"@cf/meta/llama-3.2-3b-instruct\"}]}");
Assert((await CreateCloudflare(statusHandler).GetStatusAsync(CancellationToken.None)).Ready, "Model access must be checked.");
Assert(statusHandler.Method == HttpMethod.Get && statusHandler.Body == null && statusHandler.Uri!.Contains("models/search"),
    "Cloudflare status must not generate tokens.");
Assert(!(await CreateCloudflare(new FakeHandler(HttpStatusCode.OK, "{\"success\":true,\"result\":[]}"))
    .GetStatusAsync(CancellationToken.None)).Ready, "Missing model must report unavailable.");
Assert(!(await CreateCloudflare(new FakeHandler(HttpStatusCode.Unauthorized, "{}"))
    .GetStatusAsync(CancellationToken.None)).Ready, "Invalid credentials must report unavailable.");
foreach (var invalidAccount in new[] { "", "../another-account", "short-id" })
{
    var noCall = new FakeHandler(HttpStatusCode.OK, "{}");
    var unconfigured = CreateCloudflare(noCall, invalidAccount);
    Assert(!(await unconfigured.GetStatusAsync(CancellationToken.None)).Ready, "Invalid account must report unavailable.");
    try
    {
        await unconfigured.ReplyAsync("Hello", CancellationToken.None);
        throw new Exception("Expected unconfigured service to fail.");
    }
    catch (ChatUnavailableException error) { Assert(error.StatusCode == 503, "Unconfigured service must return 503."); }
    Assert(noCall.Calls == 0, "Invalid configuration must not make HTTP requests.");
}
Console.WriteLine("All local and Cloudflare chatbot contract checks passed.");
await VendorChatChecks.RunAsync();
await CustomerChatChecks.RunAsync();

if (args.Contains("--live-model"))
{
    // Exercise the real Python model through the backend service, using clearly isolated catalog fixtures.
    var live = new ChatService(
        new HttpClient { BaseAddress = new Uri("http://127.0.0.1:8001/"), Timeout = TimeSpan.FromSeconds(90) },
        catalog, Options.Create(new ChatbotSettings()));
    var liveResult = await live.ReplyAsync("What is the price of Citrus?", CancellationToken.None);
    Assert(!string.IsNullOrWhiteSpace(liveResult.Reply), "Live model must return a reply.");
    Assert(liveResult.Products.Single().Price == 1250, "Fixture price must be preserved in the product card.");
    Console.WriteLine("Live backend-to-model fixture reply: " + liveResult.Reply);
}

static IChatService Create(FakeHandler handler, IChatCatalogProvider catalog, bool enabled = true) =>
    new ChatService(new HttpClient(handler) { BaseAddress = new Uri("http://localhost:8001/") }, catalog,
        Options.Create(new ChatbotSettings { Enabled = enabled, ServiceKey = "backend-only-key" }));

IChatService CreateCloudflare(FakeHandler handler, string account = "0123456789abcdef0123456789abcdef") =>
    new ChatService(new HttpClient(handler), catalog, Options.Create(new ChatbotSettings
    {
        Provider = "cloudflare", CloudflareAccountId = account,
        CloudflareApiToken = "private-cloudflare-token", ServiceKey = "local-only-key"
    }));

async Task ExpectCloudflareError(HttpStatusCode status, string content, int expectedStatus, string text)
{
    var handler = new FakeHandler(status, content);
    try
    {
        await CreateCloudflare(handler).ReplyAsync("Hello", CancellationToken.None);
        throw new Exception("Expected a Cloudflare service error.");
    }
    catch (ChatUnavailableException error)
    {
        Assert(error.StatusCode == expectedStatus && error.Message.Contains(text), "Cloudflare error must be friendly and actionable.");
        Assert(error.Code == (text == "5:30 AM" ? "daily-quota" : null), "Daily quota must have a distinct code for the storefront.");
        Assert(!error.Message.Contains("secret") && !error.Message.Contains("token"), "Cloudflare details must not leak.");
    }
    Assert(handler.Calls == 1, "Errors must not trigger automatic paid fallback or repeat requests.");
}

static void Assert(bool condition, string message)
{
    if (!condition) throw new Exception(message);
}

async Task ExpectError(FakeHandler handler, int status)
{
    try
    {
        await Create(handler, catalog).ReplyAsync("Hello", CancellationToken.None);
        throw new Exception("Expected a friendly service error.");
    }
    catch (ChatUnavailableException error)
    {
        Assert(error.StatusCode == status, "Wrong error status.");
        Assert(!error.Message.Contains("secret"), "Provider details must not leak.");
    }
}

class FakeCatalog : IChatCatalogProvider
{
    public Task<List<ChatProductDto>> GetMatchesAsync(string message, CancellationToken cancellationToken) =>
        Task.FromResult(new List<ChatProductDto> { new(Guid.NewGuid(), "Citrus", "House", 1250, true) });
    public Task<Dictionary<string, string>> GetStoreInformationAsync(CancellationToken cancellationToken) =>
        Task.FromResult(new Dictionary<string, string> { ["return_sections"] = "Contact support." });
}

class FakeHandler(HttpStatusCode status, string content) : HttpMessageHandler
{
    public string? Body { get; private set; }
    public string? Key { get; private set; }
    public string? Authorization { get; private set; }
    public string? Uri { get; private set; }
    public HttpMethod? Method { get; private set; }
    public int Calls { get; private set; }
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        if (request.Content != null) Body = await request.Content.ReadAsStringAsync(cancellationToken);
        Calls++;
        Key = request.Headers.TryGetValues("X-Chatbot-Key", out var keys) ? keys.Single() : null;
        Authorization = request.Headers.Authorization?.ToString();
        Uri = request.RequestUri?.ToString();
        Method = request.Method;
        return new HttpResponseMessage(status) { Content = new StringContent(content) };
    }
}
