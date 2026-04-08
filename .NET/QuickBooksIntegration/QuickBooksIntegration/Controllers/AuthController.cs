using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using QuickBooksIntegration.Data;
using QuickBooksIntegration.Models;
using QuickBooksIntegration.Services;

namespace QuickBooksIntegration.Controllers;

[ApiController]
[Route("api/auth")]
public class authController : ControllerBase
{
    private readonly oAuthService authService;
    private readonly ITokenRepository tokenRepo;

    public authController(oAuthService authService, ITokenRepository tokenRepo)
    {
        this.authService = authService;
        this.tokenRepo = tokenRepo;
    }

    [HttpGet("login")]
    public IActionResult login()
    {
        var url = authService.getAuthUrl();
        return Ok(url); 
    }

    [HttpGet("callback")]
    public async Task<IActionResult> callback(string code, string realmId)
    {
        var result = await authService.exchangeCode(code);

        var json = JObject.Parse(result);

        var token = new tokenModel
        {
            realmId = realmId,
            accessToken = json["access_token"]?.ToString(),
            refreshToken = json["refresh_token"]?.ToString(),
            idToken = json["id_token"]?.ToString(),
            expiry = DateTime.UtcNow.AddSeconds((int)json["expires_in"])
        };

        await tokenRepo.SaveTokenAsync(token);

        return Ok(token);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> refresh(string refreshToken)
    {
        return Ok(await authService.refreshToken(refreshToken));
    }

    [HttpPost("revoke")]
    public async Task<IActionResult> revoke(string token)
    {
        await authService.revokeToken(token);
        return Ok("revoked");
    }
}