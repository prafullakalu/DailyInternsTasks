using Microsoft.Extensions.Options;
using MongoDB.Driver;
using mongoAuthOrderApi.Models;
using mongoAuthOrderApi.settings;
using mongoAuthOrderApi.repositories;

namespace mongoAuthOrderApi.services;

public class mongoDbService
{
    // Expose repositories so other parts of the app can use them directly
    public readonly userRepository userRepo;
    public readonly orderRepository orderRepo;

    public mongoDbService(IOptions<mongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.connectionString);
        var database = client.GetDatabase(settings.Value.databaseName);

        var usersCollection = database.GetCollection<user>("users");
        var ordersCollection = database.GetCollection<order>("orders");

        // Initialize repositories
        userRepo = new userRepository(usersCollection);
        orderRepo = new orderRepository(ordersCollection);

        // Create indexes
        var userEmailIndex = Builders<user>.IndexKeys.Ascending(u => u.email);
        usersCollection.Indexes.CreateOne(new CreateIndexModel<user>(userEmailIndex,
            new CreateIndexOptions { Unique = true }));
    }
}