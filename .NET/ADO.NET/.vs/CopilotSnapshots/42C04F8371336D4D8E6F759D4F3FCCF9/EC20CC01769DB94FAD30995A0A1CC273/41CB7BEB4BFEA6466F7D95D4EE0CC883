using CleanApiProject.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace CleanApiProject.Filters;

public class ValidationFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (context.ModelState.IsValid) return;

        var errors = context.ModelState
            .Where(x => x.Value?.Errors.Count > 0)
            .ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
            );

        context.Result = new BadRequestObjectResult(new
        {
            success = false,
            message = "Validation failed",
            errors
        });
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
}

public class RoleValidationFilter : IAsyncActionFilter
{
    private readonly ITokenService _tokenService;
    private readonly ILogger<RoleValidationFilter> _logger;

    public RoleValidationFilter(ITokenService tokenService, ILogger<RoleValidationFilter> logger)
    {
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var user = context.HttpContext.User;

        if (!user.Identity?.IsAuthenticated ?? true)
        {
            await next();
            return;
        }

        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)
                       ?? user.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);

        var roleUpdateClaim = user.FindFirst("lastRoleUpdate");

        if (userIdClaim == null || roleUpdateClaim == null)
        {
            await next();
            return;
        }

        if (!int.TryParse(userIdClaim.Value, out var userId)) { await next(); return; }
        if (!DateTime.TryParse(roleUpdateClaim.Value, out var tokenRoleUpdate)) { await next(); return; }

        var isValid = await _tokenService.IsTokenRoleValidAsync(userId, tokenRoleUpdate);
        if (!isValid)
        {
            _logger.LogWarning("Token invalidated for userId={UserId} due to role change.", userId);

            context.Result = new UnauthorizedObjectResult(new
            {
                success = false,
                message = "Your role has been updated. Please log in again to continue."
            });
            return;
        }

        await next();
    }
}
