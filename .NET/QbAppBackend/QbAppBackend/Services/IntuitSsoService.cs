using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using QbAppBackend.Options;
using QbAppBackend.Services.Interfaces;
using QbAppBackend.Services.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace QbAppBackend.Services
{
    public class IntuitSsoService : IIntuitSsoService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IntuitOptions _options;
        private readonly ILogger<IntuitSsoService> _logger; // FIX: added logger

        public IntuitSsoService(
            IHttpClientFactory httpClientFactory,
            IOptions<IntuitOptions> options,
            ILogger<IntuitSsoService> logger) // FIX: injected logger
        {
            _httpClientFactory = httpClientFactory;
            _options = options.Value;
            _logger = logger;
        }

        public string GetSignInUrl()
        {
            var redirectUri = GetSignInRedirectUri();
            var scopes = Uri.EscapeDataString(string.IsNullOrWhiteSpace(_options.SignInScopes) ? "openid profile email" : _options.SignInScopes);
            var state = Uri.EscapeDataString(Convert.ToBase64String(Encoding.UTF8.GetBytes("signin")));

            return $"{_options.AuthUrl}?client_id={_options.ClientId}&response_type=code&scope={scopes}&redirect_uri={Uri.EscapeDataString(redirectUri)}&state={state}";
        }

        public async Task<IntuitSsoProfile> CompleteSignInAsync(string code)
        {
            var tokenSet = await ExchangeAuthorizationCodeAsync(code, GetSignInRedirectUri());
            if (string.IsNullOrWhiteSpace(tokenSet.IdToken))
            {
                throw new InvalidOperationException("Intuit sign-in did not return an id_token.");
            }

            var principal = await ValidateIdTokenAsync(tokenSet.IdToken);
            var idTokenClaims = ReadIdTokenClaims(tokenSet.IdToken);

            var email = FirstNonEmpty(
                idTokenClaims.Email,
                idTokenClaims.PreferredUsername,
                GetClaimValueAny(principal, JwtRegisteredClaimNames.Email, "email", ClaimTypes.Email, "preferred_username", "preferredUsername"))?.Trim().ToLowerInvariant();

            var subject = FirstNonEmpty(
                idTokenClaims.Subject,
                GetClaimValueAny(principal, JwtRegisteredClaimNames.Sub, "sub", ClaimTypes.NameIdentifier));

            var fullName = BuildDisplayName(
                FirstNonEmpty(idTokenClaims.Name, GetClaimValueAny(principal, "name", ClaimTypes.Name)),
                FirstNonEmpty(idTokenClaims.GivenName, GetClaimValueAny(principal, "given_name", "givenName", ClaimTypes.GivenName)),
                FirstNonEmpty(idTokenClaims.FamilyName, GetClaimValueAny(principal, "family_name", "familyName", ClaimTypes.Surname)));

            var emailVerified = idTokenClaims.EmailVerified
                ?? GetBooleanClaimValue(principal, "email_verified")
                ?? GetBooleanClaimValue(principal, "emailVerified");

            _logger.LogDebug(
                "id_token claims — sub: {Subject}, email: {Email}, name: {Name}, email_verified: {EmailVerified}",
                subject, email, fullName, emailVerified);

            if (!string.IsNullOrWhiteSpace(tokenSet.AccessToken))
            {
                var userInfo = await TryGetUserInfoAsync(tokenSet.AccessToken);

                // FIX: only override if id_token didn't already provide the value
                if (string.IsNullOrWhiteSpace(email))
                {
                    email = (userInfo.Email ?? userInfo.PreferredUsername)?.Trim().ToLowerInvariant();
                }

                subject ??= userInfo.Subject;

                if (string.IsNullOrWhiteSpace(fullName))
                {
                    fullName = BuildDisplayName(userInfo.Name, userInfo.GivenName, userInfo.FamilyName);
                }

                emailVerified ??= userInfo.EmailVerified;

                _logger.LogDebug(
                    "After userinfo merge — sub: {Subject}, email: {Email}, name: {Name}, email_verified: {EmailVerified}",
                    subject, email, fullName, emailVerified);
            }

            if (string.IsNullOrWhiteSpace(subject))
            {
                throw new InvalidOperationException("Unable to read Intuit user profile.");
            }

            if (emailVerified == false && IsProductionEnvironment())
            {
                throw new InvalidOperationException("Your Intuit email address is not verified. Verify it in Intuit account settings and try again.");
            }

            // FIX: log a clear warning when sandbox returns no email/name so it's obvious in logs
            if (string.IsNullOrWhiteSpace(email))
            {
                _logger.LogWarning(
                    "Intuit did not return an email for subject {Subject}. This is expected in Sandbox. " +
                    "The user will be identified by sub only.", subject);
            }

            if (string.IsNullOrWhiteSpace(fullName))
            {
                _logger.LogWarning(
                    "Intuit did not return a name for subject {Subject}. Falling back to generated display name.", subject);
            }

            fullName ??= !string.IsNullOrWhiteSpace(email)
                ? email
                : $"Intuit Account {subject[..Math.Min(8, subject.Length)]}";

            return new IntuitSsoProfile
            {
                Subject = subject,
                Email = email,
                FullName = fullName,
                EmailVerified = emailVerified
            };
        }

        private async Task<IntuitTokenSet> ExchangeAuthorizationCodeAsync(string code, string redirectUri)
        {
            var client = _httpClientFactory.CreateClient("quickbooks");
            var basicAuth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_options.ClientId}:{_options.ClientSecret}"));

            using var request = new HttpRequestMessage(HttpMethod.Post, _options.TokenUrl)
            {
                Content = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["grant_type"] = "authorization_code",
                    ["code"] = code,
                    ["redirect_uri"] = redirectUri
                })
            };
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", basicAuth);

            var response = await client.SendAsync(request);
            var payload = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException($"Intuit sign-in failed: {payload}");
            }

            var document = JsonSerializer.Deserialize<JsonElement>(payload);
            return new IntuitTokenSet
            {
                AccessToken = document.TryGetProperty("access_token", out var accessToken) ? accessToken.GetString() : null,
                IdToken = document.TryGetProperty("id_token", out var idToken) ? idToken.GetString() : null
            };
        }

        private async Task<ClaimsPrincipal> ValidateIdTokenAsync(string idToken)
        {
            var client = _httpClientFactory.CreateClient("quickbooks");
            var discovery = await GetDiscoveryDocumentAsync(client);
            var issuer = GetJsonValue(discovery, "issuer")
                ?? throw new InvalidOperationException("Intuit discovery document did not include issuer.");
            var jwksUri = GetJsonValue(discovery, "jwks_uri")
                ?? throw new InvalidOperationException("Intuit discovery document did not include jwks_uri.");

            var jwksJson = await client.GetStringAsync(jwksUri);
            var signingKeys = new JsonWebKeySet(jwksJson).GetSigningKeys();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = signingKeys,
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = _options.ClientId,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(2),
                RequireSignedTokens = true
            };

            var handler = new JwtSecurityTokenHandler
            {
                MapInboundClaims = false
            };

            return handler.ValidateToken(idToken, validationParameters, out _);
        }

        private static IntuitProfileData ReadIdTokenClaims(string idToken)
        {
            var token = new JwtSecurityTokenHandler().ReadJwtToken(idToken);
            return new IntuitProfileData
            {
                Subject = GetClaimValueAny(token.Claims, JwtRegisteredClaimNames.Sub, "sub", ClaimTypes.NameIdentifier),
                Email = GetClaimValueAny(token.Claims, JwtRegisteredClaimNames.Email, "email", ClaimTypes.Email),
                // FIX: check both snake_case and camelCase for email_verified
                EmailVerified = GetBooleanClaimValue(token.Claims, "email_verified")
                             ?? GetBooleanClaimValue(token.Claims, "emailVerified"),
                PreferredUsername = GetClaimValueAny(token.Claims, "preferred_username", "preferredUsername"),
                Name = GetClaimValueAny(token.Claims, "name", ClaimTypes.Name),
                GivenName = GetClaimValueAny(token.Claims, "given_name", "givenName", ClaimTypes.GivenName),
                FamilyName = GetClaimValueAny(token.Claims, "family_name", "familyName", ClaimTypes.Surname)
            };
        }

        private async Task<IntuitProfileData> TryGetUserInfoAsync(string accessToken)
        {
            var client = _httpClientFactory.CreateClient("quickbooks");

            // FIX: UserInfoUrl is now set explicitly in appsettings.json; discovery fallback uses correct platform URL
            var userInfoUrl = _options.UserInfoUrl;

            if (string.IsNullOrWhiteSpace(userInfoUrl))
            {
                var discovery = await GetDiscoveryDocumentAsync(client);
                userInfoUrl = GetJsonValue(discovery, "userinfo_endpoint");
            }

            // FIX: correct fallback URL (was accounts.intuit.com — wrong domain)
            if (string.IsNullOrWhiteSpace(userInfoUrl))
            {
                userInfoUrl = GetDefaultUserInfoUrl();
            }

            _logger.LogDebug("Calling Intuit userinfo endpoint: {Url}", userInfoUrl);

            using var request = new HttpRequestMessage(HttpMethod.Get, userInfoUrl);
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
            request.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

            var response = await client.SendAsync(request);

            // FIX: log the failure reason instead of silently returning empty profile
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning(
                    "Intuit userinfo call failed with {StatusCode}. Body: {Body}",
                    response.StatusCode, errorBody);
                return new IntuitProfileData();
            }

            var payload = await response.Content.ReadAsStringAsync();
            _logger.LogDebug("Intuit userinfo raw response: {Payload}", payload);

            var json = JsonSerializer.Deserialize<JsonElement>(payload);

            return new IntuitProfileData
            {
                Subject = GetJsonValue(json, "sub"),
                Email = GetJsonValueAny(json, "email"),
                // FIX: check snake_case first (Intuit standard), then camelCase fallback
                EmailVerified = GetJsonBooleanValue(json, "email_verified")
                             ?? GetJsonBooleanValue(json, "emailVerified"),
                PreferredUsername = GetJsonValueAny(json, "preferred_username", "preferredUsername"),
                Name = GetJsonValue(json, "name"),
                GivenName = GetJsonValueAny(json, "given_name", "givenName"),
                FamilyName = GetJsonValueAny(json, "family_name", "familyName")
            };
        }

        private async Task<JsonElement> GetDiscoveryDocumentAsync(HttpClient client)
        {
            // FIX: correct discovery URL is now in appsettings.json; fallback uses correct platform URL
            var discoveryUrl = !string.IsNullOrWhiteSpace(_options.DiscoveryUrl)
                ? _options.DiscoveryUrl
                : GetDefaultDiscoveryUrl();

            _logger.LogDebug("Fetching Intuit discovery document from: {Url}", discoveryUrl);

            var discoveryJson = await client.GetStringAsync(discoveryUrl);
            return JsonSerializer.Deserialize<JsonElement>(discoveryJson);
        }

        private string GetSignInRedirectUri()
        {
            return !string.IsNullOrWhiteSpace(_options.SignInRedirectUri)
                ? _options.SignInRedirectUri
                : _options.RedirectUri;
        }

        private bool IsProductionEnvironment()
        {
            return string.Equals(_options.Environment, "Production", StringComparison.OrdinalIgnoreCase);
        }

        private string GetDefaultDiscoveryUrl()
        {
            return IsProductionEnvironment()
                ? "https://developer.api.intuit.com/.well-known/openid_configuration"
                : "https://developer.api.intuit.com/.well-known/openid_sandbox_configuration";
        }

        private string GetDefaultUserInfoUrl()
        {
            return IsProductionEnvironment()
                ? "https://accounts.platform.intuit.com/v1/openid_connect/userinfo"
                : "https://sandbox-accounts.platform.intuit.com/v1/openid_connect/userinfo";
        }

        private static string? BuildDisplayName(string? name, string? givenName, string? familyName)
        {
            if (!string.IsNullOrWhiteSpace(name))
            {
                return name.Trim();
            }

            var parts = new[] { givenName?.Trim(), familyName?.Trim() }
                .Where(value => !string.IsNullOrWhiteSpace(value));

            var fullName = string.Join(" ", parts);
            return string.IsNullOrWhiteSpace(fullName) ? null : fullName;
        }

        private static string? FirstNonEmpty(params string?[] values)
        {
            return values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value));
        }

        private static string? GetClaimValue(ClaimsPrincipal principal, string claimType)
        {
            return GetClaimValue(principal.Claims, claimType);
        }

        private static string? GetClaimValue(IEnumerable<Claim> claims, string claimType)
        {
            return claims.FirstOrDefault(claim => claim.Type == claimType)?.Value;
        }

        private static string? GetClaimValueAny(ClaimsPrincipal principal, params string[] claimTypes)
        {
            return GetClaimValueAny(principal.Claims, claimTypes);
        }

        private static string? GetClaimValueAny(IEnumerable<Claim> claims, params string[] claimTypes)
        {
            foreach (var claimType in claimTypes)
            {
                var value = GetClaimValue(claims, claimType);
                if (!string.IsNullOrWhiteSpace(value))
                {
                    return value;
                }
            }

            return null;
        }

        private static bool? GetBooleanClaimValue(ClaimsPrincipal principal, string claimType)
        {
            return GetBooleanClaimValue(principal.Claims, claimType);
        }

        private static bool? GetBooleanClaimValue(IEnumerable<Claim> claims, string claimType)
        {
            var value = GetClaimValue(claims, claimType);
            return bool.TryParse(value, out var parsed) ? parsed : null;
        }

        private static string? GetJsonValue(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var property) ? property.GetString() : null;
        }

        private static string? GetJsonValueAny(JsonElement element, params string[] propertyNames)
        {
            foreach (var propertyName in propertyNames)
            {
                var value = GetJsonValue(element, propertyName);
                if (!string.IsNullOrWhiteSpace(value))
                {
                    return value;
                }
            }

            return null;
        }

        private static bool? GetJsonBooleanValue(JsonElement element, string propertyName)
        {
            if (!element.TryGetProperty(propertyName, out var property))
            {
                return null;
            }

            return property.ValueKind switch
            {
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                JsonValueKind.String when bool.TryParse(property.GetString(), out var parsed) => parsed,
                _ => null
            };
        }

        private sealed class IntuitTokenSet
        {
            public string? AccessToken { get; init; }
            public string? IdToken { get; init; }
        }

        private sealed class IntuitProfileData
        {
            public string? Subject { get; init; }
            public string? Email { get; init; }
            public bool? EmailVerified { get; init; }
            public string? PreferredUsername { get; init; }
            public string? Name { get; init; }
            public string? GivenName { get; init; }
            public string? FamilyName { get; init; }
        }
    }
}
