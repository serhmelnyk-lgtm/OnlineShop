using Elastic.Clients.Elasticsearch;
using Elastic.Transport;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OnlineShop.Application.Interfaces;
using OnlineShop.Infrastructure.Persistence;
using OnlineShop.Infrastructure.Repositories;
using OnlineShop.Infrastructure.Search;
using OnlineShop.Infrastructure.Seeding;

namespace OnlineShop.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(o =>
        {
            var cs = configuration.GetConnectionString("SqlServer")!;
            o.UseSqlServer(cs);
        });

        var esOptions = configuration.GetSection("Elasticsearch").Get<ElasticsearchOptions>() ?? new ElasticsearchOptions();
        services.AddSingleton(esOptions);

        services.AddSingleton(sp =>
        {
            var options = sp.GetRequiredService<ElasticsearchOptions>();
            var settings = new ElasticsearchClientSettings(new Uri(options.Url))
                .DisableDirectStreaming(); // makes DebugInformation more helpful

            if (!string.IsNullOrWhiteSpace(options.ApiKey))
                settings = settings.Authentication(new ApiKey(options.ApiKey));

            if (options.DisableCertificateValidation && options.Url.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                // Demo-friendly: allow self-signed/local certificates.
                settings = settings.ServerCertificateValidationCallback((_, _, _, _) => true);
            }

            return new ElasticsearchClient(settings);
        });

        services.AddSingleton<ElasticIndexService>();

        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ISeedService, SeedService>();
        services.AddScoped<IProductSearchService, ElasticProductSearchService>();

        return services;
    }
}

