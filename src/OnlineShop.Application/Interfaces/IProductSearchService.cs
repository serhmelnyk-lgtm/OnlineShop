using OnlineShop.Application.DTOs;

namespace OnlineShop.Application.Interfaces;

public interface IProductSearchService
{
    Task<ProductSearchResponse> SearchAsync(ProductSearchRequest request, CancellationToken cancellationToken);
}

