namespace mongoAuthOrderApi.settings;

public class jwtSettings
{
    public string key { get; set; } = string.Empty;
    public string issuer { get; set; } = string.Empty;
    public string audience { get; set; } = string.Empty;
    public int expiryHours { get; set; } = 24;
}