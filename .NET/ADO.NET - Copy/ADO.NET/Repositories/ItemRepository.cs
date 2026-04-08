using Microsoft.EntityFrameworkCore;
using CleanApiProject.Data;
using CleanApiProject.Interfaces;
using CleanApiProject.Models;

namespace CleanApiProject.Repositories;

public class ItemRepository : IItemRepository
{
    private readonly AppDbContext _context;

    public ItemRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Item?> GetByIdAsync(int id)
    {
        return await _context.Items.FindAsync(id);
    }

    public async Task<IEnumerable<Item>> GetAllAsync()
    {
        return await _context.Items
            .OrderBy(i => i.Id)
            .ToListAsync();
    }

    public async Task<int> CreateAsync(Item item)
    {
        await _context.Items.AddAsync(item);
        await _context.SaveChangesAsync();
        return item.Id;
    }

    public async Task<bool> UpdateAsync(Item item)
    {
        _context.Items.Update(item);
        var rows = await _context.SaveChangesAsync();
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var rows = await _context.Items
            .Where(i => i.Id == id)
            .ExecuteDeleteAsync();

        return rows > 0;
    }
}