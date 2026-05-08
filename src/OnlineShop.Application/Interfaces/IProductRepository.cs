using OnlineShop.Domain.Entities;

namespace OnlineShop.Application.Interfaces;

public interface IProductRepository
{
    Task<long> CountAsync(CancellationToken cancellationToken);
    Task AddRangeAsync(IEnumerable<Product> products, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}

