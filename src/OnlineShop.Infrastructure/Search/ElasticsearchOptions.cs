namespace OnlineShop.Infrastructure.Search;

public sealed record ElasticsearchOptions
{
    public string Url { get; init; } = "http://localhost:9200";
    public string IndexName { get; init; } = "products";
    public bool DisableCertificateValidation { get; init; } = true;
    public string ApiKey { get; init; } = string.Empty;
}

