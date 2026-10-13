using System.ComponentModel.DataAnnotations;

namespace FragranceCommerce.Api.DTOs;

public class CustomerChatRequestDto : ChatRequestDto
{
    public Guid? OrderId { get; set; }
    [Range(0, 100000)] public int Offset { get; set; }
}

public record CustomerChatItemDto(string ProductName, string VariantName, int Quantity, decimal UnitPrice);
public record CustomerChatOrderDto(Guid Id, string OrderNumber, DateTime OrderedAtUtc, string Status,
    decimal TotalAmount, decimal DiscountAmount, decimal FinalAmount, string PaymentStatus,
    int ItemCount, List<CustomerChatItemDto> Items);
public record CustomerChatDataDto(int TotalOrders, int Offset, bool HasMore, List<CustomerChatOrderDto> Orders);
public record CustomerChatResponseDto(string Reply, string Source, bool Experimental, List<ChatProductDto> Products,
    CustomerChatDataDto? CustomerData = null);
