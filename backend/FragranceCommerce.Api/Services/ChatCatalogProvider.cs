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
        "are", "help", "find", "choose", "recommend", "show", "some", "price", "stock"
    };

    public async Task<List<ChatProductDto>> GetMatchesAsync(string message, CancellationToken cancellationToken)
    {
        var terms = Regex.Matches(message.ToLowerInvariant(), @"[\p{L}\p{N}]{3,}")
            .Select(m => m.Value).Where(t => !StopWords.Contains(t)).Distinct().Take(8).ToList();
        if (terms.Count == 0) return [];

        // Build a parameterized SQL predicate instead of loading the whole catalog.
        var parameter = Expression.Parameter(typeof(Product), "product");
        Expression body = Expression.Constant(false);
        foreach (var term in terms)
        {
            Expression<Func<Product, bool>> match = product =>
                product.Name.ToLower().Contains(term) ||
                (product.Description != null && product.Description.ToLower().Contains(term)) ||
                product.Brand.Name.ToLower().Contains(term) ||
                product.Category.Name.ToLower().Contains(term);
            var replaced = new ReplaceParameter(match.Parameters[0], parameter).Visit(match.Body)!;
            body = Expression.OrElse(body, replaced);
        }

        return await context.Products.AsNoTracking()
            .Where(p => p.Status == ProductStatus.Active && p.Variants.Any(v => v.IsActive))
            .Where(Expression.Lambda<Func<Product, bool>>(body, parameter))
            .OrderBy(p => p.Name).Take(3)
            .Select(p => new ChatProductDto(
                p.Id, p.Name, p.Brand.Name,
                p.Variants.Where(v => v.IsActive).Min(v => v.SellingPrice),
                p.Variants.Any(v => v.IsActive && v.StockQuantity > 0),
                p.Description == null ? "" : p.Description.Substring(0, Math.Min(p.Description.Length, 250)),
                p.Category.Name))
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
