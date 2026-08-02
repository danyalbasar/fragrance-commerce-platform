using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Repositories;
using FragranceCommerce.Api.Enums;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;
    private readonly ApplicationDbContext _context;

    public ReviewService(
        IReviewRepository reviewRepository,
        ApplicationDbContext context)
    {
        _reviewRepository = reviewRepository;
        _context = context;
    }

    public async Task<ReviewDto> CreateAsync(
        Guid productId,
        CreateReviewDto dto,
        Guid currentUserId)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
            throw new InvalidOperationException("Rating must be between 1 and 5.");

        var productExists = await _context.Products
            .AnyAsync(p => p.Id == productId);

        if (!productExists)
            throw new InvalidOperationException("Product not found.");

        var alreadyReviewed = await _reviewRepository
            .GetByUserAndProductAsync(currentUserId, productId);

        if (alreadyReviewed != null)
            throw new InvalidOperationException("You have already reviewed this product.");

        var hasDeliveredOrder = await _context.Orders
            .AnyAsync(o =>
                o.UserId == currentUserId &&
                o.Status == OrderStatus.Delivered &&
                o.Items.Any(i => i.ProductVariant.ProductId == productId));

        if (!hasDeliveredOrder)
            throw new InvalidOperationException(
                "You can only review products from delivered orders.");

        var review = new Review
        {
            UserId = currentUserId,
            ProductId = productId,
            Rating = dto.Rating,
            Title = dto.Title,
            Comment = dto.Comment,
            Images = dto.Images.Select(i => new ReviewImage
            {
                ImageUrl = i.ImageUrl,
                DisplayOrder = i.DisplayOrder
            }).ToList()
        };

        await _reviewRepository.AddAsync(review);
        await _reviewRepository.SaveChangesAsync();

        await _reviewRepository.AddAsync(review);
        await _reviewRepository.SaveChangesAsync();

        review.User = await _context.Users
            .FirstAsync(u => u.Id == currentUserId);

        return MapToReviewDto(review);
    }

    public async Task<List<ReviewDto>> GetByProductIdAsync(Guid productId)
    {
        var reviews = await _reviewRepository.GetByProductIdAsync(productId);

        return reviews.Select(MapToReviewDto).ToList();
    }

    private static ReviewDto MapToReviewDto(Review review)
    {
        return new ReviewDto
        {
            Id = review.Id,
            UserId = review.UserId,
            UserName = $"{review.User.FirstName} {review.User.LastName}",
            Rating = review.Rating,
            Title = review.Title,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt,
            Images = review.Images.Select(i => new ReviewImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                DisplayOrder = i.DisplayOrder
            }).ToList()
        };
    }
}