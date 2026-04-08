using QbAppBackend.DTOs.Auth;

namespace QbAppBackend.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> SignupAsync(SignupDto dto);
        Task<AuthResponseDto> SigninAsync(SigninDto dto);
        string GetIntuitSignInUrl();
        Task<AuthResponseDto> CompleteIntuitSigninAsync(string code);
        Task<UserProfileDto> GetCurrentUserAsync();
    }
}
