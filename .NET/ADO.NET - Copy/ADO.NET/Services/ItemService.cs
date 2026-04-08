using CleanApiProject.DTOs;
using CleanApiProject.Interfaces;
using CleanApiProject.Models;

namespace CleanApiProject.Services;

public class ItemService : IItemService
{
    private readonly IItemRepository _itemRepo;
    private readonly ILogger<ItemService> _logger;

    public ItemService(IItemRepository itemRepo, ILogger<ItemService> logger)
    {
        _itemRepo = itemRepo;
        _logger = logger;
    }

    public async Task<Item?> GetByIdAsync(int id)
        => await _itemRepo.GetByIdAsync(id);

    public async Task<IEnumerable<Item>> GetAllAsync()
        => await _itemRepo.GetAllAsync();

    public async Task<Item> CreateAsync(ItemDto dto)
    {
        var item = new Item { Name = dto.Name, Price = dto.Price };
        var newId = await _itemRepo.CreateAsync(item);
        item.Id = newId;

        _logger.LogInformation("Item created: Id={Id}, Name={Name}", newId, item.Name);
        return item;
    }

    public async Task<bool> UpdateAsync(int id, ItemDto dto)
    {
        var existing = await _itemRepo.GetByIdAsync(id);
        if (existing == null) return false;

        existing.Name = dto.Name;
        existing.Price = dto.Price;

        var result = await _itemRepo.UpdateAsync(existing);
        if (result)
            _logger.LogInformation("Item updated: Id={Id}", id);

        return result;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var result = await _itemRepo.DeleteAsync(id);
        if (result)
            _logger.LogInformation("Item deleted: Id={Id}", id);
        return result;
    }
}
