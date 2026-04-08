using System.Data.SqlClient;
using QuickBooksIntegration.Models;
using QuickBooksIntegration.Repositories.Interfaces;
using Microsoft.Extensions.Configuration;

namespace QuickBooksIntegration.Repositories.Implementations
{
    public class TokenRepository : ITokenRepository
    {
        private readonly string _connectionString;

        public TokenRepository(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection");
        }

        public async Task SaveTokenAsync(tokenModel token)
        {
            await using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            // If a record for this RealmId exists, update it. Otherwise insert.
            var checkCmd = new SqlCommand("SELECT COUNT(1) FROM Tokens WHERE RealmId = @realmId", conn);
            checkCmd.Parameters.AddWithValue("@realmId", token.realmId ?? (object)DBNull.Value);

            var exists = (int)await checkCmd.ExecuteScalarAsync() > 0;

            if (exists)
            {
                var updateCmd = new SqlCommand(@"
                    UPDATE Tokens
                    SET AccessToken = @access,
                        RefreshToken = @refresh,
                        IdToken = @id,
                        Expiry = @expiry
                    WHERE RealmId = @realmId", conn);

                updateCmd.Parameters.AddWithValue("@realmId", token.realmId ?? (object)DBNull.Value);
                updateCmd.Parameters.AddWithValue("@access", token.accessToken ?? (object)DBNull.Value);
                updateCmd.Parameters.AddWithValue("@refresh", token.refreshToken ?? (object)DBNull.Value);
                updateCmd.Parameters.AddWithValue("@id", token.idToken ?? (object)DBNull.Value);
                updateCmd.Parameters.AddWithValue("@expiry", token.expiry);

                await updateCmd.ExecuteNonQueryAsync();
            }
            else
            {
                var insertCmd = new SqlCommand(@"
                    INSERT INTO Tokens (RealmId, AccessToken, RefreshToken, IdToken, Expiry)
                    VALUES (@realmId, @access, @refresh, @id, @expiry)", conn);

                insertCmd.Parameters.AddWithValue("@realmId", token.realmId ?? (object)DBNull.Value);
                insertCmd.Parameters.AddWithValue("@access", token.accessToken ?? (object)DBNull.Value);
                insertCmd.Parameters.AddWithValue("@refresh", token.refreshToken ?? (object)DBNull.Value);
                insertCmd.Parameters.AddWithValue("@id", token.idToken ?? (object)DBNull.Value);
                insertCmd.Parameters.AddWithValue("@expiry", token.expiry);

                await insertCmd.ExecuteNonQueryAsync();
            }
        }

        public async Task<tokenModel?> GetLatestTokenAsync()
        {
            await using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var cmd = new SqlCommand(@"SELECT TOP 1 RealmId, AccessToken, RefreshToken, IdToken, Expiry FROM Tokens ORDER BY Expiry DESC", conn);

            await using var reader = await cmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync()) return null;

            return new tokenModel
            {
                realmId = reader["RealmId"]?.ToString(),
                accessToken = reader["AccessToken"]?.ToString(),
                refreshToken = reader["RefreshToken"]?.ToString(),
                idToken = reader["IdToken"]?.ToString(),
                expiry = reader["Expiry"] != DBNull.Value ? (DateTime)reader["Expiry"] : DateTime.MinValue
            };
        }

        public async Task<tokenModel?> GetTokenByRealmIdAsync(string realmId)
        {
            await using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var cmd = new SqlCommand(@"SELECT TOP 1 RealmId, AccessToken, RefreshToken, IdToken, Expiry FROM Tokens WHERE RealmId = @realmId ORDER BY Expiry DESC", conn);
            cmd.Parameters.AddWithValue("@realmId", realmId);

            await using var reader = await cmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync()) return null;

            return new tokenModel
            {
                realmId = reader["RealmId"]?.ToString(),
                accessToken = reader["AccessToken"]?.ToString(),
                refreshToken = reader["RefreshToken"]?.ToString(),
                idToken = reader["IdToken"]?.ToString(),
                expiry = reader["Expiry"] != DBNull.Value ? (DateTime)reader["Expiry"] : DateTime.MinValue
            };
        }
    }
}
