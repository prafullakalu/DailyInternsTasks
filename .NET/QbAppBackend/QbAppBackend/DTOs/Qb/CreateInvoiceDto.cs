namespace QbAppBackend.DTOs.Qb
{
    public class CreateInvoiceDto
    {
        public string CustomerId { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public DateTime TxnDate { get; set; } = DateTime.UtcNow.Date;
        public DateTime DueDate { get; set; } = DateTime.UtcNow.Date.AddDays(30);
        public decimal TaxAmount { get; set; }
        public List<InvoiceLineDto> Lines { get; set; } = new();
    }

    public class InvoiceLineDto
    {
        public string ItemId { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
