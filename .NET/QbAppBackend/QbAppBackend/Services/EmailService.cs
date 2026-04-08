using System.Net;
using System.Net.Mail;
using QbAppBackend.Services.Interfaces;

namespace QbAppBackend.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public Task SendWelcomeEmailAsync(string email, string? fullName)
        {
            var displayName = string.IsNullOrWhiteSpace(fullName) ? "there" : fullName.Trim();
            return SendEmailAsync(
                email,
                "Welcome to QbApp",
                $"""
                <p>Hi {displayName},</p>
                <p>Your QuickBooks sign-in is now connected to QbApp.</p>
                <p>You can now access your dashboard and connect a company whenever you are ready.</p>
                <p>Thanks,<br/>QbApp</p>
                """);
        }

        public Task SendLoginNotificationEmailAsync(string email, string? fullName)
        {
            var displayName = string.IsNullOrWhiteSpace(fullName) ? "there" : fullName.Trim();
            return SendEmailAsync(
                email,
                "QbApp sign-in notification",
                $"""
                <p>Hi {displayName},</p>
                <p>Your QbApp account was just accessed using Sign in with Intuit.</p>
                <p>If this was you, no action is needed.</p>
                <p>Thanks,<br/>QbApp</p>
                """);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            if (string.IsNullOrWhiteSpace(toEmail))
            {
                _logger.LogInformation("[EmailService] Skipping {Subject} email because the user has no email address.", subject);
                return;
            }

            var smtpHost = _configuration["Email:SmtpHost"];
            var smtpUser = _configuration["Email:SmtpUser"];
            var smtpPassword = _configuration["Email:SmtpPassword"];
            var fromEmail = _configuration["Email:FromEmail"];
            var fromName = _configuration["Email:FromName"] ?? "QbApp";
            var smtpPort = int.TryParse(_configuration["Email:SmtpPort"], out var parsedPort) ? parsedPort : 587;

            if (string.IsNullOrWhiteSpace(smtpHost) ||
                string.IsNullOrWhiteSpace(smtpUser) ||
                string.IsNullOrWhiteSpace(smtpPassword) ||
                string.IsNullOrWhiteSpace(fromEmail))
            {
                _logger.LogWarning("[EmailService] Email settings are incomplete. Skipping {Subject} email.", subject);
                return;
            }

            try
            {
                using var message = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };
                message.To.Add(toEmail);

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(smtpUser, smtpPassword)
                };

                await client.SendMailAsync(message);
                _logger.LogInformation("[EmailService] Sent {Subject} email to {Email}.", subject, toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[EmailService] Failed to send {Subject} email to {Email}.", subject, toEmail);
            }
        }
    }
}
