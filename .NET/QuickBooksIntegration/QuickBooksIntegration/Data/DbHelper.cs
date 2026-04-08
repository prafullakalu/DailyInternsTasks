using System.Data.SqlClient;
using QuickBooksIntegration.Models;

namespace QuickBooksIntegration.Data;

public class dbHelper
{
    private readonly string connectionString;

    public dbHelper(IConfiguration config)
    {
        connectionString = config.GetConnectionString("DefaultConnection");
    }
}