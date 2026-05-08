namespace OnlineShop.Domain.Entities;

public sealed class Review
{
    public int Id { get; set; }
    public int ProductId { get; set; }

    public string Author { get; set; } = null!;
    public int Rating { get; set; }
    public string Comment { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }

    public Product Product { get; set; } = null!;
}

