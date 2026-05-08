using System.Collections.Concurrent;

namespace OnlineShop.Api.Observability;

public sealed record RecentErrorEntry(
    string Id,
    DateTimeOffset AtUtc,
    string TraceId,
    string Method,
    string Path,
    string Message,
    string ExceptionType,
    string? Stack);

public sealed class RecentErrorStore
{
    private readonly ConcurrentQueue<RecentErrorEntry> _queue = new();
    private int _maxEntries = 200;

    public void ConfigureMaxEntries(int maxEntries)
    {
        _maxEntries = Math.Clamp(maxEntries, 10, 10_000);
        TrimIfNeeded();
    }

    public void Add(RecentErrorEntry entry)
    {
        _queue.Enqueue(entry);
        TrimIfNeeded();
    }

    public IReadOnlyList<RecentErrorEntry> GetLast(int limit)
    {
        limit = Math.Clamp(limit, 1, _maxEntries);
        var arr = _queue.ToArray();
        if (arr.Length == 0) return Array.Empty<RecentErrorEntry>();

        var take = Math.Min(limit, arr.Length);
        return arr.Skip(Math.Max(0, arr.Length - take)).Reverse().ToArray();
    }

    private void TrimIfNeeded()
    {
        while (_queue.Count > _maxEntries && _queue.TryDequeue(out _))
        {
        }
    }
}

