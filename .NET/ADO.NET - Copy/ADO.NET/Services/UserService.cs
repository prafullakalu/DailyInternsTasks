using CleanApiProject.DTOs;
using CleanApiProject.Interfaces;
using CleanApiProject.Models;

namespace CleanApiProject.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepo;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository userRepo, ILogger<UserService> logger)
    {
        _userRepo = userRepo;
        _logger = logger;
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null) return null;
        return toDto(user);
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _userRepo.GetAllAsync();
        return users.Select(toDto);
    }

    public async Task<bool> UpdateRoleAsync(int id, string role)
    {
        if (role != "Admin" && role != "User")
        {
            _logger.LogWarning("Invalid role value: {Role}", role);
            return false;
        }

        var result = await _userRepo.UpdateRoleAsync(id, role);
        if (result)
            _logger.LogInformation("Role updated for userId={Id} to {Role}", id, role);

        return result;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var result = await _userRepo.DeleteAsync(id);
        if (result)
            _logger.LogInformation("User deleted: userId={Id}", id);
        return result;
    }

    private static UserDto toDto(User u) => new()
    {
        Id = u.Id,
        Name = u.Name,
        Email = u.Email,
        Role = u.Role,
        LastRoleUpdate = u.LastRoleUpdate
    };
}
