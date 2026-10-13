using System.Text.RegularExpressions;

namespace FragranceCommerce.Api.Services;

internal static class ChatShoppingIntent
{
    public static bool IsCatalogRequest(string message) => !Regex.IsMatch(message,
        @"\b(ship\w*|delivery|returns?|refund\w*|payment\w*|polic(?:y|ies))\b", RegexOptions.IgnoreCase) && Regex.IsMatch(message,
        @"\b(recommend\w*|suggest\w*|options?|something|looking for|find|show|buy|price|cost|stock|availability|available|office|workplace|everyday|daily wear|summer|winter|date night|party|best)\b|\b(?:do you|you) (?:have|sell)\b",
        RegexOptions.IgnoreCase);

    public static string[] OccasionTerms(string message)
    {
        if (Regex.IsMatch(message, @"\b(office|workplace|work|everyday|daily|summer)\b", RegexOptions.IgnoreCase))
            return ["citrus", "fresh", "clean", "light", "green", "tea"];
        if (Regex.IsMatch(message, @"\b(winter|evening|party|date|night)\b", RegexOptions.IgnoreCase))
            return ["amber", "warm", "woods", "saffron", "musk", "rose"];
        return [];
    }

    public static bool FragranceRequest(string message) => Regex.IsMatch(message,
        @"\b(perfumes?|fragrances?|scents?|attar|office|workplace|work|everyday|daily wear|summer|winter|evening|party|date night)\b", RegexOptions.IgnoreCase)
        && !Regex.IsMatch(message, @"\b(skin\w*|wash|cleanser|cream|moisturizer|nails?|serum|lens)\b", RegexOptions.IgnoreCase);
}
