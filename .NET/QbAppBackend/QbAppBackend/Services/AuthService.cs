using MongoDB.Bson;
using MongoDB.Driver;
using QbAppBackend.DTOs.Auth;
using QbAppBackend.Models.Mongo;
using QbAppBackend.Services.Interfaces;
using QbAppBackend.Services.Models;

namespace QbAppBackend.Services
{
    public class AuthService : IAuthService
    {
        private readonly IMongoCollection<User> _users;
        private readonly ICurrentUserService _currentUserService;
        private readonly IIntuitSsoService _intuitSsoService;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IMongoDatabase database,
            ICurrentUserService currentUserService,
            IIntuitSsoService intuitSsoService,
            IJwtTokenService jwtTokenService,
            IEmailService emailService,
            ILogger<AuthService> logger)
        {
            _users = database.GetCollection<User>("Users");
            _currentUserService = currentUserService;
            _intuitSsoService = intuitSsoService;
            _jwtTokenService = jwtTokenService;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<AuthResponseDto> SignupAsync(SignupDto dto)
        {
            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
            if (await _users.Find(user => user.Email == normalizedEmail).AnyAsync())
            {
                throw new InvalidOperationException("A user with this email already exists.");
            }

            var user = new User
            {
                Id = ObjectId.GenerateNewId(),
                Email = normalizedEmail,
                FullName = dto.FullName.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                AuthProvider = "local",
                CreatedAt = DateTime.UtcNow
            };

            await _users.InsertOneAsync(user);
            return CreateAuthResponse(user);
        }

        public async Task<AuthResponseDto> SigninAsync(SigninDto dto)
        {
            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
            var user = await _users.Find(candidate => candidate.Email == normalizedEmail).FirstOrDefaultAsync();
            if (user is null || string.IsNullOrWhiteSpace(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                throw new InvalidOperationException("Invalid email or password.");
            }

            return CreateAuthResponse(user);
        }

        public string GetIntuitSignInUrl()
        {
            return _intuitSsoService.GetSignInUrl();
        }

        public async Task<AuthResponseDto> CompleteIntuitSigninAsync(string code)
        {
            var profile = await _intuitSsoService.CompleteSignInAsync(code);
            var (user, isNewUser) = await FindOrCreateIntuitUserAsync(profile);

            QueueIntuitAuthEmail(user.Email, user.FullName, isNewUser);
            return CreateAuthResponse(user);
        }

        public async Task<UserProfileDto> GetCurrentUserAsync()
        {
            var userId = _currentUserService.GetUserId();
            var user = await _users.Find(candidate => candidate.Id == ObjectId.Parse(userId)).FirstOrDefaultAsync()
                ?? throw new KeyNotFoundException("User not found.");

            return new UserProfileDto
            {
                UserId = user.Id.ToString(),
                Email = user.Email ?? string.Empty,
                FullName = user.FullName,
                AuthProvider = user.AuthProvider,
                CreatedAt = user.CreatedAt
            };
        }

        private async Task<(User user, bool isNewUser)> FindOrCreateIntuitUserAsync(IntuitSsoProfile profile)
        {
            // Always look up by sub first — it's the only guaranteed stable identifier
            var user = await _users.Find(candidate => candidate.IntuitSubject == profile.Subject).FirstOrDefaultAsync();

            // Secondary lookup by email only if sub lookup missed and we actually have an email
            if (user is null && !string.IsNullOrWhiteSpace(profile.Email))
            {
                user = await _users.Find(candidate => candidate.Email == profile.Email).FirstOrDefaultAsync();
            }

            if (user is null)
            {
                user = new User
                {
                    Id = ObjectId.GenerateNewId(),
                    Email = profile.Email,               
                    FullName = profile.FullName,
                    IntuitSubject = profile.Subject,
                    AuthProvider = "intuit",
                    CreatedAt = DateTime.UtcNow
                };

                await _users.InsertOneAsync(user);
                _logger.LogInformation("Created new Intuit user. Sub: {Subject}, Email: {Email}", profile.Subject, profile.Email ?? "(none)");
                return (user, true);
            }

            // Update the existing user's profile fields
            var update = Builders<User>.Update
                .Set(candidate => candidate.FullName, profile.FullName)
                .Set(candidate => candidate.IntuitSubject, profile.Subject)
                .Set(candidate => candidate.AuthProvider, "intuit");

            // Only update email if Intuit returned one — don't wipe an existing email with null
            if (!string.IsNullOrWhiteSpace(profile.Email))
            {
                update = update.Set(candidate => candidate.Email, profile.Email);
                user.Email = profile.Email;
            }

            await _users.UpdateOneAsync(candidate => candidate.Id == user.Id, update);
            user.FullName = profile.FullName;
            user.IntuitSubject = profile.Subject;
            user.AuthProvider = "intuit";

            _logger.LogInformation("Updated existing Intuit user. Sub: {Subject}, Email: {Email}", profile.Subject, user.Email ?? "(none)");
            return (user, false);
        }

        private AuthResponseDto CreateAuthResponse(User user)
        {
            return new AuthResponseDto
            {
                Token = _jwtTokenService.Generate(user),
                Email = user.Email ?? string.Empty,
                AuthProvider = user.AuthProvider,
                UserId = user.Id.ToString()
            };
        }

        private void QueueIntuitAuthEmail(string? email, string? fullName, bool isNewUser)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                _logger.LogInformation("Skipping Intuit auth email — no email address returned from Intuit (expected in Sandbox).");
                return;
            }

            _ = Task.Run(async () =>
            {
                try
                {
                    if (isNewUser)
                    {
                        await _emailService.SendWelcomeEmailAsync(email, fullName);
                    }
                    else
                    {
                        await _emailService.SendLoginNotificationEmailAsync(email, fullName);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to send Intuit auth email to {Email}.", email);
                }
            });
        }
    }
}