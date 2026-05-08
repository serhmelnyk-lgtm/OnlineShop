using Microsoft.EntityFrameworkCore;
using OnlineShop.Application.Interfaces;
using OnlineShop.Domain.Entities;
using OnlineShop.Infrastructure.Persistence;

namespace OnlineShop.Infrastructure.Repositories;

public sealed class ProductRepository : IProductRepository
{
    private readonly AppDbContext _db;

    public ProductRepository(AppDbContext db) => _db = db;

    public Task<long> CountAsync(CancellationToken cancellationToken) =>
        _db.Products.LongCountAsync(cancellationToken);

    public async Task AddRangeAsync(IEnumerable<Product> products, CancellationToken cancellationToken)
    {
        await _db.Products.AddRangeAsync(products, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        _db.SaveChangesAsync(cancellationToken);
}

