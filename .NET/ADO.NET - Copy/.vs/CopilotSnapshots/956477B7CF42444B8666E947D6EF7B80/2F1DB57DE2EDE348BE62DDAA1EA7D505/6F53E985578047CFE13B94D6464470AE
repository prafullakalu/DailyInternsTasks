using System.Net;
using System.Text.Json;

namespace CleanApiProject.Middleware;

/// <summary>
/// GLOBAL EXCEPTION HANDLER MIDDLEWARE
/// ─────────────────────────────────────
/// Catches ALL unhandled exceptions thrown anywhere in the pipeline.
/// Instead of showing a raw 500 HTML error page, we return a clean JSON response.
///
/// How it works:
///   1. Request comes in → passed to next middleware
///   2. If any middleware/controller throws → caught here
///   3. We log the full exception to file AND console
///   4. We return a JSON error response to the client
///
/// HOW TO IMPLEMENT (already done in Program.cs):
///   app.UseMiddleware<ExceptionHandlingMiddleware>();
///   ← Add this FIRST, before all other middleware
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            // Pass control to the next middleware in the pipeline
            await _next(context);
        }
        catch (Exception ex)
        {
            // Log full exception details — stack trace goes to log file
            _logger.LogError(ex,
                "Unhandled exception on {Method} {Path} | TraceId: {TraceId}",
                context.Request.Method,
                context.Request.Path,
                context.TraceIdentifier);

            await handleExceptionAsync(context, ex);
        }
    }

    private static async Task handleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        // Map exception types to HTTP status codes
        var (statusCode, message) = exception switch
        {
            ArgumentNullException => (HttpStatusCode.BadRequest, "A required value was missing."),
            ArgumentException => (HttpStatusCode.BadRequest, exception.Message),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "You are not authorized."),
            KeyNotFoundException => (HttpStatusCode.NotFound, "The requested resource was not found."),
            InvalidOperationException => (HttpStatusCode.UnprocessableEntity, exception.Message),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred. Please try again later.")
        };

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            success = false,
            statusCode = (int)statusCode,
            message,
            // Only show exception details in Development — never in Production!
            detail = context.RequestServices
                            .GetRequiredService<IWebHostEnvironment>()
                            .IsDevelopment()
                        ? exception.ToString()
                        : null,
            traceId = context.TraceIdentifier
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
