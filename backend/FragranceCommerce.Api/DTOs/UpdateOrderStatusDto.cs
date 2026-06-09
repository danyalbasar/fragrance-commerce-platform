using FragranceCommerce.Api.Enums;

namespace FragranceCommerce.Api.DTOs;

public class UpdateOrderStatusDto
{
    public OrderStatus Status { get; set; }
}