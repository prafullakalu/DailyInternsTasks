using QbAppBackend.DTOs.Qb;

namespace QbAppBackend.Services.Interfaces
{
    public interface IQbService
    {
        string GetConnectUrl(string userId);
        Task<QbConnectionDto> ExchangeCodeAsync(string code, string realmId, string userId);
        Task<IReadOnlyList<QbConnectionDto>> GetConnectionsAsync();
        Task<bool> HasActiveConnectionAsync();
        Task DisconnectAsync(string realmId);
        Task<IReadOnlyList<QbEntitySummaryDto>> GetAccountsAsync();
        Task<IReadOnlyList<QbEntitySummaryDto>> GetCustomersAsync();
        Task<IReadOnlyList<QbEntitySummaryDto>> GetItemsAsync();
        Task<QbEntitySummaryDto> CreateAccountAsync(AccountDto dto);
        Task<QbEntitySummaryDto> UpdateAccountAsync(string id, AccountDto dto);
        Task DeleteAccountAsync(string id, string syncToken);
        Task<QbEntitySummaryDto> CreateCustomerAsync(CustomerDto dto);
        Task<QbEntitySummaryDto> UpdateCustomerAsync(string id, CustomerDto dto);
        Task DeleteCustomerAsync(string id, string syncToken);
        Task<QbEntitySummaryDto> CreateItemAsync(ItemDto dto);
        Task<QbEntitySummaryDto> UpdateItemAsync(string id, ItemDto dto);
        Task DeleteItemAsync(string id, string syncToken);
        Task<InvoiceSyncResultDto> CreateInvoiceAsync(CreateInvoiceDto dto);
        Task<InvoiceSyncResultDto> UpdateInvoiceAsync(string quickbooksInvoiceId, string syncToken, UpdateInvoiceDto dto);
        Task DeleteInvoiceAsync(string quickbooksInvoiceId, string syncToken);
    }
}
