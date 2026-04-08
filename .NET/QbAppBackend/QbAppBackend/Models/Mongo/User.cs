using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace QbAppBackend.Models.Mongo
{
    public class User
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public string? Email { get; set; }
        public string PasswordHash { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? IntuitSubject { get; set; }
        public string AuthProvider { get; set; } = "local";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
