using Microsoft.AspNetCore.Mvc;
using QuickBooksIntegration.Models;
using QuickBooksIntegration.Services;

namespace QuickBooksIntegration.Controllers;

[ApiController]
[Route("api/qbo")]
public class invoiceController : ControllerBase
{
    private readonly IQuickBooksRepository repository;

    public invoiceController(IQuickBooksRepository repository)
    {
        this.repository = repository;
    }

    // INVOICE
    [HttpPost("invoice/create")]
    public async Task<IActionResult> createInvoice(string token, string realmId, invoiceModel model)
    {
        return Ok(await repository.CreateInvoiceAsync(token, realmId, model));
    }

    [HttpGet("invoice/{id}")]
    public async Task<IActionResult> getInvoice(string token, string realmId, string id)
    {
        return Ok(await repository.GetInvoiceAsync(token, realmId, id));
    }

    [HttpPut("invoice/update")]
    public async Task<IActionResult> updateInvoice(string token, string realmId, invoiceModel model)
    {
        return Ok(await repository.UpdateInvoiceAsync(token, realmId, model));
    }

    [HttpDelete("invoice/delete")]
    public async Task<IActionResult> deleteInvoice(string token, string realmId, invoiceModel model)
    {
        return Ok(await repository.DeleteInvoiceAsync(token, realmId, model));
    }

    //[HttpGet("invoice/query")]
    //public async Task<IActionResult> queryInvoices(string token, string realmId, string query)
    //{
    //    return Ok(await repository.QueryInvoicesAsync(token, realmId, query));
    //}

    [HttpGet("current")]
    public async Task<IActionResult> getCurrent(string token, string realmId, int maxResults = 20)
    {
        var invoiceQuery = $"select * from Invoice MAXRESULTS {maxResults}";

        var invoices = await repository.QueryInvoicesAsync(token, realmId, invoiceQuery);

        return Ok(new { invoices = invoices });
    }
}