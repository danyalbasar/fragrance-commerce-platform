using System.ComponentModel.DataAnnotations;

namespace FragranceCommerce.Api.DTOs;

public class ForgotPasswordDto
{
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "A valid email address is required.")]
    public string Email { get; set; } = string.Empty;
}
