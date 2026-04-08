namespace QbAppBackend.DTOs.Qb
{
    public class InvoiceSyncResultDto
    {
        public string QuickbooksInvoiceId { get; set; } = string.Empty;
        public string SyncToken { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal Balance { get; set; }
        public string Status { get; set; } = "Open";
        public decimal TaxAmount { get; set; }
    }
}
