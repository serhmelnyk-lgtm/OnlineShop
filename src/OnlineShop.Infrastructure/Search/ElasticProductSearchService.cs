using System.Text.Json;
using Elastic.Clients.Elasticsearch;
using Elastic.Transport;
using OnlineShop.Application.DTOs;
using OnlineShop.Application.Interfaces;
using HttpMethod = Elastic.Transport.HttpMethod;

namespace OnlineShop.Infrastructure.Search;

public sealed class ElasticProductSearchService : IProductSearchService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly ElasticsearchClient _client;
    private readonly ElasticsearchOptions _options;

    public ElasticProductSearchService(ElasticsearchClient client, ElasticsearchOptions options)
    {
        _client = client;
        _options = options;
    }

    public async Task<ProductSearchResponse> SearchAsync(ProductSearchRequest request, CancellationToken cancellationToken)
    {
        var (body, explanations) = BuildSearchBody(request);

        // Educational: we use the low-level transport to get *raw JSON* so the UI can show
        // (1) the exact query that was sent and (2) the raw aggregations response.
        var path = $"/{_options.IndexName}/_search";
        var postData = PostData.Serializable(body);

        var ep = new EndpointPath(HttpMethod.POST, path);
        var esResponse = await _client.Transport.RequestAsync<StringResponse>(
            ref ep,
            postData,
            static _ => { },
            null,
            cancellationToken);

        if (!esResponse.ApiCallDetails.HasSuccessfulStatusCode)
            throw new InvalidOperationException($"Elasticsearch request failed: {esResponse.Body}");

        using var doc = JsonDocument.Parse(esResponse.Body);

        var root = doc.RootElement;
        var took = root.TryGetProperty("took", out var tookEl) ? tookEl.GetInt64() : 0;
        var hits = root.GetProperty("hits");
        var totalHits = hits.GetProperty("total").GetProperty("value").GetInt64();

        var items = ParseHits(hits);
        var aggs = ParseAggregations(root);

        SearchDebugInfo? debug = null;
        if (request.IncludeDebug)
        {
            debug = new SearchDebugInfo
            {
                ElasticsearchQueryJson = JsonSerializer.Serialize(body, JsonOptions),
                ElasticsearchResponseJson = esResponse.Body,
                TookMs = took,
                ReturnedHits = items.Count,
                TotalHits = totalHits,
                Explanations = explanations
            };
        }

        return new ProductSearchResponse(
            items,
            totalHits,
            request.Page,
            request.PageSize,
            aggs,
            debug
        );
    }

    private static (object body, IReadOnlyList<AggregationExplanation> explanations) BuildSearchBody(ProductSearchRequest r)
    {
        var from = Math.Max(0, (r.Page - 1) * r.PageSize);
        var size = Math.Clamp(r.PageSize, 1, 100);
        var queryText = (r.Query ?? string.Empty).Trim();

        var must = new List<object>();
        var filter = new List<object>();

        if (!string.IsNullOrWhiteSpace(queryText))
        {
            // Educational: multi_match + fuzziness provides "typo tolerance" for small typos.
            must.Add(new
            {
                multi_match = new
                {
                    query = queryText,
                    fields = new[] { "name^4", "name.suggest^2", "description" },
                    fuzziness = "AUTO",
                    @operator = "and"
                }
            });
        }
        else
        {
            must.Add(new { match_all = new { } });
        }

        if (r.Brands.Count > 0) filter.Add(new { terms = new { brand = r.Brands } });
        if (r.Categories.Count > 0) filter.Add(new { terms = new { category = r.Categories } });
        if (r.MinPrice is not null || r.MaxPrice is not null)
        {
            filter.Add(new
            {
                range = new
                {
                    price = new
                    {
                        gte = r.MinPrice,
                        lte = r.MaxPrice
                    }
                }
            });
        }

        if (r.MinRating is not null)
        {
            filter.Add(new { range = new { rating = new { gte = r.MinRating } } });
        }

        if (r.InStockOnly == true)
        {
            filter.Add(new { range = new { stockQuantity = new { gt = 0 } } });
        }

        if (r.CreatedFrom is not null || r.CreatedTo is not null)
        {
            filter.Add(new { range = new { createdAt = new { gte = r.CreatedFrom, lte = r.CreatedTo } } });
        }

        foreach (var (key, values) in r.Specs)
        {
            if (values.Count == 0) continue;
            // Nested filter: specs contain { key: K, value in V }
            filter.Add(new
            {
                nested = new
                {
                    path = "specifications",
                    query = new
                    {
                        @bool = new
                        {
                            filter = new object[]
                            {
                                new Dictionary<string, object>
                                {
                                    ["term"] = new Dictionary<string, object> { ["specifications.key"] = key }
                                },
                                new Dictionary<string, object>
                                {
                                    ["terms"] = new Dictionary<string, object> { ["specifications.value"] = values }
                                }
                            }
                        }
                    }
                }
            });
        }

        var sort = r.Sort switch
        {
            ProductSort.PriceAsc => new object[] { new { price = new { order = "asc" } }, "_score" },
            ProductSort.PriceDesc => new object[] { new { price = new { order = "desc" } }, "_score" },
            ProductSort.RatingDesc => new object[] { new { rating = new { order = "desc" } }, "_score" },
            ProductSort.Newest => new object[] { new { createdAt = new { order = "desc" } }, "_score" },
            _ => Array.Empty<object>(),
        };

        var highlight = new
        {
            pre_tags = new[] { "<mark>" },
            post_tags = new[] { "</mark>" },
            fields = new Dictionary<string, object>
            {
                ["name"] = new { },
                ["description"] = new { }
            }
        };

        object brandAgg = r.AggregationMode == AggregationMode.Composite
            ? new
            {
                composite = new
                {
                    size = 50,
                    sources = new object[]
                    {
                        new { brand = new { terms = new { field = "brand" } } }
                    }
                }
            }
            : new { terms = new { field = "brand", size = 20 } };

        object categoryAgg = r.AggregationMode == AggregationMode.Composite
            ? new
            {
                composite = new
                {
                    size = 50,
                    sources = new object[]
                    {
                        new { category = new { terms = new { field = "category" } } }
                    }
                }
            }
            : new { terms = new { field = "category", size = 20 } };

        var aggs = new Dictionary<string, object>
        {
            // 1) Terms aggregation (or Composite)
            ["brands"] = brandAgg,
            ["categories"] = categoryAgg,

            // 2) Range aggregation (price ranges)
            ["price_ranges"] = new
            {
                range = new
                {
                    field = "price",
                    ranges = new object[]
                    {
                        new { to = 100, key = "Under $100" },
                        new { from = 100, to = 300, key = "$100 - $300" },
                        new { from = 300, to = 700, key = "$300 - $700" },
                        new { from = 700, to = 1200, key = "$700 - $1200" },
                        new { from = 1200, key = "$1200+" },
                    }
                }
            },

            // 3) Histogram aggregation (price distribution)
            ["price_histogram"] = new
            {
                histogram = new
                {
                    field = "price",
                    interval = 100,
                    min_doc_count = 0
                }
            },

            // 4) Date histogram (products added per month)
            ["products_per_month"] = new
            {
                date_histogram = new
                {
                    field = "createdAt",
                    calendar_interval = "month"
                },
                aggs = new
                {
                    new_products = new { value_count = new { field = "id" } },
                    // 10) Pipeline: cumulative sum and a simple moving average trend
                    cumulative_new_products = new { cumulative_sum = new { buckets_path = "new_products" } },
                    moving_avg_new_products = new
                    {
                        moving_fn = new
                        {
                            buckets_path = "new_products",
                            window = 3,
                            script = "MovingFunctions.unweightedAvg(values)"
                        }
                    }
                }
            },

            // 5) stats
            ["price_stats"] = new { stats = new { field = "price" } },

            // 6) cardinality
            ["unique_brands"] = new { cardinality = new { field = "brand" } },

            // 7) filter aggregation examples
            ["filters"] = new
            {
                filters = new
                {
                    filters = new Dictionary<string, object>
                    {
                        ["in_stock"] = new { range = new { stockQuantity = new { gt = 0 } } },
                        ["out_of_stock"] = new { term = new { stockQuantity = 0 } },
                        ["discounted"] = new { term = new { isDiscounted = true } },
                    }
                }
            },

            // 8) nested aggregations: review rating distribution
            ["review_ratings"] = new
            {
                nested = new { path = "reviews" },
                aggs = new
                {
                    ratings = new { terms = new { field = "reviews.rating", size = 5 } }
                }
            },

            // 8) nested aggregations: spec keys and values
            ["specs"] = new
            {
                nested = new { path = "specifications" },
                aggs = new
                {
                    keys = new
                    {
                        terms = new { field = "specifications.key", size = 20 },
                        aggs = new
                        {
                            values = new { terms = new { field = "specifications.value", size = 20 } }
                        }
                    }
                }
            },

            // 9) multi-level aggregations: category -> brand -> average price
            ["category_brand_avg_price"] = new
            {
                terms = new { field = "category", size = 20 },
                aggs = new
                {
                    brands = new
                    {
                        terms = new { field = "brand", size = 20 },
                        aggs = new
                        {
                            avg_price = new { avg = new { field = "price" } }
                        }
                    }
                }
            }
        };

        var body = new
        {
            track_total_hits = true,
            from,
            size,
            query = new
            {
                @bool = new
                {
                    must,
                    filter
                }
            },
            highlight,
            sort = sort.Length == 0 ? null : sort,
            aggs
        };

        var explanations = new List<AggregationExplanation>
        {
            new("brands/categories", r.AggregationMode == AggregationMode.Composite ? "composite" : "terms",
                "Show the most common brands/categories for faceted navigation.",
                "Buckets like { key: \"Apple\", doc_count: 42 }"),
            new("price_ranges", "range",
                "Predefined price ranges are easy for users to understand.",
                "Buckets like \"Under $100\" with doc_count."),
            new("price_histogram", "histogram",
                "A histogram shows the distribution across the numeric range.",
                "Evenly spaced numeric buckets (interval=100)."),
            new("products_per_month", "date_histogram + pipeline",
                "Date buckets show how inventory grows over time; pipelines add trend lines.",
                "Monthly buckets + cumulative sum + moving average."),
            new("price_stats", "stats",
                "Quick summary metrics: min/max/avg/count.",
                "A single object with min/max/avg/sum/count."),
            new("unique_brands", "cardinality",
                "Estimate the number of unique values (brands).",
                "A single 'value' count."),
            new("filters", "filters",
                "Count special segments (in stock / discounted) without changing the main result set.",
                "Named buckets with doc_count."),
            new("review_ratings", "nested + terms",
                "Reviews are nested objects; nested agg scopes buckets inside them.",
                "Distribution of 1..5 star ratings."),
            new("specs", "nested + terms",
                "Specifications are nested key/value pairs; this builds dynamic faceting.",
                "Keys -> values buckets with counts."),
            new("category_brand_avg_price", "terms + terms + avg",
                "Multi-level buckets answer questions like: which brands are expensive per category?",
                "Category buckets containing brand buckets containing avg price.")
        };

        return (body, explanations);
    }

    private static List<ProductDto> ParseHits(JsonElement hits)
    {
        var list = new List<ProductDto>();
        foreach (var hit in hits.GetProperty("hits").EnumerateArray())
        {
            var source = hit.GetProperty("_source");

            var id = source.GetProperty("id").GetInt32();
            var name = source.GetProperty("name").GetString()!;
            var description = source.GetProperty("description").GetString()!;
            var brand = source.GetProperty("brand").GetString()!;
            var category = source.GetProperty("category").GetString()!;
            var price = source.GetProperty("price").GetDecimal();
            var rating = source.GetProperty("rating").GetDouble();
            var stock = source.GetProperty("stockQuantity").GetInt32();
            var createdAt = source.GetProperty("createdAt").GetDateTimeOffset();
            var imageUrl = source.GetProperty("imageUrl").GetString()!;

            var specs = new List<KeyValuePair<string, string>>();
            if (source.TryGetProperty("specifications", out var specsEl) && specsEl.ValueKind == JsonValueKind.Array)
            {
                foreach (var s in specsEl.EnumerateArray())
                {
                    var k = s.GetProperty("key").GetString()!;
                    var v = s.GetProperty("value").GetString()!;
                    specs.Add(new KeyValuePair<string, string>(k, v));
                }
            }

            var reviews = new List<ReviewDto>();
            if (source.TryGetProperty("reviews", out var reviewsEl) && reviewsEl.ValueKind == JsonValueKind.Array)
            {
                var reviewId = 1;
                foreach (var r in reviewsEl.EnumerateArray())
                {
                    reviews.Add(new ReviewDto(
                        reviewId++,
                        r.GetProperty("author").GetString()!,
                        r.GetProperty("rating").GetInt32(),
                        r.GetProperty("comment").GetString()!,
                        r.GetProperty("createdAt").GetDateTimeOffset()
                    ));
                }
            }

            // Highlight (educational): replace fields if highlight exists.
            if (hit.TryGetProperty("highlight", out var hl))
            {
                if (hl.TryGetProperty("name", out var hn) && hn.ValueKind == JsonValueKind.Array)
                    name = hn.EnumerateArray().First().GetString() ?? name;
                if (hl.TryGetProperty("description", out var hd) && hd.ValueKind == JsonValueKind.Array)
                    description = hd.EnumerateArray().First().GetString() ?? description;
            }

            list.Add(new ProductDto(
                id, name, description, brand, category, price, rating, stock, createdAt, imageUrl, specs, reviews
            ));
        }

        return list;
    }

    private static SearchAggregations ParseAggregations(JsonElement root)
    {
        if (!root.TryGetProperty("aggregations", out var aggsEl))
            return new SearchAggregations();

        var (specKeys, specValuesByKey) = ParseSpecs(aggsEl, "specs");

        return new SearchAggregations
        {
            Brands = ParseTermsOrComposite(aggsEl, "brands", compositeKey: "brand"),
            Categories = ParseTermsOrComposite(aggsEl, "categories", compositeKey: "category"),
            PriceRanges = ParseRange(aggsEl, "price_ranges"),
            PriceHistogram = ParseHistogram(aggsEl, "price_histogram"),
            ProductsPerMonth = ParseDateHistogram(aggsEl, "products_per_month"),
            CumulativeNewProducts = ParsePipelineFromDateHistogram(aggsEl, "products_per_month", "cumulative_new_products"),
            PriceStats = ParseStats(aggsEl, "price_stats"),
            UniqueBrands = ParseCardinality(aggsEl, "unique_brands"),
            Filters = ParseFilters(aggsEl, "filters"),
            RatingDistribution = ParseNestedTerms(aggsEl, "review_ratings", "ratings"),
            SpecKeys = specKeys,
            SpecValuesByKey = specValuesByKey,
            CategoryBrandAvgPrice = ParseCategoryBrandAvgPrice(aggsEl, "category_brand_avg_price")
        };
    }

    private static IReadOnlyList<BucketCount> ParseTermsOrComposite(JsonElement aggs, string name, string compositeKey)
    {
        if (!aggs.TryGetProperty(name, out var agg)) return Array.Empty<BucketCount>();

        // terms: { buckets: [ { key, doc_count } ] }
        if (agg.TryGetProperty("buckets", out var buckets) && buckets.ValueKind == JsonValueKind.Array)
        {
            var list = new List<BucketCount>();
            foreach (var b in buckets.EnumerateArray())
                list.Add(new BucketCount(b.GetProperty("key").ToString(), b.GetProperty("doc_count").GetInt64()));
            return list;
        }

        // composite: { buckets: [ { key: { brand: "Apple" }, doc_count } ] }
        if (agg.TryGetProperty("buckets", out var cb) && cb.ValueKind == JsonValueKind.Array)
        {
            var list = new List<BucketCount>();
            foreach (var b in cb.EnumerateArray())
            {
                var keyObj = b.GetProperty("key");
                var key = keyObj.TryGetProperty(compositeKey, out var v) ? v.ToString() : keyObj.ToString();
                list.Add(new BucketCount(key, b.GetProperty("doc_count").GetInt64()));
            }
            return list;
        }

        return Array.Empty<BucketCount>();
    }

    private static IReadOnlyList<RangeBucket> ParseRange(JsonElement aggs, string name)
    {
        if (!aggs.TryGetProperty(name, out var agg)) return Array.Empty<RangeBucket>();
        if (!agg.TryGetProperty("buckets", out var buckets) || buckets.ValueKind != JsonValueKind.Array) return Array.Empty<RangeBucket>();

        var list = new List<RangeBucket>();
        foreach (var b in buckets.EnumerateArray())
        {
            var key = b.GetProperty("key").GetString() ?? b.GetProperty("key").ToString();
            decimal? from = b.TryGetProperty("from", out var f) ? f.GetDecimal() : null;
            decimal? to = b.TryGetProperty("to", out var t) ? t.GetDecimal() : null;
            var count = b.GetProperty("doc_count").GetInt64();
            list.Add(new RangeBucket(key, from, to, count));
        }

        return list;
    }

    private static IReadOnlyList<HistogramBucket> ParseHistogram(JsonElement aggs, string name)
    {
        if (!aggs.TryGetProperty(name, out var agg)) return Array.Empty<HistogramBucket>();
        if (!agg.TryGetProperty("buckets", out var buckets) || buckets.ValueKind != JsonValueKind.Array) return Array.Empty<HistogramBucket>();

        var list = new List<HistogramBucket>();
        foreach (var b in buckets.EnumerateArray())
        {
            var key = b.GetProperty("key").GetDouble();
            var count = b.GetProperty("doc_count").GetInt64();
            list.Add(new HistogramBucket(key, count));
        }

        return list;
    }

    private static IReadOnlyList<DateHistogramBucket> ParseDateHistogram(JsonElement aggs, string name)
    {
        if (!aggs.TryGetProperty(name, out var agg)) return Array.Empty<DateHistogramBucket>();
        if (!agg.TryGetProperty("buckets", out var buckets) || buckets.ValueKind != JsonValueKind.Array) return Array.Empty<DateHistogramBucket>();

        var list = new List<DateHistogramBucket>();
        foreach (var b in buckets.EnumerateArray())
        {
            var date = DateTimeOffset.FromUnixTimeMilliseconds(b.GetProperty("key").GetInt64());
            var count = b.GetProperty("doc_count").GetInt64();
            list.Add(new DateHistogramBucket(date, count));
        }

        return list;
    }

    private static IReadOnlyList<DateHistogramBucket> ParsePipelineFromDateHistogram(JsonElement aggs, string name, string pipelineAggName)
    {
        if (!aggs.TryGetProperty(name, out var agg)) return Array.Empty<DateHistogramBucket>();
        if (!agg.TryGetProperty("buckets", out var buckets) || buckets.ValueKind != JsonValueKind.Array) return Array.Empty<DateHistogramBucket>();

        var list = new List<DateHistogramBucket>();
        foreach (var b in buckets.EnumerateArray())
        {
            var date = DateTimeOffset.FromUnixTimeMilliseconds(b.GetProperty("key").GetInt64());
            var value = b.TryGetProperty(pipelineAggName, out var metric) && metric.TryGetProperty("value", out var v) && v.ValueKind != JsonValueKind.Null
                ? v.GetDouble()
                : (double?)null;
            list.Add(new DateHistogramBucket(date, 0, value));
        }

        return list;
    }

    private static StatsSummary ParseStats(JsonElement aggs, string name)
    {
        if (!aggs.TryGetProperty(name, out var agg)) return new StatsSummary();
        static double GetDoubleOrZero(JsonElement parent, string prop)
        {
            return parent.TryGetProperty(prop, out var v) && v.ValueKind != JsonValueKind.Null ? v.GetDouble() : 0d;
        }

        static long GetInt64OrZero(JsonElement parent, string prop)
        {
            return parent.TryGetProperty(prop, out var v) && v.ValueKind != JsonValueKind.Null ? v.GetInt64() : 0L;
        }

        return new StatsSummary
        {
            Min = GetDoubleOrZero(agg, "min"),
            Max = GetDoubleOrZero(agg, "max"),
            Avg = GetDoubleOrZero(agg, "avg"),
            Sum = GetDoubleOrZero(agg, "sum"),
            Count = GetInt64OrZero(agg, "count")
        };
    }

    private static long ParseCardinality(JsonElement aggs, string name)
    {
        if (!aggs.TryGetProperty(name, out var agg)) return 0;
        return agg.TryGetProperty("value", out var v) ? v.GetInt64() : 0;
    }

    private static FilterCounts ParseFilters(JsonElement aggs, string name)
    {
        if (!aggs.TryGetProperty(name, out var agg)) return new FilterCounts();
        if (!agg.TryGetProperty("buckets", out var buckets)) return new FilterCounts();

        long GetBucket(string bucketName) =>
            buckets.TryGetProperty(bucketName, out var b) ? b.GetProperty("doc_count").GetInt64() : 0;

        return new FilterCounts
        {
            InStock = GetBucket("in_stock"),
            OutOfStock = GetBucket("out_of_stock"),
            Discounted = GetBucket("discounted"),
        };
    }

    private static IReadOnlyList<BucketCount> ParseNestedTerms(JsonElement aggs, string nestedName, string termsName)
    {
        if (!aggs.TryGetProperty(nestedName, out var nested)) return Array.Empty<BucketCount>();
        if (!nested.TryGetProperty(termsName, out var terms)) return Array.Empty<BucketCount>();
        if (!terms.TryGetProperty("buckets", out var buckets) || buckets.ValueKind != JsonValueKind.Array) return Array.Empty<BucketCount>();

        var list = new List<BucketCount>();
        foreach (var b in buckets.EnumerateArray())
            list.Add(new BucketCount(b.GetProperty("key").ToString(), b.GetProperty("doc_count").GetInt64()));
        return list.OrderBy(x => x.Key).ToList();
    }

    private static (IReadOnlyList<BucketCount> Keys, IReadOnlyDictionary<string, IReadOnlyList<BucketCount>> ValuesByKey) ParseSpecs(JsonElement aggs, string name)
    {
        if (!aggs.TryGetProperty(name, out var nested)) return (Array.Empty<BucketCount>(), new Dictionary<string, IReadOnlyList<BucketCount>>());
        if (!nested.TryGetProperty("keys", out var keysAgg)) return (Array.Empty<BucketCount>(), new Dictionary<string, IReadOnlyList<BucketCount>>());
        if (!keysAgg.TryGetProperty("buckets", out var buckets) || buckets.ValueKind != JsonValueKind.Array)
            return (Array.Empty<BucketCount>(), new Dictionary<string, IReadOnlyList<BucketCount>>());

        var keys = new List<BucketCount>();
        var valuesByKey = new Dictionary<string, IReadOnlyList<BucketCount>>(StringComparer.OrdinalIgnoreCase);

        foreach (var b in buckets.EnumerateArray())
        {
            var key = b.GetProperty("key").GetString()!;
            keys.Add(new BucketCount(key, b.GetProperty("doc_count").GetInt64()));

            if (b.TryGetProperty("values", out var valuesAgg) &&
                valuesAgg.TryGetProperty("buckets", out var vb) &&
                vb.ValueKind == JsonValueKind.Array)
            {
                var values = new List<BucketCount>();
                foreach (var v in vb.EnumerateArray())
                    values.Add(new BucketCount(v.GetProperty("key").ToString(), v.GetProperty("doc_count").GetInt64()));
                valuesByKey[key] = values;
            }
        }

        return (keys, valuesByKey);
    }

    private static IReadOnlyList<CategoryBrandAvgPrice> ParseCategoryBrandAvgPrice(JsonElement aggs, string name)
    {
        if (!aggs.TryGetProperty(name, out var catAgg)) return Array.Empty<CategoryBrandAvgPrice>();
        if (!catAgg.TryGetProperty("buckets", out var catBuckets) || catBuckets.ValueKind != JsonValueKind.Array) return Array.Empty<CategoryBrandAvgPrice>();

        var list = new List<CategoryBrandAvgPrice>();
        foreach (var cat in catBuckets.EnumerateArray())
        {
            var category = cat.GetProperty("key").ToString();
            var brands = new List<BrandAvgPrice>();

            if (cat.TryGetProperty("brands", out var brandsAgg) &&
                brandsAgg.TryGetProperty("buckets", out var brandBuckets) &&
                brandBuckets.ValueKind == JsonValueKind.Array)
            {
                foreach (var b in brandBuckets.EnumerateArray())
                {
                    var brand = b.GetProperty("key").ToString();
                    var avgPrice = b.GetProperty("avg_price").GetProperty("value").GetDouble();
                    brands.Add(new BrandAvgPrice(brand, avgPrice));
                }
            }

            list.Add(new CategoryBrandAvgPrice(category, brands.OrderByDescending(x => x.AvgPrice).ToList()));
        }

        return list;
    }
}

