using System.ComponentModel.DataAnnotations;

namespace FragranceCommerce.Api.DTOs;

public class VerifyEmailDto
{
    [Required(ErrorMessage = "Verification token is required.")]
    public string Token { get; set; } = string.Empty;
}
