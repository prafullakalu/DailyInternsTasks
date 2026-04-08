namespace QbAppBackend.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendWelcomeEmailAsync(string email, string? fullName);
        Task SendLoginNotificationEmailAsync(string email, string? fullName);
    }
}
