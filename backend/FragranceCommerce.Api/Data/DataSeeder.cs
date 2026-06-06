using FragranceCommerce.Api.Models;

namespace FragranceCommerce.Api.Data;

public static class DataSeeder
{
    public static async Task SeedRolesAsync(ApplicationDbContext context)
    {
        var roles = new[] { "SuperAdmin", "Admin", "Vendor", "Customer" };

        foreach (var roleName in roles)
        {
            if (!context.Roles.Any(r => r.Name == roleName))
            {
                context.Roles.Add(new Role
                {
                    Name = roleName
                });
            }
        }

        await context.SaveChangesAsync();
    }
}