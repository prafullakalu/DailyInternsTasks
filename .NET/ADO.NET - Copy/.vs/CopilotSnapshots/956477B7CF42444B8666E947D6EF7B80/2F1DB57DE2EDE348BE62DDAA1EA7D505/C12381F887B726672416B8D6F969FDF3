using System.Diagnostics;
using System.Text;

namespace CleanApiProject.Middleware;

/// <summary>
/// REQUEST / RESPONSE LOGGING MIDDLEWARE
/// ─────────────────────────────────────
/// Logs every HTTP request and response including:
///   - HTTP method and path
///   - Query string
///   - Request body (for POST/PUT)
///   - Response status code
///   - Time taken (ms)
///
/// Logs are written to:
///   1. Console (visible during development)
///   2. Log file (Logs/app-log.txt via ILogger configured in Program.cs)
///
/// HOW TO IMPLEMENT (already done in Program.cs):
///   app.UseMiddleware<LoggingMiddleware>();
///   ← Add after ExceptionHandlingMiddleware
///
/// WARNING: Do NOT log Authorization headers or passwords!
/// </summary>
public class LoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LoggingMiddleware> _logger;

    public LoggingMiddleware(RequestDelegate next, ILogger<LoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();

        // ── Log Incoming Request ──────────────────────────────────────
        var requestBody = await readRequestBodyAsync(context.Request);

        _logger.LogInformation(
            "[REQUEST]  {Method} {Path}{Query} | Body: {Body} | TraceId: {TraceId}",
            context.Request.Method,
            context.Request.Path,
            context.Request.QueryString,
            requestBody,
            context.TraceIdentifier);

        // ── Capture Response ──────────────────────────────────────────
        // We swap the response stream so we can read it before it's sent
        var originalBodyStream = context.Response.Body;
        using var responseBuffer = new MemoryStream();
        context.Response.Body = responseBuffer;

        // Pass control to the next middleware
        await _next(context);

        stopwatch.Stop();

        // ── Log Outgoing Response ─────────────────────────────────────
        responseBuffer.Seek(0, SeekOrigin.Begin);
        var responseBody = await new StreamReader(responseBuffer).ReadToEndAsync();
        responseBuffer.Seek(0, SeekOrigin.Begin);

        // Truncate long response bodies in logs (e.g. large lists)
        var truncated = responseBody.Length > 500
            ? responseBody[..500] + "...[truncated]"
            : responseBody;

        _logger.LogInformation(
            "[RESPONSE] {Method} {Path} → {StatusCode} | {ElapsedMs}ms | TraceId: {TraceId}",
            context.Request.Method,
            context.Request.Path,
            context.Response.StatusCode,
            stopwatch.ElapsedMilliseconds,
            context.TraceIdentifier);

        // Copy the captured response back to the original stream
        await responseBuffer.CopyToAsync(originalBodyStream);
        context.Response.Body = originalBodyStream;
    }

    /// <summary>
    /// Reads the request body without consuming it.
    /// After reading, we rewind the stream so the controller can still read it.
    /// </summary>
    private static async Task<string> readRequestBodyAsync(HttpRequest request)
    {
        // Only read body for methods that typically have one
        if (request.Method == "GET" || request.Method == "DELETE")
            return "(none)";

        request.EnableBuffering();  // Allows multiple reads of the body

        using var reader = new StreamReader(
            request.Body, Encoding.UTF8, leaveOpen: true);

        var body = await reader.ReadToEndAsync();
        request.Body.Position = 0;  // Rewind so controller can read it too

        // Mask password fields in logs
        if (body.Contains("password", StringComparison.OrdinalIgnoreCase))
            return "[body contains password — redacted]";

        return string.IsNullOrWhiteSpace(body) ? "(empty)" : body;
    }
}
