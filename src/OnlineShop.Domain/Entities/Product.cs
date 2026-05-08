namespace OnlineShop.Domain.Entities;

public sealed class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;

    public string Brand { get; set; } = null!;
    public string Category { get; set; } = null!;

    public decimal Price { get; set; }
    public double Rating { get; set; }
    public int StockQuantity { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string ImageUrl { get; set; } = null!;

    public List<ProductSpecification> Specifications { get; set; } = new();
    public List<Review> Reviews { get; set; } = new();
}

