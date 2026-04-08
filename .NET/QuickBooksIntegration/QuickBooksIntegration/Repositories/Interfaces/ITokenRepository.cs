using QuickBooksIntegration.Models;

namespace QuickBooksIntegration.Repositories.Interfaces
{
    public interface ITokenRepository
    {
        Task SaveTokenAsync(tokenModel token);
        Task<tokenModel?> GetLatestTokenAsync();
        Task<tokenModel?> GetTokenByRealmIdAsync(string realmId);
    }
}
