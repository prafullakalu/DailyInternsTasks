using System.Security.Claims;
using QbAppBackend.Services.Interfaces;

namespace QbAppBackend.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string GetUserId()
        {
            return TryGetUserId() ?? throw new UnauthorizedAccessException("User is not authenticated.");
        }

        public string? TryGetUserId()
        {
            return _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? _httpContextAccessor.HttpContext?.User.FindFirstValue("sub");
        }

        public string? GetEmail()
        {
            return _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);
        }
    }
}
