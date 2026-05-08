namespace OnlineShop.Domain.Entities;

public sealed class ProductSpecification
{
    public int Id { get; set; }
    public int ProductId { get; set; }

    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;

    public Product Product { get; set; } = null!;
}

