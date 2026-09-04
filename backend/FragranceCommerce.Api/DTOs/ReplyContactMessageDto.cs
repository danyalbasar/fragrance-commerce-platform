using System.ComponentModel.DataAnnotations;

namespace FragranceCommerce.Api.DTOs;

public class ReplyContactMessageDto
{
    [Required]
    [MaxLength(2000)]
    public string Reply { get; set; } = string.Empty;
}
