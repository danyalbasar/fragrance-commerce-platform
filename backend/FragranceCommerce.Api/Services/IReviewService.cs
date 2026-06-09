using FragranceCommerce.Api.DTOs;

namespace FragranceCommerce.Api.Services;

public interface IReviewService
{
    Task<ReviewDto> CreateAsync(
        Guid productId,
        CreateReviewDto dto,
        Guid currentUserId);
    Task<List<ReviewDto>> GetByProductIdAsync(
        Guid productId);
}