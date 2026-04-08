using Microsoft.Data.SqlClient;

namespace CleanApiProject.Data;

/// <summary>
/// Runs on application startup to:
/// 1. Create tables if they don't exist
/// 2. Insert seed data (admin user + sample items)
/// This replaces EF Core migrations for our ADO.NET-only project.
/// </summary>
public static class DatabaseInitializer
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        var dbHelper = services.GetRequiredService<DatabaseHelper>();
        var logger = services.GetRequiredService<ILogger<Program>>();

        try
        {
            using var conn = await dbHelper.CreateConnectionAsync();

            await CreateTablesAsync(conn);
            await SeedDataAsync(conn, logger);

            logger.LogInformation("Database initialized successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during database initialization.");
            throw;
        }
    }

    private static async Task CreateTablesAsync(SqlConnection conn)
    {
        // ── Users Table ────────────────────────────────────────────────
        var createUsers = @"
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
            BEGIN
                CREATE TABLE Users (
                    Id              INT IDENTITY(1,1) PRIMARY KEY,
                    Name            NVARCHAR(100)   NOT NULL,
                    Email           NVARCHAR(200)   NOT NULL UNIQUE,   -- UNIQUE enforced at DB level
                    Password        NVARCHAR(500)   NOT NULL,          -- Stored as BCrypt hash
                    Role            NVARCHAR(50)    NOT NULL DEFAULT 'User',
                    LastRoleUpdate  DATETIME2       NOT NULL DEFAULT GETUTCDATE()
                );
                PRINT 'Users table created.';
            END";

        // ── Items Table ────────────────────────────────────────────────
        var createItems = @"
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Items')
            BEGIN
                CREATE TABLE Items (
                    Id      INT IDENTITY(1,1) PRIMARY KEY,
                    Name    NVARCHAR(200)   NOT NULL,
                    Price   DECIMAL(18,2)   NOT NULL
                );
                PRINT 'Items table created.';
            END";

        using (var cmd = new SqlCommand(createUsers, conn))
            await cmd.ExecuteNonQueryAsync();

        using (var cmd = new SqlCommand(createItems, conn))
            await cmd.ExecuteNonQueryAsync();
    }

    private static async Task SeedDataAsync(SqlConnection conn, ILogger logger)
    {
        // Only seed if tables are empty
        var userCount = await GetCountAsync(conn, "Users");
        var itemCount = await GetCountAsync(conn, "Items");

        if (userCount == 0)
        {
            // BCrypt hash for "Admin@123"
            var adminHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
            // BCrypt hash for "User@123"
            var userHash = BCrypt.Net.BCrypt.HashPassword("User@123");

            var sql = @"
                INSERT INTO Users (Name, Email, Password, Role, LastRoleUpdate)
                VALUES
                    (@adminName, @adminEmail, @adminPass, 'Admin', GETUTCDATE()),
                    (@userName,  @userEmail,  @userPass,  'User',  GETUTCDATE());";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@adminName", "Admin User");
            cmd.Parameters.AddWithValue("@adminEmail", "admin@example.com");
            cmd.Parameters.AddWithValue("@adminPass", adminHash);
            cmd.Parameters.AddWithValue("@userName", "Regular User");
            cmd.Parameters.AddWithValue("@userEmail", "user@example.com");
            cmd.Parameters.AddWithValue("@userPass", userHash);

            await cmd.ExecuteNonQueryAsync();
            logger.LogInformation("Seed users inserted. admin@example.com / Admin@123 | user@example.com / User@123");
        }

        if (itemCount == 0)
        {
            var sql = @"
                INSERT INTO Items (Name, Price)
                VALUES
                    ('Laptop',     999.99),
                    ('Mouse',       19.99),
                    ('Keyboard',    49.99),
                    ('Monitor',    299.99),
                    ('USB Hub',     14.99);";

            using var cmd = new SqlCommand(sql, conn);
            await cmd.ExecuteNonQueryAsync();
            logger.LogInformation("Seed items inserted.");
        }
    }

    private static async Task<int> GetCountAsync(SqlConnection conn, string tableName)
    {
        using var cmd = new SqlCommand($"SELECT COUNT(*) FROM {tableName}", conn);
        return (int)(await cmd.ExecuteScalarAsync() ?? 0);
    }
}
