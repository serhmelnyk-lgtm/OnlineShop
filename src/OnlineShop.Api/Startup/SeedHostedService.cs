using OnlineShop.Application.Interfaces;

namespace OnlineShop.Api.Startup;

public sealed class SeedHostedService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SeedHostedService> _logger;

    public SeedHostedService(IServiceProvider serviceProvider, ILogger<SeedHostedService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var seeder = scope.ServiceProvider.GetRequiredService<ISeedService>();

        _logger.LogInformation("Seeding SQL + Elasticsearch (if needed)...");
        await seeder.EnsureSeededAsync(cancellationToken);
        _logger.LogInformation("Seeding complete.");
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}

