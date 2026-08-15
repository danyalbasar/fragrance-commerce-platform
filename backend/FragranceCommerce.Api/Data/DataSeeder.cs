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
            new Brand { Name = "Aurelian Atelier", Description = "Fragrance house known for luminous woods and polished florals." },
            new Brand { Name = "Nocturne Vale", Description = "Fragrance studio blending resin, spice, and evening botanicals." },
            new Brand { Name = "Mira Solace", Description = "Skincare brand focused on calm, dewy daily rituals." },
            new Brand { Name = "Vellum & Dew", Description = "Skincare brand creating refined cleansers and skin treatments." }
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
                IsActive = true,
                EmailVerified = true
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
        var vendor = await context.Vendors.FirstAsync();

        await SeedProductAsync(context, imageUploadService, env, vendor.Id,
            "Aurelian Atelier", "Perfume", ProductGender.Unisex, "Velvet Saffron Eau de Parfum",
            "An amber floral fragrance with saffron, suede petals, and polished cedar.",
            "aurelian-velvet-saffron.png", "aurelian-velvet-saffron",
            new[]
            {
                new DemoVariant("50ml", "AA-VS-50", 4299, 3699, 2200, 28, "aurelian-velvet-saffron-50.png", "aurelian-velvet-saffron-50"),
                new DemoVariant("100ml", "AA-VS-100", 6499, 5799, 3500, 18, "aurelian-velvet-saffron-100.png", "aurelian-velvet-saffron-100")
            });

        await SeedProductAsync(context, imageUploadService, env, vendor.Id,
            "Aurelian Atelier", "Attar", ProductGender.Women, "Moonlit Rose Attar",
            "A concentrated oil with rose absolute, pear skin, and soft white musk.",
            "aurelian-moonlit-rose.png", "aurelian-moonlit-rose",
            new[]
            {
                new DemoVariant("6ml", "AA-MR-6", 1799, 1499, 850, 36, "aurelian-moonlit-rose-6.png", "aurelian-moonlit-rose-6"),
                new DemoVariant("12ml", "AA-MR-12", 2999, 2499, 1400, 24, "aurelian-moonlit-rose-12.png", "aurelian-moonlit-rose-12")
            });

        await SeedProductAsync(context, imageUploadService, env, vendor.Id,
            "Nocturne Vale", "Perfume", ProductGender.Men, "Cedar Smoke Parfum",
            "A smoky fragrance with cedar resin, black tea, and mineral amber.",
            "nocturne-cedar-smoke.png", "nocturne-cedar-smoke",
            new[]
            {
                new DemoVariant("50ml", "NV-CS-50", 4599, 3999, 2400, 22, "nocturne-cedar-smoke-50.png", "nocturne-cedar-smoke-50"),
                new DemoVariant("100ml", "NV-CS-100", 6999, 6199, 3900, 16, "nocturne-cedar-smoke-100.png", "nocturne-cedar-smoke-100")
            });

        await SeedProductAsync(context, imageUploadService, env, vendor.Id,
            "Nocturne Vale", "Customised Perfume", ProductGender.Unisex, "Bespoke Citrus Resin Blend",
            "A custom-blend starter with mandarin peel, incense resin, and clean woods.",
            "nocturne-citrus-resin.png", "nocturne-citrus-resin",
            new[]
            {
                new DemoVariant("30ml", "NV-CR-30", 3499, 2999, 1700, 20, "nocturne-citrus-resin-30.png", "nocturne-citrus-resin-30"),
                new DemoVariant("75ml", "NV-CR-75", 5799, 5199, 3100, 14, "nocturne-citrus-resin-75.png", "nocturne-citrus-resin-75")
            });

        await SeedProductAsync(context, imageUploadService, env, vendor.Id,
            "Mira Solace", "Face Wash", ProductGender.Unisex, "Cloud Milk Cleanser",
            "A gentle cleanser with oat milk, lotus water, and amino acids.",
            "mira-cloud-milk-cleanser.png", "mira-cloud-milk-cleanser",
            new[]
            {
                new DemoVariant("100ml", "MS-CM-100", 899, 749, 360, 45, "mira-cloud-milk-cleanser-100.png", "mira-cloud-milk-cleanser-100"),
                new DemoVariant("200ml", "MS-CM-200", 1399, 1199, 620, 30, "mira-cloud-milk-cleanser-200.png", "mira-cloud-milk-cleanser-200")
            });

        await SeedProductAsync(context, imageUploadService, env, vendor.Id,
            "Mira Solace", "Fairness Cream", ProductGender.Women, "Pearl Veil Bright Cream",
            "A brightening cream with niacinamide, pearl extract, and meadowfoam.",
            "mira-pearl-veil-cream.png", "mira-pearl-veil-cream",
            new[]
            {
                new DemoVariant("30g", "MS-PV-30", 1299, 1099, 540, 34, "mira-pearl-veil-cream-30.png", "mira-pearl-veil-cream-30"),
                new DemoVariant("50g", "MS-PV-50", 1899, 1599, 780, 26, "mira-pearl-veil-cream-50.png", "mira-pearl-veil-cream-50")
            });

        await SeedProductAsync(context, imageUploadService, env, vendor.Id,
            "Vellum & Dew", "Face Wash", ProductGender.Men, "Mineral Rain Gel Wash",
            "A cooling gel wash with zinc PCA, green tea, and glacier minerals.",
            "vellum-mineral-rain-wash.png", "vellum-mineral-rain-wash",
            new[]
            {
                new DemoVariant("120ml", "VD-MR-120", 999, 849, 410, 40, "vellum-mineral-rain-wash-120.png", "vellum-mineral-rain-wash-120"),
                new DemoVariant("240ml", "VD-MR-240", 1599, 1399, 720, 25, "vellum-mineral-rain-wash-240.png", "vellum-mineral-rain-wash-240")
            });

        await SeedProductAsync(context, imageUploadService, env, vendor.Id,
            "Vellum & Dew", "Nails", ProductGender.Unisex, "Glass Petal Nail Serum",
            "A nail serum with botanical oils, ceramide gloss, and a clean petal finish.",
            "vellum-glass-petal-serum.png", "vellum-glass-petal-serum",
            new[]
            {
                new DemoVariant("8ml", "VD-GP-8", 799, 649, 280, 42, "vellum-glass-petal-serum-8.png", "vellum-glass-petal-serum-8"),
                new DemoVariant("15ml", "VD-GP-15", 1199, 999, 460, 30, "vellum-glass-petal-serum-15.png", "vellum-glass-petal-serum-15")
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
        if (await context.Products.AnyAsync(p => p.Name == productName))
            return;

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
            var variantImageUrl = imageUrl;

            if (!string.IsNullOrWhiteSpace(variant.ImageFileName) &&
                !string.IsNullOrWhiteSpace(variant.PublicId))
            {
                var variantImagePath = Path.Combine(env.ContentRootPath, "SeedImages", variant.ImageFileName);

                variantImageUrl = await imageUploadService.UploadImageAsync(
                    variantImagePath,
                    variant.PublicId);
            }

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
                ImageUrl = variantImageUrl,
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
        int StockQuantity,
        string? ImageFileName = null,
        string? PublicId = null);
}
