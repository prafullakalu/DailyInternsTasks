using QbAppBackend.Models.Mongo;

namespace QbAppBackend.Services.Interfaces
{
    public interface IJwtTokenService
    {
        string Generate(User user);
    }
}
