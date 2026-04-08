using QbAppBackend.DTOs.Qb;

namespace QbAppBackend.Services.Interfaces
{
    public interface IInvoiceService
    {
        Task<InvoiceSummaryDto> CreateAsync(CreateInvoiceDto dto);
        Task<IReadOnlyList<InvoiceSummaryDto>> GetAllAsync();
        Task<InvoiceSummaryDto> GetByIdAsync(Guid id);
        Task<InvoiceSummaryDto> UpdateAsync(Guid id, UpdateInvoiceDto dto);
        Task DeleteAsync(Guid id);
    }
}
