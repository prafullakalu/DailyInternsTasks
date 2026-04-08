using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using mongoAuthOrderApi.settings;

namespace mongoAuthOrderApi.services;

public class jwtService
{
    private readonly jwtSettings _settings;

    public jwtService(IOptions<jwtSettings> settings)
    {
        _settings = settings.Value;
    }

    public string generateToken(string userId, string username, string email, string role)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role),

            new Claim("Name", username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_settings.key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _settings.issuer,
            audience: _settings.audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(_settings.expiryHours),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}