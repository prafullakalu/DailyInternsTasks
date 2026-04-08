using CleanApiProject.DTOs;
using CleanApiProject.Interfaces;
using CleanApiProject.Models;

namespace CleanApiProject.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IUserRepository userRepo, ITokenService tokenService, ILogger<AuthService> logger)
    {
        _userRepo = userRepo;
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
    {
        if (await _userRepo.EmailExistsAsync(dto.Email))
        {
            _logger.LogWarning("Registration failed: Email {Email} already exists.", dto.Email);
            return null;
        }

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            Password = hashedPassword,
            Role = "User",
            LastRoleUpdate = DateTime.UtcNow
        };

        var newId = await _userRepo.CreateAsync(user);
        user.Id = newId;

        var token = _tokenService.GenerateToken(user);

        _logger.LogInformation("User registered: {Email}", dto.Email);

        return new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            Role = user.Role,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30)
        };
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _userRepo.GetByEmailAsync(dto.Email);
        if (user == null)
        {
            _logger.LogWarning("Login failed: User not found for {Email}", dto.Email);
            return null;
        }

        var isValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.Password);
        if (!isValid)
        {
            _logger.LogWarning("Login failed: Wrong password for {Email}", dto.Email);
            return null;
        }

        var token = _tokenService.GenerateToken(user);

        _logger.LogInformation("User logged in: {Email} | Role: {Role}", dto.Email, user.Role);

        return new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            Role = user.Role,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30)
        };
    }
}
