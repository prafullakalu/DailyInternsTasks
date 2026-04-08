using MongoDB.Driver;
using mongoAuthOrderApi.Models;

namespace mongoAuthOrderApi.repositories;

public class orderRepository
{
    private readonly IMongoCollection<order> _orders;

    public orderRepository(IMongoCollection<order> orders)
    {
        _orders = orders;
    }

    public async Task<List<order>> getAllOrdersAsync() =>
        await _orders.Find(_ => true).SortByDescending(o => o.createdAt).ToListAsync();

    public async Task<List<order>> getOrdersByUserIdAsync(string userId) =>
        await _orders.Find(o => o.userId == userId).SortByDescending(o => o.createdAt).ToListAsync();

    public async Task<order?> getOrderByIdAsync(string id) =>
        await _orders.Find(o => o.id == id).FirstOrDefaultAsync();

    public async Task createOrderAsync(order newOrder) =>
        await _orders.InsertOneAsync(newOrder);

    public async Task<bool> updateOrderAsync(string id, UpdateDefinition<order> update)
    {
        var result = await _orders.UpdateOneAsync(o => o.id == id, update);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> deleteOrderAsync(string id)
    {
        var result = await _orders.DeleteOneAsync(o => o.id == id);
        return result.DeletedCount > 0;
    }
}
