using FragranceCommerce.Api.Enums;

namespace FragranceCommerce.Api.DTOs;

public class ProductSearchRequestDto
{
    public string? Search { get; set; }
    public ProductGender? Gender { get; set; }
    public Guid? BrandId { get; set; }
    public Guid? CategoryId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? InStockOnly { get; set; }
    public string? SortBy { get; set; } = "name";
    public string? SortDirection { get; set; } = "asc";
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}