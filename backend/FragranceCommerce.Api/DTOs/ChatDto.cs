using System.ComponentModel.DataAnnotations;

namespace FragranceCommerce.Api.DTOs;

public class ChatRequestDto
{
    [Required, StringLength(600, MinimumLength = 1)]
    public string Message { get; set; } = string.Empty;
}

public record ChatProductDto(Guid Id, string Name, string BrandName, decimal Price, bool InStock,
    string Description = "", string CategoryName = "");
public record ChatResponseDto(string Reply, string Source, bool Experimental, List<ChatProductDto> Products);
public record ChatStatusDto(bool Ready);
