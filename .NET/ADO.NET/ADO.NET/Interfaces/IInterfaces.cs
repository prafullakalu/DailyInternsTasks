
using CleanApiProject.DTOs;
using CleanApiProject.Models;

namespace CleanApiProject.Interfaces;

// ─────────────────────────────────────────────
//  REPOSITORY INTERFACES
//  Repositories only talk to the database.
//  No business logic here.
// ─────────────────────────────────────────────

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetAllAsync();
    Task<int> CreateAsync(User user);
    Task<bool> UpdateAsync(User user);
    Task<bool> DeleteAsync(int id);
    Task<bool> UpdateRoleAsync(int id, string role);
    Task<bool> EmailExistsAsync(string email);
}

public interface IItemRepository
{
    Task<Item?> GetByIdAsync(int id);
    Task<IEnumerable<Item>> GetAllAsync();
    Task<int> CreateAsync(Item item);
    Task<bool> UpdateAsync(Item item);
    Task<bool> DeleteAsync(int id);
}

// ─────────────────────────────────────────────
//  SERVICE INTERFACES
//  Services contain business logic and call
//  repositories to access the database.
// ─────────────────────────────────────────────

public interface IAuthService
{
    Task<AuthResponseDto?> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
}

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(int id);
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<bool> UpdateRoleAsync(int id, string role);
    Task<bool> DeleteAsync(int id);
}

public interface IItemService
{
    Task<Item?> GetByIdAsync(int id);
    Task<IEnumerable<Item>> GetAllAsync();
    Task<Item> CreateAsync(ItemDto dto);
    Task<bool> UpdateAsync(int id, ItemDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface ITokenService
{
    string GenerateToken(User user);
    // Validates that role in token matches current role in DB
    Task<bool> IsTokenRoleValidAsync(int userId, DateTime tokenIssuedAt);
}
