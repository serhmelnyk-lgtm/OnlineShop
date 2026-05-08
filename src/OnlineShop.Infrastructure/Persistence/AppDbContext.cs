using Microsoft.EntityFrameworkCore;
using OnlineShop.Domain.Entities;

namespace OnlineShop.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductSpecification> ProductSpecifications => Set<ProductSpecification>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.Description).HasMaxLength(4000).IsRequired();
            b.Property(x => x.Brand).HasMaxLength(100).IsRequired();
            b.Property(x => x.Category).HasMaxLength(100).IsRequired();
            b.Property(x => x.Price).HasPrecision(18, 2);
            b.Property(x => x.ImageUrl).HasMaxLength(500).IsRequired();
            b.HasMany(x => x.Specifications).WithOne(x => x.Product).HasForeignKey(x => x.ProductId);
            b.HasMany(x => x.Reviews).WithOne(x => x.Product).HasForeignKey(x => x.ProductId);
        });

        modelBuilder.Entity<ProductSpecification>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Key).HasMaxLength(100).IsRequired();
            b.Property(x => x.Value).HasMaxLength(200).IsRequired();
            b.HasIndex(x => new { x.ProductId, x.Key });
        });

        modelBuilder.Entity<Review>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Author).HasMaxLength(100).IsRequired();
            b.Property(x => x.Comment).HasMaxLength(2000).IsRequired();
            b.HasIndex(x => x.ProductId);
        });
    }
}

