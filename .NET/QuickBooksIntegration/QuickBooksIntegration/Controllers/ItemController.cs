using Microsoft.AspNetCore.Mvc;
using QuickBooksIntegration.Models;
using QuickBooksIntegration.Services;

namespace QuickBooksIntegration.Controllers;

[ApiController]
[Route("api/item")]
public class itemController : ControllerBase
{
    private readonly quickBooksService service;

    public itemController(quickBooksService service)
    {
        this.service = service;
    }

    [HttpPost("create")]
    public async Task<IActionResult> create(string token, string realmId, itemModel model)
    {
        return Ok(await service.createItem(token, realmId, model));
    }
}