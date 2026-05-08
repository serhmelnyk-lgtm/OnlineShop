using OnlineShop.Domain.Entities;

namespace OnlineShop.Infrastructure.Seeding;

internal static class ProductGenerator
{
    private static readonly string[] Categories =
    [
        "Smartphones",
        "Laptops",
        "Tablets",
        "Headphones",
        "Monitors",
        "Smartwatches",
        "Cameras",
        "Gaming Consoles",
    ];

    private static readonly string[] Brands =
    [
        "Apple",
        "Samsung",
        "Sony",
        "Dell",
        "Lenovo",
        "Asus",
        "HP",
        "Xiaomi",
        "Logitech",
    ];

    private static readonly string[] Colors = ["Black", "White", "Silver", "Gray", "Blue", "Green", "Red", "Pink"];
    private static readonly string[] Storage = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"];
    private static readonly string[] Ram = ["4 GB", "8 GB", "16 GB", "32 GB"];
    private static readonly string[] ScreenSizes = ["5.8\"", "6.1\"", "6.5\"", "11\"", "12.9\"", "13.3\"", "15.6\"", "27\"", "32\""];

    public static List<Product> GenerateProducts(int count)
    {
        var rng = new Random(1337);
        var now = DateTimeOffset.UtcNow;

        var products = new List<Product>(count);
        for (var i = 1; i <= count; i++)
        {
            var category = Categories[rng.Next(Categories.Length)];
            var brand = Brands[rng.Next(Brands.Length)];

            var name = GenerateName(rng, brand, category);
            var price = GeneratePrice(rng, category);
            var rating = Math.Round(2.8 + rng.NextDouble() * 2.2, 1);
            var stock = rng.Next(0, 120);
            var createdAt = now.AddDays(-rng.Next(0, 900)).AddHours(-rng.Next(0, 24));

            var product = new Product
            {
                Name = name,
                Description = GenerateDescription(rng, category),
                Brand = brand,
                Category = category,
                Price = price,
                Rating = rating,
                StockQuantity = stock,
                CreatedAt = createdAt,
                ImageUrl = $"https://picsum.photos/seed/{Uri.EscapeDataString(name)}/640/480",
            };

            product.Specifications.AddRange(GenerateSpecifications(rng, category));
            product.Reviews.AddRange(GenerateReviews(rng, createdAt));

            products.Add(product);
        }

        return products;
    }

    private static string GenerateName(Random rng, string brand, string category)
    {
        var model = $"{(char)('A' + rng.Next(0, 8))}{rng.Next(10, 99)}";
        return category switch
        {
            "Smartphones" => $"{brand} {model} Phone",
            "Laptops" => $"{brand} {model} Ultrabook",
            "Tablets" => $"{brand} {model} Tablet",
            "Headphones" => $"{brand} {model} Wireless Headphones",
            "Monitors" => $"{brand} {model} Monitor",
            "Smartwatches" => $"{brand} {model} Smartwatch",
            "Cameras" => $"{brand} {model} Mirrorless Camera",
            "Gaming Consoles" => $"{brand} {model} Gaming Console",
            _ => $"{brand} {model} Gadget",
        };
    }

    private static decimal GeneratePrice(Random rng, string category)
    {
        (int min, int max) = category switch
        {
            "Smartphones" => (299, 1399),
            "Laptops" => (599, 2499),
            "Tablets" => (199, 1299),
            "Headphones" => (49, 399),
            "Monitors" => (129, 1499),
            "Smartwatches" => (99, 699),
            "Cameras" => (349, 2999),
            "Gaming Consoles" => (199, 699),
            _ => (49, 999),
        };

        var price = rng.Next(min, max) + Math.Round((decimal)rng.NextDouble(), 2);
        return Math.Round(price, 2);
    }

    private static string GenerateDescription(Random rng, string category)
    {
        var phrases = category switch
        {
            "Smartphones" => new[]
            {
                "Crisp OLED display", "fast charging", "excellent low-light camera",
                "5G connectivity", "smooth 120Hz refresh rate"
            },
            "Laptops" => new[]
            {
                "lightweight aluminum body", "all-day battery", "quiet cooling",
                "high performance for dev work", "color-accurate display"
            },
            "Headphones" => new[]
            {
                "active noise cancelation", "deep bass", "comfortable ear cups",
                "low-latency mode", "multi-device pairing"
            },
            _ => new[]
            {
                "premium build quality", "reliable performance", "modern design",
                "great value", "easy setup"
            }
        };

        var picked = phrases.OrderBy(_ => rng.Next()).Take(3).ToArray();
        return $"A {category.ToLowerInvariant()} featuring {picked[0]}, {picked[1]}, and {picked[2]}.";
    }

    private static IEnumerable<ProductSpecification> GenerateSpecifications(Random rng, string category)
    {
        var specs = new List<ProductSpecification>
        {
            new() { Key = "Color", Value = Colors[rng.Next(Colors.Length)] },
            new() { Key = "Warranty", Value = rng.NextDouble() < 0.7 ? "2 years" : "1 year" },
        };

        switch (category)
        {
            case "Smartphones":
                specs.Add(new ProductSpecification { Key = "Storage", Value = Storage[rng.Next(0, 4)] });
                specs.Add(new ProductSpecification { Key = "Screen", Value = ScreenSizes[rng.Next(0, 3)] });
                specs.Add(new ProductSpecification { Key = "Camera MP", Value = $"{rng.Next(12, 108)} MP" });
                break;
            case "Laptops":
                specs.Add(new ProductSpecification { Key = "RAM", Value = Ram[rng.Next(1, Ram.Length)] });
                specs.Add(new ProductSpecification { Key = "Storage", Value = Storage[rng.Next(2, Storage.Length)] });
                specs.Add(new ProductSpecification { Key = "Screen", Value = ScreenSizes[rng.Next(5, 7)] });
                break;
            case "Tablets":
                specs.Add(new ProductSpecification { Key = "Storage", Value = Storage[rng.Next(0, 4)] });
                specs.Add(new ProductSpecification { Key = "Screen", Value = ScreenSizes[rng.Next(3, 5)] });
                break;
            case "Headphones":
                specs.Add(new ProductSpecification { Key = "Type", Value = rng.NextDouble() < 0.6 ? "Over-ear" : "In-ear" });
                specs.Add(new ProductSpecification { Key = "ANC", Value = rng.NextDouble() < 0.7 ? "Yes" : "No" });
                break;
            case "Monitors":
                specs.Add(new ProductSpecification { Key = "Size", Value = ScreenSizes[rng.Next(7, ScreenSizes.Length)] });
                specs.Add(new ProductSpecification { Key = "Refresh Rate", Value = rng.NextDouble() < 0.5 ? "144 Hz" : "60 Hz" });
                specs.Add(new ProductSpecification { Key = "Resolution", Value = rng.NextDouble() < 0.4 ? "4K" : "1440p" });
                break;
            case "Smartwatches":
                specs.Add(new ProductSpecification { Key = "GPS", Value = rng.NextDouble() < 0.8 ? "Yes" : "No" });
                specs.Add(new ProductSpecification { Key = "Water Resistance", Value = rng.NextDouble() < 0.7 ? "5 ATM" : "IP68" });
                break;
            case "Cameras":
                specs.Add(new ProductSpecification { Key = "Sensor", Value = rng.NextDouble() < 0.5 ? "Full Frame" : "APS-C" });
                specs.Add(new ProductSpecification { Key = "Video", Value = rng.NextDouble() < 0.5 ? "4K" : "1080p" });
                break;
            case "Gaming Consoles":
                specs.Add(new ProductSpecification { Key = "Storage", Value = rng.NextDouble() < 0.6 ? "1 TB" : "512 GB" });
                specs.Add(new ProductSpecification { Key = "Edition", Value = rng.NextDouble() < 0.5 ? "Standard" : "Digital" });
                break;
        }

        return specs;
    }

    private static IEnumerable<Review> GenerateReviews(Random rng, DateTimeOffset createdAt)
    {
        var count = rng.Next(0, 10);
        if (count == 0) return Array.Empty<Review>();

        var authors = new[] { "Alex", "Sam", "Jordan", "Taylor", "Morgan", "Chris", "Pat", "Jamie" };
        var comments = new[]
        {
            "Excellent quality for the price.",
            "Battery life is better than expected.",
            "Solid performance, but shipping was slow.",
            "Great display and smooth experience.",
            "Good value, would recommend.",
            "Not perfect, but overall satisfied.",
        };

        var reviews = new List<Review>(count);
        for (var i = 0; i < count; i++)
        {
            reviews.Add(new Review
            {
                Author = authors[rng.Next(authors.Length)],
                Rating = rng.Next(3, 6),
                Comment = comments[rng.Next(comments.Length)],
                CreatedAt = createdAt.AddDays(rng.Next(1, 180)),
            });
        }

        return reviews;
    }
}

