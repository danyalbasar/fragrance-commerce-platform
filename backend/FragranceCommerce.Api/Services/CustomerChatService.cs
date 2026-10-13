using System.Text.RegularExpressions;
using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Services;

public interface ICustomerChatService
{
    Task<CustomerChatResponseDto> ReplyAsync(Guid userId, CustomerChatRequestDto request, CancellationToken cancellationToken);
}

// Order facts use authenticated database retrieval rather than generated guesses.
// Private order records are never sent to the external model.
public class CustomerChatService(ApplicationDbContext db, IChatService shopping) : ICustomerChatService
{
    public async Task<CustomerChatResponseDto> ReplyAsync(Guid userId, CustomerChatRequestDto request, CancellationToken cancellationToken)
    {
        var number = Regex.Match(request.Message, @"\bORD-\d{14}-\d{4}\b", RegexOptions.IgnoreCase).Value.ToUpperInvariant();
        var guid = Regex.Match(request.Message, @"\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b", RegexOptions.IgnoreCase).Value;
        var orderId = request.OrderId ?? (Guid.TryParse(guid, out var parsed) ? parsed : (Guid?)null);
        var publicPolicy = Regex.IsMatch(request.Message, @"\b(polic(?:y|ies)|shipping (?:fees?|costs?)|delivery (?:fees?|costs?))\b", RegexOptions.IgnoreCase)
            && !Regex.IsMatch(request.Message, @"\b(my|mine|orders?)\b", RegexOptions.IgnoreCase);
        if (orderId == null && number.Length == 0 && (publicPolicy || !Regex.IsMatch(request.Message,
                @"\b(orders?|purchases?|bought|history|deliver\w*|ship\w*|track\w*|refund\w*|payments?|cancel\w*|checkout)\b|\bwhat did I buy\b", RegexOptions.IgnoreCase)))
        {
            var reply = await shopping.ReplyAsync(request.Message, cancellationToken);
            return new(reply.Reply, reply.Source, reply.Experimental, reply.Products);
        }

        // Ownership is enforced before any reference lookup, paging, projection, or count.
        var owned = db.Orders.AsNoTracking().Where(o => o.UserId == userId);
        var total = await owned.CountAsync(cancellationToken);
        var selected = owned;
        var specific = orderId != null || number.Length > 0;
        if (orderId != null) selected = selected.Where(o => o.Id == orderId);
        if (number.Length > 0) selected = selected.Where(o => o.OrderNumber == number);
        var latest = !specific && Regex.IsMatch(request.Message, @"\b(latest|last|most recent)\b", RegexOptions.IgnoreCase);
        var offset = specific || latest ? 0 : request.Offset;
        var limit = specific || latest ? 1 : 5;
        var orders = await selected.OrderByDescending(o => o.OrderedAt).ThenByDescending(o => o.Id)
            .Skip(offset).Take(limit).Select(o => new CustomerChatOrderDto(
                o.Id, o.OrderNumber, o.OrderedAt, o.Status.ToString(), o.TotalAmount, o.DiscountAmount, o.FinalAmount,
                o.Payment == null ? "Not recorded" : o.Payment.PaymentStatus.ToString(), o.Items.Count,
                o.Items.OrderBy(i => i.Id).Take(20).Select(i => new CustomerChatItemDto(
                    i.ProductVariant.Product.Name, i.ProductVariant.VariantName, i.Quantity, i.UnitPrice)).ToList()))
            .ToListAsync(cancellationToken);
        var hasMore = !specific && !latest && offset + orders.Count < total;
        var text = orders.Count == 0
            ? specific ? "I couldn't find that order in your account. Open My orders to choose one of your orders."
                : total == 0 ? "You haven't placed any orders yet." : "There are no more orders on this page."
            : specific || latest
                ? $"Here are the recorded details for your {(latest ? "latest " : "")}order {orders[0].OrderNumber}. Its status is {orders[0].Status}; payment is {orders[0].PaymentStatus}."
                : $"You have {total} orders. Showing orders {offset + 1}–{offset + orders.Count}, newest first. Choose Order details to ask about a particular order.";
        if (Regex.IsMatch(request.Message, @"\b(cancel\w*|refund\w*)\b", RegexOptions.IgnoreCase))
            text += " I can show recorded information, but cannot cancel an order or issue a refund. Use the order page or contact support.";
        if (Regex.IsMatch(request.Message, @"\b(track\w*|when|arriv\w*)\b", RegexOptions.IgnoreCase))
            text += " Tracking numbers and estimated arrival dates are not available in this chat. Check the order page or contact support.";
        return new(text, "reviewed-reference", false, [], new(total, offset, hasMore, orders));
    }
}
