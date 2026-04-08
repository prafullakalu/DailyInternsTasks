namespace QbAppBackend.DTOs.Qb
{
    public class ItemDto
    {
        public string? SyncToken { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = "Service";
        public string IncomeAccountId { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
