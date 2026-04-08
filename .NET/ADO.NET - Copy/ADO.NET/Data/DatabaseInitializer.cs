using CleanApiProject.Models;

namespace CleanApiProject.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        var context = services.GetRequiredService<AppDbContext>();
        var logger = services.GetRequiredService<ILogger<AppDbContext>>();

        try
        {
            await context.Database.EnsureCreatedAsync();

            logger.LogInformation("Database schema verified / created successfully.");

            await seedUsersAsync(context, logger);
            await seedItemsAsync(context, logger);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during database initialization.");
            throw;
        }
    }

    private static async Task seedUsersAsync(AppDbContext context, ILogger logger)
    {
        if (context.Users.Any()) return;

        var users = new List<User>
        {
            new()
            {
                Name           = "Admin User",
                Email          = "admin@example.com",
                Password       = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role           = "Admin",
                LastRoleUpdate = DateTime.UtcNow
            },
            new()
            {
                Name           = "Regular User",
                Email          = "user@example.com",
                Password       = BCrypt.Net.BCrypt.HashPassword("User@123"),
                Role           = "User",
                LastRoleUpdate = DateTime.UtcNow
            }
        };

        await context.Users.AddRangeAsync(users);

        await context.SaveChangesAsync();

        logger.LogInformation(
            "Seed users inserted. Credentials: admin@example.com / Admin@123 | user@example.com / User@123");
    }

    private static async Task seedItemsAsync(AppDbContext context, ILogger logger)
    {
        if (context.Items.Any()) return;

        var items = new List<Item>
        {
            new() { Name = "Laptop",   Price = 999.99m },
            new() { Name = "Mouse",    Price =  19.99m },
            new() { Name = "Keyboard", Price =  49.99m },
            new() { Name = "Monitor",  Price = 299.99m },
            new() { Name = "USB Hub",  Price =  14.99m }
        };

        await context.Items.AddRangeAsync(items);
        await context.SaveChangesAsync();

        logger.LogInformation("Seed items inserted.");
    }
}