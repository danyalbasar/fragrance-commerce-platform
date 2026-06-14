using FragranceCommerce.Api.Enums;

namespace FragranceCommerce.Api.DTOs;

public class CreateOrderDto
{
    public Guid AddressId { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
}