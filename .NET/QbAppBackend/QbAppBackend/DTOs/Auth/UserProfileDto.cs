namespace QbAppBackend.DTOs.Auth
{
    public class UserProfileDto
    {
        public string UserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string AuthProvider { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
