using QuickBooksIntegration.Models;

namespace QuickBooksIntegration.Services;

public interface IQuickBooksRepository
{
    Task<string> CreateInvoiceAsync(string token, string realmId, invoiceModel model);
    Task<string> GetInvoiceAsync(string token, string realmId, string id);
    Task<string> UpdateInvoiceAsync(string token, string realmId, invoiceModel model);
    Task<string> DeleteInvoiceAsync(string token, string realmId, invoiceModel model);
    Task<string> QueryInvoicesAsync(string token, string realmId, string query);
}
