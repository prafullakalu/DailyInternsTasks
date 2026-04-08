using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QbAppBackend.DTOs.Auth;
using QbAppBackend.Services.Interfaces;

namespace QbAppBackend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            IConfiguration configuration,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("signup")]
        public async Task<ActionResult<AuthResponseDto>> Signup([FromBody] SignupDto dto)
        {
            return Ok(await _authService.SignupAsync(dto));
        }

        [HttpPost("signin")]
        public async Task<ActionResult<AuthResponseDto>> Signin([FromBody] SigninDto dto)
        {
            return Ok(await _authService.SigninAsync(dto));
        }

        [HttpGet("intuit/url")]
        public IActionResult GetIntuitSigninUrl()
        {
            return Ok(new { url = _authService.GetIntuitSignInUrl() });
        }

        [HttpGet("intuit/login")]
        public IActionResult LoginWithIntuit()
        {
            return Redirect(_authService.GetIntuitSignInUrl());
        }

        [HttpGet("intuit/callback")]
        public async Task<IActionResult> IntuitCallback([FromQuery] string? code, [FromQuery] string? error, [FromQuery] string? error_description)
        {
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";

            // FIX: handle Intuit returning an error query param (e.g. user denied access)
            if (!string.IsNullOrWhiteSpace(error))
            {
                var reason = error_description ?? error;
                _logger.LogWarning("Intuit OAuth callback returned error: {Error} — {Description}", error, error_description);
                return Redirect($"{frontendUrl}/signin?error={Uri.EscapeDataString(reason)}");
            }

            // FIX: guard against missing code before calling downstream services
            if (string.IsNullOrWhiteSpace(code))
            {
                _logger.LogWarning("Intuit OAuth callback received with no code and no error.");
                return Redirect($"{frontendUrl}/signin?error={Uri.EscapeDataString("Authorization code missing from Intuit callback.")}");
            }

            try
            {
                var authResult = await _authService.CompleteIntuitSigninAsync(code);
                return Redirect($"{frontendUrl}/auth/callback?token={Uri.EscapeDataString(authResult.Token)}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Intuit sign-in failed during code exchange.");
                return Redirect($"{frontendUrl}/signin?error={Uri.EscapeDataString(ex.Message)}");
            }
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            return Ok(await _authService.GetCurrentUserAsync());
        }
    }
}