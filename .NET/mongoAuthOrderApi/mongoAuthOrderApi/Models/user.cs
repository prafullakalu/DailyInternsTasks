using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace mongoAuthOrderApi.Models;

public class user
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? id { get; set; }

    [BsonElement("username")]
    public string username { get; set; } = string.Empty;

    [BsonElement("email")]
    public string email { get; set; } = string.Empty;

    [BsonElement("passwordHash")]
    [JsonIgnore]
    public string passwordHash { get; set; } = string.Empty;

    [BsonElement("role")]
    public string role { get; set; } = "User"; // "Admin" or "User"

    [BsonElement("createdAt")]
    public DateTime createdAt { get; set; } = DateTime.UtcNow;
}

// DTOs (Data Transfer Objects) — used for API input, not stored directly
public class signUpRequest
{
    public string username { get; set; } = string.Empty;
    public string email { get; set; } = string.Empty;
    public string password { get; set; } = string.Empty;
    public string role { get; set; } = "User";
}

public class signInRequest
{
    public string email { get; set; } = string.Empty;
    public string password { get; set; } = string.Empty;
}

public class updateUserRequest
{
    public string? username { get; set; }
    public string? email { get; set; }
    public string? role { get; set; }
}

public class authResponse
{
    public string token { get; set; } = string.Empty;
    public string username { get; set; } = string.Empty;
    public string email { get; set; } = string.Empty;
    public string role { get; set; } = string.Empty;
    public string userId { get; set; } = string.Empty;
}