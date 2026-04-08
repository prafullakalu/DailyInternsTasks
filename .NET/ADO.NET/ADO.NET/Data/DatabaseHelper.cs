using Microsoft.Data.SqlClient;

namespace CleanApiProject.Data;

/// <summary>
/// Provides SqlConnection instances using the connection string from config.
/// All repositories use this to get a database connection.
/// We do NOT use Entity Framework — only raw ADO.NET (SqlConnection, SqlCommand, SqlDataReader).
/// </summary>
public class DatabaseHelper
{
    private readonly string _connectionString;

    public DatabaseHelper(IConfiguration configuration)
    {
        // Read connection string from appsettings.json
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
    }

    /// <summary>
    /// Creates and opens a new SqlConnection.
    /// Caller is responsible for disposing it (use 'using' keyword).
    /// </summary>
    public async Task<SqlConnection> CreateConnectionAsync()
    {
        var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        return connection;
    }
}
