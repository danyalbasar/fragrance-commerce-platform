using System.Security.Cryptography;
using System.Text;
using FragranceCommerce.Api.Data;
using FragranceCommerce.Api.DTOs;
using FragranceCommerce.Api.Exceptions;
using FragranceCommerce.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;

    public AuthService(
        ApplicationDbContext context,
        ITokenService tokenService,
        IEmailService emailService)
    {
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FirstName) ||
            string.IsNullOrWhiteSpace(dto.LastName))
        {
            throw new InvalidOperationException("First name and last name are required.");
        }

        if (string.IsNullOrWhiteSpace(dto.Email))
            throw new InvalidOperationException("Email is required.");

        if (!IsValidEmail(dto.Email))
            throw new InvalidOperationException("A valid email address is required.");

        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 8)
            throw new InvalidOperationException("Password must be at least 8 characters long.");

        if (!dto.Password.Any(char.IsUpper) ||
            !dto.Password.Any(char.IsLower) ||
            !dto.Password.Any(char.IsDigit))
        {
            throw new InvalidOperationException(
                "Password must contain at least one uppercase letter, one lowercase letter, and one digit.");
        }

        var email = dto.Email.Trim().ToLowerInvariant();

        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        if (existingUser != null)
            throw new InvalidOperationException("Email is already registered.");

        var user = new User
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = email,
            PhoneNumber = dto.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            EmailVerified = false
        };

        var customerRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Customer");

        if (customerRole == null)
            throw new InvalidOperationException("Customer role not found.");

        user.UserRoles.Add(new UserRole
        {
            User = user,
            Role = customerRole
        });

        _context.Users.Add(user);

        var (verificationToken, verificationTokenHash) = GenerateVerificationToken();
        user.EmailVerificationToken = verificationTokenHash;
        user.EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddHours(24);

        await _context.SaveChangesAsync();

        await _emailService.SendEmailVerificationAsync(user, verificationToken);

        var roles = new List<string> { "Customer" };
        var token = _tokenService.GenerateToken(user, roles);

        return new AuthResponseDto
        {
            UserId = user.Id,
            FullName = $"{user.FirstName} {user.LastName}",
            Email = user.Email,
            Roles = roles,
            EmailVerified = false,
            Token = token
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

        if (user == null)
            throw new InvalidOperationException("Invalid email or password.");

        var isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

        if (!isPasswordValid)
            throw new InvalidOperationException("Invalid email or password.");

        if (!user.EmailVerified)
            throw new EmailNotVerifiedException(
                "Please verify your email address before signing in.");

        var roles = user.UserRoles
            .Select(ur => ur.Role.Name)
            .ToList();

        var token = _tokenService.GenerateToken(user, roles);

        return new AuthResponseDto
        {
            UserId = user.Id,
            FullName = $"{user.FirstName} {user.LastName}",
            Email = user.Email,
            Roles = roles,
            EmailVerified = true,
            Token = token
        };
    }

    public async Task<AuthResponseDto> VerifyEmailAsync(string token)
    {
        var tokenHash = HashToken(token);

        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.EmailVerificationToken == tokenHash);

        if (user == null)
            throw new InvalidOperationException("This verification link is invalid.");

        if (user.EmailVerificationTokenExpiresAt == null ||
            user.EmailVerificationTokenExpiresAt < DateTime.UtcNow)
        {
            throw new InvalidOperationException("This verification link has expired.");
        }

        user.EmailVerified = true;
        user.EmailVerificationToken = null;
        user.EmailVerificationTokenExpiresAt = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var roles = user.UserRoles
            .Select(ur => ur.Role.Name)
            .ToList();

        var authToken = _tokenService.GenerateToken(user, roles);

        return new AuthResponseDto
        {
            UserId = user.Id,
            FullName = $"{user.FirstName} {user.LastName}",
            Email = user.Email,
            Roles = roles,
            EmailVerified = true,
            Token = authToken
        };
    }

    public async Task ResendVerificationAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null || user.EmailVerified)
            return;

        var (verificationToken, verificationTokenHash) = GenerateVerificationToken();
        user.EmailVerificationToken = verificationTokenHash;
        user.EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddHours(24);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _emailService.SendEmailVerificationAsync(user, verificationToken);
    }

    public async Task<User?> GetUserByIdAsync(Guid userId)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task ForgotPasswordAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null || !user.EmailVerified)
            return;

        var (token, tokenHash) = GenerateVerificationToken();
        user.PasswordResetToken = tokenHash;
        user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddHours(1);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _emailService.SendPasswordResetAsync(user, token);
    }

    public async Task ResetPasswordAsync(string token, string newPassword)
    {
        if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 8)
            throw new InvalidOperationException("Password must be at least 8 characters long.");

        if (!newPassword.Any(char.IsUpper) ||
            !newPassword.Any(char.IsLower) ||
            !newPassword.Any(char.IsDigit))
        {
            throw new InvalidOperationException(
                "Password must contain at least one uppercase letter, one lowercase letter, and one digit.");
        }

        var tokenHash = HashToken(token);

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.PasswordResetToken == tokenHash);

        if (user == null)
            throw new InvalidOperationException("This reset link is invalid.");

        if (user.PasswordResetTokenExpiresAt == null ||
            user.PasswordResetTokenExpiresAt < DateTime.UtcNow)
        {
            throw new InvalidOperationException("This reset link has expired.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiresAt = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    private static (string Token, string Hash) GenerateVerificationToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        var token = Convert.ToHexString(bytes);
        return (token, HashToken(token));
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }

    private static bool IsValidEmail(string email)
    {
        return System.Text.RegularExpressions.Regex.IsMatch(email,
            @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
    }
}
