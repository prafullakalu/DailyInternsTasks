using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using mongoAuthOrderApi.Models;
using mongoAuthOrderApi.services;
using MongoDB.Driver;

namespace mongoAuthOrderApi.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class ordersController : ControllerBase
{
    private readonly mongoDbService _db;

    public ordersController(mongoDbService db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<IActionResult> create([FromBody] order newOrder)
    {
        await _db.orderRepo.createOrderAsync(newOrder);
        return Ok(newOrder);
    }

    [HttpGet]
    public async Task<IActionResult> getAll()
    {
        var orders = await _db.orderRepo.getAllOrdersAsync();
        return Ok(orders);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> update(string id, [FromBody] order updated)
    {
        var existing = await _db.orderRepo.getOrderByIdAsync(id);
        if (existing == null) return NotFound(new { message = "Order not found" });

        var updateDef = MongoDB.Driver.Builders<order>.Update
            .Set(o => o.title, updated.title)
            .Set(o => o.description, updated.description)
            .Set(o => o.amount, updated.amount)
            .Set(o => o.status, updated.status)
            .Set(o => o.updatedAt, DateTime.UtcNow);

        var result = await _db.orderRepo.updateOrderAsync(id, updateDef);
        return result ? Ok(updated) : StatusCode(500, new { message = "Update failed" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> delete(string id)
    {
        var existing = await _db.orderRepo.getOrderByIdAsync(id);
        if (existing == null) return NotFound(new { message = "Order not found" });

        var result = await _db.orderRepo.deleteOrderAsync(id);
        return result ? Ok(new { message = "Order deleted" }) : StatusCode(500, new { message = "Delete failed" });
    }
}