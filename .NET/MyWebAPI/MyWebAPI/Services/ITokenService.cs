namespace MyWebAPI.Services
{
    public interface ITokenService
    {
        string GenerateToken(string username);
    }
}