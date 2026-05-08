namespace OnlineShop.Application.DTOs;

public sealed record ProductDto(
    int Id,
    string Name,
    string Description,
    string Brand,
    string Category,
    decimal Price,
    double Rating,
    int StockQuantity,
    DateTimeOffset CreatedAt,
    string ImageUrl,
    IReadOnlyList<KeyValuePair<string, string>> Specifications,
    IReadOnlyList<ReviewDto> Reviews
);

public sealed record ReviewDto(
    int Id,
    string Author,
    int Rating,
    string Comment,
    DateTimeOffset CreatedAt
);

