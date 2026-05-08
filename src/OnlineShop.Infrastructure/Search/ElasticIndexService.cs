using Elastic.Clients.Elasticsearch;
using Elastic.Transport;
using HttpMethod = Elastic.Transport.HttpMethod;

namespace OnlineShop.Infrastructure.Search;

public sealed class ElasticIndexService
{
    private readonly ElasticsearchClient _client;
    private readonly ElasticsearchOptions _options;

    public ElasticIndexService(ElasticsearchClient client, ElasticsearchOptions options)
    {
        _client = client;
        _options = options;
    }

    public async Task EnsureIndexAsync(CancellationToken cancellationToken)
    {
        var exists = await _client.Indices.ExistsAsync(_options.IndexName, cancellationToken);
        if (exists.Exists) return;

        // Educational: we send the mapping/settings as raw JSON so learners can read the exact index DSL.
        var body = """
        {
          "settings": {
            "analysis": {
              "tokenizer": {
                "edge_ngram_tokenizer": {
                  "type": "edge_ngram",
                  "min_gram": 2,
                  "max_gram": 20,
                  "token_chars": ["letter", "digit"]
                }
              },
              "analyzer": {
                "edge_ngram_analyzer": {
                  "type": "custom",
                  "tokenizer": "edge_ngram_tokenizer",
                  "filter": ["lowercase"]
                },
                "standard_with_lowercase": {
                  "type": "custom",
                  "tokenizer": "standard",
                  "filter": ["lowercase"]
                }
              }
            }
          },
          "mappings": {
            "properties": {
              "id": { "type": "integer" },
              "name": {
                "type": "text",
                "analyzer": "standard_with_lowercase",
                "fields": {
                  "keyword": { "type": "keyword", "ignore_above": 256 },
                  "suggest": { "type": "text", "analyzer": "edge_ngram_analyzer" }
                }
              },
              "description": { "type": "text", "analyzer": "standard_with_lowercase" },
              "brand": { "type": "keyword" },
              "category": { "type": "keyword" },
              "price": { "type": "scaled_float", "scaling_factor": 100 },
              "rating": { "type": "double" },
              "stockQuantity": { "type": "integer" },
              "createdAt": { "type": "date" },
              "imageUrl": { "type": "keyword" },
              "originalPrice": { "type": "scaled_float", "scaling_factor": 100 },
              "isDiscounted": { "type": "boolean" },
              "specifications": {
                "type": "nested",
                "properties": {
                  "key": { "type": "keyword" },
                  "value": { "type": "keyword" }
                }
              },
              "reviews": {
                "type": "nested",
                "properties": {
                  "author": { "type": "keyword" },
                  "rating": { "type": "integer" },
                  "comment": { "type": "text", "analyzer": "standard_with_lowercase" },
                  "createdAt": { "type": "date" }
                }
              }
            }
          }
        }
        """;

        var ep = new EndpointPath(HttpMethod.PUT, $"/{_options.IndexName}");
        var response = await _client.Transport.RequestAsync<StringResponse>(
            ref ep,
            PostData.String(body),
            static _ => { },
            null,
            cancellationToken);

        if (!response.ApiCallDetails.HasSuccessfulStatusCode)
            throw new InvalidOperationException($"Failed to create Elasticsearch index '{_options.IndexName}': {response.Body}");
    }

    public async Task RecreateIndexAsync(CancellationToken cancellationToken)
    {
        await _client.Indices.DeleteAsync(_options.IndexName, cancellationToken);
        await EnsureIndexAsync(cancellationToken);
    }
}

