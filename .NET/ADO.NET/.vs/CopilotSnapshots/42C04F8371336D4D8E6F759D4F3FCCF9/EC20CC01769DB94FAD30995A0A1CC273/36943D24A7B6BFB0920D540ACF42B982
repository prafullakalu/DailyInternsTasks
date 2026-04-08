using Microsoft.Data.SqlClient;
using CleanApiProject.Data;
using CleanApiProject.Interfaces;
using CleanApiProject.Models;

namespace CleanApiProject.Repositories;

public class ItemRepository : IItemRepository
{
    private readonly DatabaseHelper _db;

    public ItemRepository(DatabaseHelper db)
    {
        _db = db;
    }

    public async Task<Item?> GetByIdAsync(int id)
    {
        const string sql = "SELECT Id, Name, Price FROM Items WHERE Id = @Id";

        using var conn = await _db.CreateConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", id);

        using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
            return MapItem(reader);

        return null;
    }

    public async Task<IEnumerable<Item>> GetAllAsync()
    {
        const string sql = "SELECT Id, Name, Price FROM Items ORDER BY Id";

        var items = new List<Item>();
        using var conn = await _db.CreateConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
            items.Add(MapItem(reader));

        return items;
    }

    public async Task<int> CreateAsync(Item item)
    {
        const string sql = @"
            INSERT INTO Items (Name, Price)
            VALUES (@Name, @Price);
            SELECT CAST(SCOPE_IDENTITY() AS INT);";

        using var conn = await _db.CreateConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Name", item.Name);
        cmd.Parameters.AddWithValue("@Price", item.Price);

        var newId = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(newId);
    }

    public async Task<bool> UpdateAsync(Item item)
    {
        const string sql = "UPDATE Items SET Name = @Name, Price = @Price WHERE Id = @Id";

        using var conn = await _db.CreateConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", item.Id);
        cmd.Parameters.AddWithValue("@Name", item.Name);
        cmd.Parameters.AddWithValue("@Price", item.Price);

        var rows = await cmd.ExecuteNonQueryAsync();
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM Items WHERE Id = @Id";

        using var conn = await _db.CreateConnectionAsync();
        using var cmd = new SqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@Id", id);

        var rows = await cmd.ExecuteNonQueryAsync();
        return rows > 0;
    }

    private static Item MapItem(SqlDataReader reader) => new()
    {
        Id = reader.GetInt32(reader.GetOrdinal("Id")),
        Name = reader.GetString(reader.GetOrdinal("Name")),
        Price = reader.GetDecimal(reader.GetOrdinal("Price"))
    };
}
