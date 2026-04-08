namespace QbAppBackend.Services.Models
{
    public sealed class IntuitSsoProfile
    {
        public string Subject { get; init; } = string.Empty;
        public string? Email { get; init; }
        public string? FullName { get; init; }
        public bool? EmailVerified { get; init; }
    }
}
