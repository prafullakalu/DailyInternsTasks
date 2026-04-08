namespace QbAppBackend.DTOs.Qb
{
    public class QbConnectionDto
    {
        public string RealmId { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public DateTime ConnectedAt { get; set; }
        public bool IsExpired { get; set; }
    }
}
