using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface ISiteSettingsService
{
    Task<List<SiteSettingDto>> GetAllAsync();
    Task<SiteSettingDto?> GetByKeyAsync(string key);
    Task<Dictionary<string, string>> GetSettingsAsync(IEnumerable<string> keys);
    Task UpdateAsync(string key, string value, string? description = null);
    Task UpsertAsync(string key, string value, string? description = null);
    Task SeedDefaultsAsync();
}
