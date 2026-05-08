using Microsoft.AspNetCore.Mvc;
using OnlineShop.Api.Observability;

namespace OnlineShop.Api.Controllers;

[ApiController]
[Route("api/admin")]
public sealed class AdminController : ControllerBase
{
    private readonly RecentErrorStore _errors;

    public AdminController(RecentErrorStore errors) => _errors = errors;

    [HttpGet("errors")]
    [ProducesResponseType(typeof(IReadOnlyList<RecentErrorEntry>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<RecentErrorEntry>> GetErrors([FromQuery] int limit = 50)
    {
        return Ok(_errors.GetLast(limit));
    }
}

