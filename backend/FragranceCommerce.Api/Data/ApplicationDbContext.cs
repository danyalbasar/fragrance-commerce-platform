using FragranceCommerce.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FragranceCommerce.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductVariantImage> ProductVariantImages => Set<ProductVariantImage>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<ReviewImage> ReviewImages => Set<ReviewImage>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Coupon> Coupons => Set<Coupon>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();

            entity.Property(u => u.FirstName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(u => u.LastName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(u => u.Email)
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(u => u.PasswordHash)
                .IsRequired();
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasIndex(r => r.Name).IsUnique();

            entity.Property(r => r.Name)
                .HasMaxLength(50)
                .IsRequired();
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(ur => new { ur.UserId, ur.RoleId });

            entity.HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId);

            entity.HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId);
        });

        modelBuilder.Entity<Brand>(entity =>
        {
            entity.HasIndex(b => b.Name).IsUnique();
            entity.Property(b => b.Name).HasMaxLength(150).IsRequired();
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(c => c.Name).HasMaxLength(150).IsRequired();

            entity.HasOne(c => c.ParentCategory)
                .WithMany(c => c.SubCategories)
                .HasForeignKey(c => c.ParentCategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.Property(p => p.Name).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<ProductVariant>(entity =>
        {
            entity.HasIndex(v => v.SKU).IsUnique();
            entity.Property(v => v.SKU).HasMaxLength(100).IsRequired();
            entity.Property(v => v.VariantName).HasMaxLength(100).IsRequired();

            entity.Property(v => v.MRP).HasColumnType("decimal(18,2)");
            entity.Property(v => v.SellingPrice).HasColumnType("decimal(18,2)");
            entity.Property(v => v.CostPrice).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<ProductImage>(entity =>
        {
            entity.Property(i => i.ImageUrl).IsRequired();
        });

        modelBuilder.Entity<ProductVariantImage>(entity =>
        {
            entity.Property(i => i.ImageUrl).IsRequired();
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.Property(r => r.Rating).IsRequired();
        });

        modelBuilder.Entity<ReviewImage>(entity =>
        {
            entity.Property(i => i.ImageUrl).IsRequired();
        });

        modelBuilder.Entity<WishlistItem>(entity =>
        {
            entity.HasIndex(w => new { w.UserId, w.ProductId })
                .IsUnique();
        });

        modelBuilder.Entity<Coupon>(entity =>
        {
            entity.HasIndex(c => c.Code).IsUnique();

            entity.Property(c => c.Code)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(c => c.DiscountValue)
                .HasColumnType("decimal(18,2)");

            entity.Property(c => c.MinimumOrderAmount)
                .HasColumnType("decimal(18,2)");

            entity.Property(c => c.MaxDiscountAmount)
                .HasColumnType("decimal(18,2)");
        });
    }
}