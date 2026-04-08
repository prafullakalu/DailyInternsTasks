using Microsoft.AspNetCore.Mvc;
using MyWebAPI.Models;
using MyWebAPI.Services;

namespace MyWebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ITokenService _tokenService;

        public AuthController(ITokenService tokenService)
        {
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            if (req.Username != "admin" || req.Password != "password123")
                return Unauthorized(new { message = "Invalid credentials" });

            var token = _tokenService.GenerateToken(req.Username);
            var expiry = DateTime.UtcNow.AddMinutes(60);

            return Ok(new LoginResponse
            {
                Token = token,
                Expiry = expiry,
                Username = req.Username
            });
        }
    }
}