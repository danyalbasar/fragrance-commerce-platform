namespace FragranceCommerce.Api.Settings;

public class ChatbotSettings
{
    public bool Enabled { get; set; } = true;
    public string Provider { get; set; } = "local";
    public string BaseUrl { get; set; } = "http://127.0.0.1:8001/";
    public string ServiceKey { get; set; } = string.Empty;
    public string CloudflareAccountId { get; set; } = string.Empty;
    public string CloudflareApiToken { get; set; } = string.Empty;
}
