using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CleanApiProject.DTOs;
using CleanApiProject.Interfaces;

namespace CleanApiProject.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("getUsers")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllAsync();
        return Ok(new { success = true, data = users });
    }

    [HttpGet("getUser/{id:int}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null)
            return NotFound(new { success = false, message = $"User with id={id} not found." });

        return Ok(new { success = true, data = user });
    }

    [HttpPut("getUser/{id:int}/role")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleDto dto)
    {
        if (dto.Role != "Admin" && dto.Role != "User")
            return BadRequest(new { success = false, message = "Role must be 'Admin' or 'User'." });

        var currentUserId = GetCurrentUserId();
        if (currentUserId.HasValue && currentUserId.Value == id)
            return BadRequest(new { success = false, message = "You cannot change your own role." });

        var updated = await _userService.UpdateRoleAsync(id, dto.Role);
        if (!updated)
            return NotFound(new { success = false, message = $"User with id={id} not found." });

        return Ok(new
        {
            success = true,
            message = $"Role updated to '{dto.Role}'. The user must log in again for the change to take effect."
        });
    }

    [HttpDelete("deleteUser/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId.HasValue && currentUserId.Value == id)
            return BadRequest(new { success = false, message = "You cannot delete your own account." });

        var deleted = await _userService.DeleteAsync(id);
        if (!deleted)
            return NotFound(new { success = false, message = $"User with id={id} not found." });

        return Ok(new { success = true, message = "User deleted successfully." });
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
        if (claim == null) return null;
        return int.TryParse(claim.Value, out var id) ? id : null;
    }
}
