using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Repositories;

public interface IReviewRepository
{
    Task AddAsync(Review review);
    Task<Review?> GetByIdAsync(Guid id);
    Task<List<Review>> GetByProductIdAsync(Guid productId);
    Task<Review?> GetByUserAndProductAsync(Guid userId, Guid productId);
    Task SaveChangesAsync();
}