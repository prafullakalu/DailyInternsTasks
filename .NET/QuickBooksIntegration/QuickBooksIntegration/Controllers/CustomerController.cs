using Microsoft.AspNetCore.Mvc;
using QuickBooksIntegration.Models;
using QuickBooksIntegration.Services;

namespace QuickBooksIntegration.Controllers;

[ApiController]
[Route("api/customer")]
public class customerController : ControllerBase
{
    private readonly quickBooksService service;

    public customerController(quickBooksService service)
    {
        this.service = service;
    }

    [HttpPost("create")]
    public async Task<IActionResult> create(string token, string realmId, customerModel model)
    {
        return Ok(await service.createCustomer(token, realmId, model));
    }
}