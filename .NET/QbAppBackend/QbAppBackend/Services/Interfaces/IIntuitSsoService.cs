using QbAppBackend.Services.Models;

namespace QbAppBackend.Services.Interfaces
{
    public interface IIntuitSsoService
    {
        string GetSignInUrl();
        Task<IntuitSsoProfile> CompleteSignInAsync(string code);
    }
}
