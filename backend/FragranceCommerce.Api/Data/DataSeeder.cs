using FragranceCommerce.Api.Enums;
using FragranceCommerce.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext context,
        IImageUploadService imageUploadService,
        IWebHostEnvironment env)
    {
        await SeedRolesAsync(context);
        await SeedBrandsAsync(context);
        await SeedCategoriesAsync(context);
        await SeedCouponsAsync(context);
        await SeedDemoUsersAsync(context);
        await SeedDemoProductsAsync(context, imageUploadService, env);
    }

    private static async Task SeedRolesAsync(ApplicationDbContext context)
    {
        var roles = new[] { "SuperAdmin", "Admin", "Vendor", "Customer" };

        foreach (var roleName in roles)
        {
            if (!await context.Roles.AnyAsync(r => r.Name == roleName))
                context.Roles.Add(new Role { Name = roleName });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedBrandsAsync(ApplicationDbContext context)
    {
        var brands = new[]
        {
            new Brand { Name = "Dior", Description = "Luxury French fragrance brand." },
            new Brand { Name = "Tom Ford", Description = "Premium designer fragrance brand." },
            new Brand { Name = "Versace", Description = "Luxury Italian fragrance brand." },
            new Brand { Name = "Yves Saint Laurent", Description = "French luxury fragrance brand." },
            new Brand { Name = "Chanel", Description = "Luxury fragrance brand." }
        };

        foreach (var brand in brands)
        {
            if (!await context.Brands.AnyAsync(b => b.Name == brand.Name))
                context.Brands.Add(brand);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedCategoriesAsync(ApplicationDbContext context)
    {
        var categories = new[]
        {
            new Category { Name = "Perfume", Description = "Ready-made perfumes." },
            new Category { Name = "Attar", Description = "Traditional concentrated fragrance oils." },
            new Category { Name = "Customised Perfume", Description = "Custom blended perfumes." },
            new Category { Name = "Fairness Cream", Description = "Skin brightening and fairness creams." },
            new Category { Name = "Face Wash", Description = "Face cleansing products." },
            new Category { Name = "Lens", Description = "Cosmetic and fashion lenses." },
            new Category { Name = "Nails", Description = "Nail products and accessories." }
        };

        foreach (var category in categories)
        {
            if (!await context.Categories.AnyAsync(c => c.Name == category.Name))
                context.Categories.Add(category);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedCouponsAsync(ApplicationDbContext context)
    {
        var now = DateTime.UtcNow;

        var coupons = new[]
        {
            new Coupon
            {
                Code = "SAVE10",
                DiscountType = DiscountType.Percentage,
                DiscountValue = 10,
                MinimumOrderAmount = 1000,
                MaxDiscountAmount = 500,
                StartDate = now,
                EndDate = now.AddYears(1),
                UsageLimit = 100,
                IsActive = true
            },
            new Coupon
            {
                Code = "WELCOME100",
                DiscountType = DiscountType.FixedAmount,
                DiscountValue = 100,
                MinimumOrderAmount = 500,
                MaxDiscountAmount = 100,
                StartDate = now,
                EndDate = now.AddYears(1),
                UsageLimit = 100,
                IsActive = true
            }
        };

        foreach (var coupon in coupons)
        {
            if (!await context.Coupons.AnyAsync(c => c.Code == coupon.Code))
                context.Coupons.Add(coupon);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedDemoUsersAsync(ApplicationDbContext context)
    {
        var vendorRole = await context.Roles.FirstAsync(r => r.Name == "Vendor");
        var customerRole = await context.Roles.FirstAsync(r => r.Name == "Customer");
        var adminRole = await context.Roles.FirstAsync(r => r.Name == "Admin");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password@123");

        await EnsureUserAsync(context, "Admin", "User", "admin@test.com", "9999999999", passwordHash, adminRole.Id);

        var vendorUser = await EnsureUserAsync(context, "Test", "Vendor", "vendor@test.com", "9876543211", passwordHash, vendorRole.Id);

        await EnsureUserAsync(context, "Test", "Customer", "customer@test.com", "9876543210", passwordHash, customerRole.Id);

        if (!await context.Vendors.AnyAsync(v => v.UserId == vendorUser.Id))
        {
            context.Vendors.Add(new Vendor
            {
                UserId = vendorUser.Id,
                BusinessName = "Seamenbuster Fragrances",
                GSTNumber = "27ABCDE1234F1Z5",
                Address = "Mumbai, Maharashtra",
                IsApproved = true
            });

            await context.SaveChangesAsync();
        }
    }

    private static async Task<User> EnsureUserAsync(
        ApplicationDbContext context,
        string firstName,
        string lastName,
        string email,
        string phoneNumber,
        string passwordHash,
        Guid roleId)
    {
        var user = await context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            user = new User
            {
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                PhoneNumber = phoneNumber,
                PasswordHash = passwordHash,
                IsActive = true
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();
        }

        if (!user.UserRoles.Any(ur => ur.RoleId == roleId))
        {
            context.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = roleId
            });

            await context.SaveChangesAsync();
        }

        return user;
    }

    private static async Task SeedDemoProductsAsync(
        ApplicationDbContext context,
        IImageUploadService imageUploadService,
        IWebHostEnvironment env)
    {
        if (await context.Products.AnyAsync())
            return;

        var vendor = await context.Vendors.FirstAsync();

        await SeedProductAsync(context, imageUploadService, env, vendor.Id,
            "Dior", "Perfume", ProductGender.Men, "Dior Sauvage",
            "A fresh and spicy men's fragrance.",
            "dior-sauvage.webp", "dior-sauvage",
            new[]
            {
                new DemoVariant("60ml", "DS60", 4999, 4499, 3000, 20),
                new DemoVariant("100ml", "DS100", 6999, 6499, 4500, 15)
            });

        await SeedProductAsync(context, imageUploadService, env, vendor.Id,
            "Versace", "Perfume", ProductGender.Men, "Versace Eros",
            "A bold fresh fragrance with mint, apple and vanilla notes.",
            "versace-eros.webp", "versace-eros",
            new[]
            {
                new DemoVariant("100ml", "VE100", 7999, 6999, 4800, 18)
            });

        await SeedProductAsync(context, imageUploadService, env, vendor.Id,
            "Tom Ford", "Perfume", ProductGender.Men, "Tom Ford Oud Wood",
            "A warm woody fragrance with oud, sandalwood and amber.",
            "tom-ford-oud-wood.webp", "tom-ford-oud-wood",
            new[]
            {
                new DemoVariant("50ml", "TFOW50", 14999, 12999, 9500, 10)
            });

        await SeedProductAsync(context, imageUploadService, env, vendor.Id,
            "Yves Saint Laurent", "Perfume", ProductGender.Men, "YSL Y Eau de Parfum",
            "A clean masculine fragrance with apple, sage and woods.",
            "ysl-y-edp.webp", "ysl-y-edp",
            new[]
            {
                new DemoVariant("100ml", "YSLY100", 8999, 7499, 5200, 14)
            });

        await SeedProductAsync(context, imageUploadService, env, vendor.Id,
            "Chanel", "Perfume", ProductGender.Women, "Chanel Coco Mademoiselle",
            "A fresh oriental fragrance with orange, jasmine and patchouli.",
            "chanel-coco.webp", "chanel-coco",
            new[]
            {
                new DemoVariant("100ml", "CCM100", 10999, 9499, 7000, 12)
            });

        await SeedProductAsync(context, imageUploadService, env, vendor.Id,
            "Dior", "Perfume", ProductGender.Women, "J'adore Eau de Parfum",
            "An elegant floral fragrance with notes of ylang-ylang, Damascus rose and jasmine.",
            "jadore-edp.webp", "jadore-edp",
            new[]
            {
                new DemoVariant("100ml", "DJ100", 10999, 9999, 7000, 15)
            });
    }

    private static async Task SeedProductAsync(
        ApplicationDbContext context,
        IImageUploadService imageUploadService,
        IWebHostEnvironment env,
        Guid vendorId,
        string brandName,
        string categoryName,
        ProductGender gender,
        string productName,
        string description,
        string imageFileName,
        string publicId,
        DemoVariant[] variants)
    {
        var brand = await context.Brands.FirstAsync(b => b.Name == brandName);
        var category = await context.Categories.FirstAsync(c => c.Name == categoryName);

        var imagePath = Path.Combine(env.ContentRootPath, "SeedImages", imageFileName);

        var imageUrl = await imageUploadService.UploadImageAsync(
            imagePath,
            publicId);

        var product = new Product
        {
            VendorId = vendorId,
            BrandId = brand.Id,
            CategoryId = category.Id,
            Gender = gender,
            Name = productName,
            Description = description,
            IsActive = true
        };

        context.Products.Add(product);
        await context.SaveChangesAsync();

        context.ProductImages.Add(new ProductImage
        {
            ProductId = product.Id,
            ImageUrl = imageUrl,
            DisplayOrder = 1,
            IsPrimary = true
        });

        foreach (var variant in variants)
        {
            var productVariant = new ProductVariant
            {
                ProductId = product.Id,
                VariantName = variant.VariantName,
                SKU = variant.Sku,
                MRP = variant.Mrp,
                SellingPrice = variant.SellingPrice,
                CostPrice = variant.CostPrice,
                StockQuantity = variant.StockQuantity,
                IsActive = true
            };

            context.ProductVariants.Add(productVariant);
            await context.SaveChangesAsync();

            context.ProductVariantImages.Add(new ProductVariantImage
            {
                ProductVariantId = productVariant.Id,
                ImageUrl = imageUrl,
                DisplayOrder = 1,
                IsPrimary = true
            });
        }

        await context.SaveChangesAsync();
    }

    private record DemoVariant(
        string VariantName,
        string Sku,
        decimal Mrp,
        decimal SellingPrice,
        decimal CostPrice,
        int StockQuantity);
}