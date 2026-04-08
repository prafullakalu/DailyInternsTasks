using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CleanApiProject.DTOs;
using CleanApiProject.Interfaces;

namespace CleanApiProject.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ItemController : ControllerBase
{
    private readonly IItemService _itemService;

    public ItemController(IItemService itemService)
    {
        _itemService = itemService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,User")]
    public async Task<IActionResult> GetAll()
    {
        var items = await _itemService.GetAllAsync();
        return Ok(new { success = true, data = items });
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,User")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _itemService.GetByIdAsync(id);
        if (item == null)
            return NotFound(new { success = false, message = $"Item with id={id} not found." });

        return Ok(new { success = true, data = item });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] ItemDto dto)
    {
        var item = await _itemService.CreateAsync(dto);
        return StatusCode(201, new { success = true, data = item });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] ItemDto dto)
    {
        var updated = await _itemService.UpdateAsync(id, dto);
        if (!updated)
            return NotFound(new { success = false, message = $"Item with id={id} not found." });

        return Ok(new { success = true, message = "Item updated successfully." });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _itemService.DeleteAsync(id);
        if (!deleted)
            return NotFound(new { success = false, message = $"Item with id={id} not found." });

        return Ok(new { success = true, message = "Item deleted successfully." });
    }
}
