namespace QbAppBackend.DTOs.Qb
{
    public class AccountDto
    {
        public string? SyncToken { get; set; }
        public string Name { get; set; } = string.Empty;
        public string AccountType { get; set; } = string.Empty;
        public string? AccountSubType { get; set; }
    }
}
