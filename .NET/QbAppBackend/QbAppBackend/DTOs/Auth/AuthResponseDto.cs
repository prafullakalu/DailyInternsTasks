namespace QbAppBackend.DTOs.Auth
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string AuthProvider { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
    }
}
