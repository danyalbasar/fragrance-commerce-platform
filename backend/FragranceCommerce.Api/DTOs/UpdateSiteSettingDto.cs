using System.ComponentModel.DataAnnotations;

namespace FragranceCommerce.Api.DTOs;

public class UpdateSiteSettingDto
{
    [Required(ErrorMessage = "Value is required.")]
    public string Value { get; set; } = string.Empty;

    public string? Description { get; set; }
}
