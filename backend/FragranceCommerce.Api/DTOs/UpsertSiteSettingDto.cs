using System.ComponentModel.DataAnnotations;

namespace FragranceCommerce.Api.DTOs;

public class UpsertSiteSettingDto
{
    [Required(ErrorMessage = "Key is required.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Key must be between 1 and 100 characters.")]
    public string Key { get; set; } = string.Empty;

    [Required(ErrorMessage = "Value is required.")]
    public string Value { get; set; } = string.Empty;

    public string? Description { get; set; }
}
