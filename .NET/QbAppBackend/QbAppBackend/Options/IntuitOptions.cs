namespace QbAppBackend.Options
{
    public class IntuitOptions
    {
        public string Environment { get; set; } = "Sandbox";
        public string ClientId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
        public string RedirectUri { get; set; } = string.Empty;
        public string SignInRedirectUri { get; set; } = string.Empty;
        public string AuthUrl { get; set; } = "https://appcenter.intuit.com/connect/oauth2";
        public string TokenUrl { get; set; } = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
        public string SignInScopes { get; set; } = "openid profile email";
        public string? DiscoveryUrl { get; set; }
        public string? UserInfoUrl { get; set; }
    }
}
