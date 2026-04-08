using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace mongoAuthOrderApi.Models;

public class order
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? id { get; set; }

    [BsonElement("title")]
    public string title { get; set; } = string.Empty;

    [BsonElement("description")]
    public string description { get; set; } = string.Empty;

    [BsonElement("amount")]
    public decimal amount { get; set; }

    [BsonElement("status")]
    public string status { get; set; } = "Pending"; // Pending, Confirmed, Shipped, Delivered, Cancelled

    [BsonElement("userId")]
    public string userId { get; set; } = string.Empty; // owner of this order

    [BsonElement("username")]
    public string username { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime createdAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime updatedAt { get; set; } = DateTime.UtcNow;
}

// DTOs
public class createOrderRequest
{
    public string title { get; set; } = string.Empty;
    public string description { get; set; } = string.Empty;
    public decimal amount { get; set; }
}

public class updateOrderRequest
{
    public string? title { get; set; }
    public string? description { get; set; }
    public decimal? amount { get; set; }
    public string? status { get; set; }
}