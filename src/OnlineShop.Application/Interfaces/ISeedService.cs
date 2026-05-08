namespace OnlineShop.Application.Interfaces;

public interface ISeedService
{
    Task EnsureSeededAsync(CancellationToken cancellationToken);
}

