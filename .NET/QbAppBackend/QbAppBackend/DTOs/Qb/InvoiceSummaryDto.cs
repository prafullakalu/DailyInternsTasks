namespace QbAppBackend.DTOs.Qb
{
    public class InvoiceSummaryDto
    {
        public Guid Id { get; set; }
        public string QuickbooksInvoiceId { get; set; } = string.Empty;
        public string CustomerId { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public DateTime TxnDate { get; set; }
        public DateTime DueDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal Balance { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TaxAmount { get; set; }
        public List<InvoiceLineDto> Lines { get; set; } = new();
    }
}
