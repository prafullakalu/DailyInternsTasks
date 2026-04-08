namespace QuickBooksIntegration.Models;

public class tokenModel
{
    public string realmId { get; set; }
    public string accessToken { get; set; }
    public string refreshToken { get; set; }
    public string idToken { get; set; }
    public DateTime expiry { get; set; }
}