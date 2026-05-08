using System.Text.Json;
using Elastic.Clients.Elasticsearch;
using Elastic.Transport;
using Microsoft.EntityFrameworkCore;
using HttpMethod = Elastic.Transport.HttpMethod;
using OnlineShop.Application.Interfaces;
using OnlineShop.Domain.Entities;
using OnlineShop.Infrastructure.Persistence;
using OnlineShop.Infrastructure.Search;

namespace OnlineShop.Infrastructure.Seeding;

public sealed class SeedService : ISeedService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly AppDbContext _db;
    private readonly IProductRepository _repo;
    private readonly ElasticIndexService _indexService;
    private readonly ElasticsearchClient _es;
    private readonly ElasticsearchOptions _esOptions;

    public SeedService(
        AppDbContext db,
        IProductRepository repo,
        ElasticIndexService indexService,
        ElasticsearchClient es,
        ElasticsearchOptions esOptions)
    {
        _db = db;
        _repo = repo;
        _indexService = indexService;
        _es = es;
        _esOptions = esOptions;
    }

    public async Task EnsureSeededAsync(CancellationToken cancellationToken)
    {
        // For a demo, EnsureCreated keeps onboarding friction low.
        await _db.Database.EnsureCreatedAsync(cancellationToken);

        var existing = await _repo.CountAsync(cancellationToken);
        if (existing < 200)
        {
            var products = ProductGenerator.GenerateProducts(240);
            await _repo.AddRangeAsync(products, cancellationToken);
            await _repo.SaveChangesAsync(cancellationToken);
        }

        // Demo-friendly: recreate so mapping + document shape stay in sync across runs.
        await _indexService.RecreateIndexAsync(cancellationToken);

        // Index whatever is in SQL. For a demo this is fine; for large datasets use incremental sync.
        var allProducts = await _db.Products
            .AsNoTracking()
            .Include(p => p.Specifications)
            .Include(p => p.Reviews)
            .ToListAsync(cancellationToken);

        var docs = allProducts.Select(ToDocument).ToList();

        // Educational: build a raw NDJSON _bulk payload so learners can inspect it.
        var ndjson = BuildBulkNdjson(_esOptions.IndexName, docs);
        var ep = new EndpointPath(HttpMethod.POST, "/_bulk?refresh=true");
        var bulk = await _es.Transport.RequestAsync<StringResponse>(
            ref ep,
            PostData.String(ndjson),
            static _ => { },
            // Elasticsearch requires *both* Accept and Content-Type to use the same "compatible-with"
            // style when the client uses API compatibility headers.
            new RequestConfiguration
            {
                Accept = "application/vnd.elasticsearch+x-ndjson;compatible-with=9",
                ContentType = "application/vnd.elasticsearch+x-ndjson;compatible-with=9"
            },
            cancellationToken);

        if (!bulk.ApiCallDetails.HasSuccessfulStatusCode)
            throw new InvalidOperationException($"Failed to bulk index products: {bulk.Body}");
    }

    private static ProductDocument ToDocument(Product p)
    {
        // Educational: we add OriginalPrice so we can demonstrate filter aggregations like "discounted".
        decimal? originalPrice = null;
        if (p.Price >= 150 && p.Id % 7 == 0)
        {
            var markup = (decimal)(0.08 + (p.Id % 10) * 0.01);
            originalPrice = Math.Round(p.Price * (1 + markup), 2);
        }

        return new ProductDocument
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Brand = p.Brand,
            Category = p.Category,
            Price = p.Price,
            Rating = p.Rating,
            StockQuantity = p.StockQuantity,
            CreatedAt = p.CreatedAt,
            ImageUrl = p.ImageUrl,
            OriginalPrice = originalPrice,
            Specifications = p.Specifications.Select(s => new SpecDocument { Key = s.Key, Value = s.Value }).ToList(),
            Reviews = p.Reviews.Select(r => new ReviewDocument
            {
                Author = r.Author,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            }).ToList()
        };
    }

    private static string BuildBulkNdjson(string indexName, IReadOnlyList<ProductDocument> docs)
    {
        using var sw = new StringWriter();
        foreach (var doc in docs)
        {
            sw.WriteLine(JsonSerializer.Serialize(new { index = new { _index = indexName, _id = doc.Id } }, JsonOptions));
            sw.WriteLine(JsonSerializer.Serialize(doc, JsonOptions));
        }
        return sw.ToString();
    }
}

