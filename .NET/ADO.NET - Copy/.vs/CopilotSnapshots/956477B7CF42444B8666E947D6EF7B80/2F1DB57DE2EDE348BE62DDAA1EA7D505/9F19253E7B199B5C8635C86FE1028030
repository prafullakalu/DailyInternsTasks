using Microsoft.EntityFrameworkCore;
using CleanApiProject.Data;
using CleanApiProject.Interfaces;
using CleanApiProject.Models;

namespace CleanApiProject.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users
            .OrderBy(u => u.Id)
            .ToListAsync();
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users
            .AnyAsync(u => u.Email == email);
    }

    public async Task<int> CreateAsync(User user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        return user.Id;
    }

    public async Task<bool> UpdateAsync(User user)
    {
        _context.Users.Update(user);
        var rows = await _context.SaveChangesAsync();
        return rows > 0;
    }

    public async Task<bool> UpdateRoleAsync(int id, string role)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        user.Role = role;
        user.LastRoleUpdate = DateTime.UtcNow;

        var rows = await _context.SaveChangesAsync();
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var rows = await _context.Users
            .Where(u => u.Id == id)
            .ExecuteDeleteAsync();

        return rows > 0;
    }
}