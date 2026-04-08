using Microsoft.AspNetCore.Mvc;
using CleanApiProject.DTOs;
using CleanApiProject.Interfaces;

namespace CleanApiProject.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);

        if (result == null)
            return Conflict(new { success = false, message = "Email already exists." });

        return StatusCode(201, new { success = true, data = result });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);

        if (result == null)
            return Unauthorized(new { success = false, message = "Invalid email or password." });

        return Ok(new { success = true, data = result });
    }
}
