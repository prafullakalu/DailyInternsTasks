using System.Diagnostics;
using System.Text;

namespace CleanApiProject.Middleware;

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

        var requestBody = await readRequestBodyAsync(context.Request);

        _logger.LogInformation(
            "[REQUEST]  {Method} {Path}{Query} | Body: {Body} | TraceId: {TraceId}",
            context.Request.Method,
            context.Request.Path,
            context.Request.QueryString,
            requestBody,
            context.TraceIdentifier);

        var originalBodyStream = context.Response.Body;
        using var responseBuffer = new MemoryStream();
        context.Response.Body = responseBuffer;

        await _next(context);

        stopwatch.Stop();

        responseBuffer.Seek(0, SeekOrigin.Begin);
        var responseBody = await new StreamReader(responseBuffer).ReadToEndAsync();
        responseBuffer.Seek(0, SeekOrigin.Begin);

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

        await responseBuffer.CopyToAsync(originalBodyStream);
        context.Response.Body = originalBodyStream;
    }

    private static async Task<string> readRequestBodyAsync(HttpRequest request)
    {
        if (request.Method == "GET" || request.Method == "DELETE")
            return "(none)";

        request.EnableBuffering();

        using var reader = new StreamReader(
            request.Body, Encoding.UTF8, leaveOpen: true);

        var body = await reader.ReadToEndAsync();
        request.Body.Position = 0;

        if (body.Contains("password", StringComparison.OrdinalIgnoreCase))
            return "[body contains password — redacted]";

        return string.IsNullOrWhiteSpace(body) ? "(empty)" : body;
    }
}
