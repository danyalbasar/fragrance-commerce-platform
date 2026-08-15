using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FragranceCommerce.Api.Models;
using FragranceCommerce.Api.Security;
using Microsoft.IdentityModel.Tokens;

namespace FragranceCommerce.Api.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly RsaSecurityKey? _rsaKey;
    private readonly SymmetricSecurityKey? _hmacKey;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;

        var privateKeyPem = _configuration["Jwt:PrivateKeyPem"];

        if (!string.IsNullOrWhiteSpace(privateKeyPem))
        {
            _rsaKey = new RsaSecurityKey(RsaKeyLoader.Load(privateKeyPem));
        }
        else
        {
            _hmacKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        }
    }

    public string GenerateToken(User user, List<string> roles)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.GivenName,
                $"{user.FirstName} {user.LastName}")
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var credentials = _rsaKey != null
            ? new SigningCredentials(_rsaKey, SecurityAlgorithms.RsaSha256)
            : new SigningCredentials(_hmacKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}
