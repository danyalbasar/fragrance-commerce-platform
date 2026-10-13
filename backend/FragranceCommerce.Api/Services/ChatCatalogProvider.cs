using System.Linq.Expressions;
using System.Text.RegularExpressions;
using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Enums;
using FragranceCommerce.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Services;

public class ChatCatalogProvider(ApplicationDbContext context) : IChatCatalogProvider
{
    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "the", "and", "for", "with", "what", "which", "how", "can", "you", "your", "have",
        "tell", "about", "want", "like", "need", "please", "this", "that", "does", "from",
        "are", "help", "find", "choose", "recommend", "show", "some", "price", "stock",
        "something", "use", "office", "work", "workplace", "everyday", "daily", "wear", "summer",
        "winter", "evening", "party", "date", "night", "suggest", "suggestions", "options", "best",
        "looking", "any", "buy", "cost", "available", "availability"
    };

    public async Task<List<ChatProductDto>> GetMatchesAsync(string message, CancellationToken cancellationToken)
    {
        var terms = Regex.Matches(message.ToLowerInvariant(), @"[\p{L}\p{N}]{3,}")
            .Select(m => m.Value).Where(t => !StopWords.Contains(t)).Distinct().Take(8).ToList();
        var occasionTerms = ChatShoppingIntent.OccasionTerms(message);
        terms = terms.Concat(occasionTerms).Distinct().ToList();
        var catalogRequest = ChatShoppingIntent.IsCatalogRequest(message);
        if (terms.Count == 0 && !catalogRequest) return [];
        var available = context.Products.AsNoTracking()
            .Where(p => p.Status == ProductStatus.Active && p.Variants.Any(v => v.IsActive));
        if (ChatShoppingIntent.FragranceRequest(message))
            available = available.Where(p => p.Category.Name.ToLower().Contains("perfume")
                || p.Category.Name.ToLower().Contains("fragrance") || p.Category.Name.ToLower().Contains("attar"));

        // Build a parameterized SQL predicate instead of loading the whole catalog.
        var parameter = Expression.Parameter(typeof(Product), "product");
        Expression score = Expression.Constant(0);
        foreach (var term in terms)
        {
            Expression<Func<Product, int>> match = product =>
                (product.Name.ToLower().Contains(term) ? 4 : 0) +
                (product.Description != null && product.Description.ToLower().Contains(term) ? 1 : 0) +
                (product.Brand.Name.ToLower().Contains(term) ? 2 : 0) +
                (product.Category.Name.ToLower().Contains(term) ? 1 : 0);
            score = Expression.Add(score, new ReplaceParameter(match.Parameters[0], parameter).Visit(match.Body)!);
        }
        var matches = terms.Count == 0 ? available : available.Where(Expression.Lambda<Func<Product, bool>>(
            Expression.GreaterThan(score, Expression.Constant(0)), parameter));
        return await matches.OrderByDescending(Expression.Lambda<Func<Product, int>>(score, parameter))
            .ThenByDescending(p => p.Variants.Any(v => v.IsActive && v.StockQuantity > 0))
            .ThenBy(p => p.Name).Take(3)
            .Select(p => new ChatProductDto(
                p.Id, p.Name, p.Brand.Name,
                p.Variants.Where(v => v.IsActive).Min(v => v.SellingPrice),
                p.Variants.Any(v => v.IsActive && v.StockQuantity > 0),
                p.Description == null ? "" : p.Description.Substring(0, Math.Min(p.Description.Length, 250)),
                p.Category.Name,
                p.Images.Where(i => i.ImageUrl != "").OrderByDescending(i => i.IsPrimary)
                    .ThenBy(i => i.DisplayOrder).ThenBy(i => i.Id).Select(i => (string?)i.ImageUrl).FirstOrDefault()
                ?? p.Variants.Where(v => v.IsActive).SelectMany(v => v.Images).Where(i => i.ImageUrl != "")
                    .OrderByDescending(i => i.IsPrimary).ThenBy(i => i.DisplayOrder).ThenBy(i => i.Id)
                    .Select(i => (string?)i.ImageUrl).FirstOrDefault()))
            .ToListAsync(cancellationToken);
    }

    public async Task<Dictionary<string, string>> GetStoreInformationAsync(CancellationToken cancellationToken)
    {
        string[] publicKeys = ["contact_email", "contact_response_text", "product_shipping_text", "faq_sections", "return_sections"];
        var information = await context.SiteSettings.AsNoTracking()
            .Where(s => publicKeys.Contains(s.Key))
            .Select(s => new { s.Key, s.Value }).ToListAsync(cancellationToken);
        return information.ToDictionary(s => s.Key, s => s.Value.Length <= 600
            ? s.Value : s.Value[..600] + " [Excerpt: read the full policy on the store page.]");
    }

    private class ReplaceParameter(ParameterExpression oldParameter, ParameterExpression newParameter) : ExpressionVisitor
    {
        protected override Expression VisitParameter(ParameterExpression node) =>
            node == oldParameter ? newParameter : base.VisitParameter(node);
    }
}
