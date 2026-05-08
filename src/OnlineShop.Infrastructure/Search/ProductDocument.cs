namespace OnlineShop.Infrastructure.Search;

public sealed class ProductDocument
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

    public decimal? OriginalPrice { get; set; }
    public bool IsDiscounted => OriginalPrice.HasValue && OriginalPrice.Value > Price;

    public List<SpecDocument> Specifications { get; set; } = new();
    public List<ReviewDocument> Reviews { get; set; } = new();
}

public sealed class SpecDocument
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
}

public sealed class ReviewDocument
{
    public string Author { get; set; } = null!;
    public int Rating { get; set; }
    public string Comment { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }
}

