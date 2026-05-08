using Microsoft.AspNetCore.Mvc;
using OnlineShop.Application.DTOs;
using OnlineShop.Application.Interfaces;

namespace OnlineShop.Api.Controllers;

[ApiController]
[Route("api/search")]
public sealed class SearchController : ControllerBase
{
    private readonly IProductSearchService _search;

    public SearchController(IProductSearchService search) => _search = search;

    [HttpPost]
    [ProducesResponseType(typeof(ProductSearchResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProductSearchResponse>> Search([FromBody] ProductSearchRequest request, CancellationToken cancellationToken)
    {
        var result = await _search.SearchAsync(request, cancellationToken);
        return Ok(result);
    }
}

