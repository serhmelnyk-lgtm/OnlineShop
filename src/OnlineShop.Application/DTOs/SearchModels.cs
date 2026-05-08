namespace OnlineShop.Application.DTOs;

public sealed record ProductSearchRequest
{
    public string? Query { get; init; }

    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 24;

    public ProductSort Sort { get; init; } = ProductSort.Relevance;

    public List<string> Brands { get; init; } = new();
    public List<string> Categories { get; init; } = new();

    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }

    public double? MinRating { get; init; }

    public bool? InStockOnly { get; init; }

    public DateTimeOffset? CreatedFrom { get; init; }
    public DateTimeOffset? CreatedTo { get; init; }

    /// <summary>
    /// Dynamic faceting: filter by specifications (key -> allowed values).
    /// Example: { "Color": ["Black","Silver"], "RAM": ["16 GB"] }
    /// </summary>
    public Dictionary<string, List<string>> Specs { get; init; } = new();

    /// <summary>
    /// Educational: request the backend to include raw Elasticsearch query & response JSON strings.
    /// </summary>
    public bool IncludeDebug { get; init; } = true;

    /// <summary>
    /// Educational: choose which bucket strategy to use for certain aggregations.
    /// </summary>
    public AggregationMode AggregationMode { get; init; } = AggregationMode.Terms;
}

public enum ProductSort
{
    Relevance = 0,
    PriceAsc = 1,
    PriceDesc = 2,
    RatingDesc = 3,
    Newest = 4,
}

public enum AggregationMode
{
    Terms = 0,
    Composite = 1,
}

public sealed record ProductSearchResponse(
    IReadOnlyList<ProductDto> Items,
    long Total,
    int Page,
    int PageSize,
    SearchAggregations Aggregations,
    SearchDebugInfo? Debug
);

public sealed record SearchAggregations
{
    public IReadOnlyList<BucketCount> Brands { get; init; } = Array.Empty<BucketCount>();
    public IReadOnlyList<BucketCount> Categories { get; init; } = Array.Empty<BucketCount>();

    public IReadOnlyList<RangeBucket> PriceRanges { get; init; } = Array.Empty<RangeBucket>();
    public IReadOnlyList<HistogramBucket> PriceHistogram { get; init; } = Array.Empty<HistogramBucket>();
    public IReadOnlyList<DateHistogramBucket> ProductsPerMonth { get; init; } = Array.Empty<DateHistogramBucket>();

    public StatsSummary PriceStats { get; init; } = new();
    public long UniqueBrands { get; init; }

    public FilterCounts Filters { get; init; } = new();

    public IReadOnlyList<BucketCount> RatingDistribution { get; init; } = Array.Empty<BucketCount>();

    public IReadOnlyList<BucketCount> SpecKeys { get; init; } = Array.Empty<BucketCount>();
    public IReadOnlyDictionary<string, IReadOnlyList<BucketCount>> SpecValuesByKey { get; init; }
        = new Dictionary<string, IReadOnlyList<BucketCount>>();

    public IReadOnlyList<CategoryBrandAvgPrice> CategoryBrandAvgPrice { get; init; } = Array.Empty<CategoryBrandAvgPrice>();

    public IReadOnlyList<DateHistogramBucket> CumulativeNewProducts { get; init; } = Array.Empty<DateHistogramBucket>();
}

public sealed record BucketCount(string Key, long Count);

public sealed record RangeBucket(string Key, decimal? From, decimal? To, long Count);

public sealed record HistogramBucket(double Key, long Count);

public sealed record DateHistogramBucket(DateTimeOffset Date, long Count, double? Value = null);

public sealed record StatsSummary
{
    public double Min { get; init; }
    public double Max { get; init; }
    public double Avg { get; init; }
    public double Sum { get; init; }
    public long Count { get; init; }
}

public sealed record FilterCounts
{
    public long InStock { get; init; }
    public long OutOfStock { get; init; }
    public long Discounted { get; init; }
}

public sealed record CategoryBrandAvgPrice(
    string Category,
    IReadOnlyList<BrandAvgPrice> Brands
);

public sealed record BrandAvgPrice(
    string Brand,
    double AvgPrice
);

public sealed record SearchDebugInfo
{
    public string? ElasticsearchQueryJson { get; init; }
    public string? ElasticsearchResponseJson { get; init; }

    public long TookMs { get; init; }
    public long ReturnedHits { get; init; }
    public long TotalHits { get; init; }

    public IReadOnlyList<AggregationExplanation> Explanations { get; init; } = Array.Empty<AggregationExplanation>();
}

public sealed record AggregationExplanation(
    string Name,
    string Type,
    string Why,
    string Expected
);

