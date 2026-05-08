using System.Net;
using System.Text.Json;
using OnlineShop.Api.Observability;

namespace OnlineShop.Api.Middleware;

public sealed class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly RecentErrorStore _errors;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger, RecentErrorStore errors)
    {
        _next = next;
        _logger = logger;
        _errors = errors;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            // 499 is a de-facto standard used by some proxies/servers for "client closed request".
            context.Response.StatusCode = 499;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            _errors.Add(new RecentErrorEntry(
                Id: Guid.NewGuid().ToString("n"),
                AtUtc: DateTimeOffset.UtcNow,
                TraceId: context.TraceIdentifier,
                Method: context.Request.Method,
                Path: context.Request.Path.ToString(),
                Message: ex.Message,
                ExceptionType: ex.GetType().FullName ?? ex.GetType().Name,
                Stack: ex.ToString()
            ));
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";

            var payload = JsonSerializer.Serialize(new
            {
                error = "Unexpected error",
                traceId = context.TraceIdentifier
            });

            await context.Response.WriteAsync(payload);
        }
    }
}

