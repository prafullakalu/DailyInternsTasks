namespace QbAppBackend.Services.Interfaces
{
    public interface ICurrentUserService
    {
        string GetUserId();
        string? TryGetUserId();
        string? GetEmail();
    }
}
