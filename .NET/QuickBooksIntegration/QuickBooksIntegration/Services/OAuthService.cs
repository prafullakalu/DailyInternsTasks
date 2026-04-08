using System.Net.Http.Headers;
using System.Text;

namespace QuickBooksIntegration.Services;

public class oAuthService
{
    private readonly IConfiguration config;

    public oAuthService(IConfiguration config)
    {
        this.config = config;
    }

    public string getAuthUrl()
    {
        var clientId = config["QuickBooks:ClientId"];
        var redirectUri = config["QuickBooks:RedirectUri"];

        return $"https://appcenter.intuit.com/connect/oauth2?" +
               $"client_id={clientId}" +
               $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
               $"&response_type=code" +
               $"&scope=com.intuit.quickbooks.accounting%20openid%20profile%20email" +
               $"&state=abc123";
    }

    public async Task<string> exchangeCode(string code)
    {
        var client = new HttpClient();

        var creds = Convert.ToBase64String(
            Encoding.UTF8.GetBytes($"{config["QuickBooks:ClientId"]}:{config["QuickBooks:ClientSecret"]}")
        );

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Basic", creds);

        var content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string,string>("grant_type","authorization_code"),
            new KeyValuePair<string,string>("code",code),
            new KeyValuePair<string,string>("redirect_uri",config["QuickBooks:RedirectUri"])
        });

        var response = await client.PostAsync(
            "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
            content);

        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> refreshToken(string refreshToken)
    {
        var client = new HttpClient();

        var content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string,string>("grant_type","refresh_token"),
            new KeyValuePair<string,string>("refresh_token",refreshToken)
        });

        var response = await client.PostAsync(
            "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
            content);

        return await response.Content.ReadAsStringAsync();
    }

    public async Task revokeToken(string token)
    {
        var client = new HttpClient();

        var content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string,string>("token",token)
        });

        await client.PostAsync(
            "https://developer.api.intuit.com/v2/oauth2/tokens/revoke",
            content);
    }
}