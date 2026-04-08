using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QbAppBackend.DTOs.Qb;
using QbAppBackend.Services.Interfaces;

namespace QbAppBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/invoices")]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;

        public InvoiceController(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }

        [HttpPost]
        public async Task<ActionResult<InvoiceSummaryDto>> Create([FromBody] CreateInvoiceDto dto)
        {
            return Ok(await _invoiceService.CreateAsync(dto));
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<InvoiceSummaryDto>>> GetAll()
        {
            return Ok(await _invoiceService.GetAllAsync());
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<InvoiceSummaryDto>> GetById(Guid id)
        {
            return Ok(await _invoiceService.GetByIdAsync(id));
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<InvoiceSummaryDto>> Update(Guid id, [FromBody] UpdateInvoiceDto dto)
        {
            return Ok(await _invoiceService.UpdateAsync(id, dto));
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _invoiceService.DeleteAsync(id);
            return NoContent();
        }
    }
}
