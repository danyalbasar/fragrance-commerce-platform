using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Services;

public interface ITokenService
{
    string GenerateToken(User user, List<string> roles);
}