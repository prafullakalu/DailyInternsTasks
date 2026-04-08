namespace QbAppBackend.DTOs.Qb
{
    public class QbEntitySummaryDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? SyncToken { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? CompanyName { get; set; }
        public string? Mobile { get; set; }
        public string? Fax { get; set; }
        public string? Cc { get; set; }
        public string? Bcc { get; set; }
        public decimal? UnitPrice { get; set; }
        public string? Type { get; set; }
    }
}
