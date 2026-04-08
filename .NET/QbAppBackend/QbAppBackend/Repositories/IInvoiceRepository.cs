using QbAppBackend.Models.Sql;

namespace QbAppBackend.Repositories
{
    public interface IInvoiceRepository
    {
        Task AddAsync(Invoice invoice);
        Task<List<Invoice>> GetAllByUserAsync(string userId);
        Task<Invoice?> GetByIdAsync(Guid id);
        Task UpdateAsync(Invoice invoice);
        Task DeleteAsync(Guid id);
    }
}