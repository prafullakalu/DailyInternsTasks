using MongoDB.Driver;
using mongoAuthOrderApi.Models;

namespace mongoAuthOrderApi.repositories;

public class userRepository
{
    private readonly IMongoCollection<user> _users;

    public userRepository(IMongoCollection<user> users)
    {
        _users = users;
    }

    public async Task<List<user>> getAllUsersAsync() =>
        await _users.Find(_ => true).ToListAsync();

    public async Task<user?> getUserByIdAsync(string id) =>
        await _users.Find(u => u.id == id).FirstOrDefaultAsync();

    public async Task<user?> getUserByEmailAsync(string email) =>
        await _users.Find(u => u.email == email).FirstOrDefaultAsync();

    public async Task<user?> getUserByUsernameAsync(string username) =>
        await _users.Find(u => u.username == username).FirstOrDefaultAsync();

    public async Task createUserAsync(user newUser) =>
        await _users.InsertOneAsync(newUser);

    public async Task<bool> updateUserAsync(string id, UpdateDefinition<user> update)
    {
        var result = await _users.UpdateOneAsync(u => u.id == id, update);
        return result.ModifiedCount > 0;
    }


 


    public async Task<bool> deleteUserAsync(string id)
    {
        var result = await _users.DeleteOneAsync(u => u.id == id);
        return result.DeletedCount > 0;
    }
}
