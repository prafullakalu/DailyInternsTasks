namespace CleanApiProject.Helpers;


public class FileLoggerProvider : ILoggerProvider
{
    private readonly string _filePath;
    private readonly object _lock = new();

    public FileLoggerProvider(string filePath)
    {
        _filePath = filePath;

        // Ensure the Logs directory exists at startup
        var dir = Path.GetDirectoryName(filePath);
        if (!string.IsNullOrEmpty(dir))
            Directory.CreateDirectory(dir);
    }

    public ILogger CreateLogger(string categoryName)
        => new FileLogger(categoryName, _filePath, _lock);

    public void Dispose() { }
}

public class FileLogger : ILogger
{
    private readonly string _category;
    private readonly string _filePath;
    private readonly object _lock;

    public FileLogger(string category, string filePath, object lockObj)
    {
        _category = category;
        _filePath = filePath;
        _lock = lockObj;
    }

    // Only log Information and above — skip Trace/Debug to keep file clean
    public bool IsEnabled(LogLevel logLevel) => logLevel >= LogLevel.Information;

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

    public void Log<TState>(
        LogLevel logLevel,
        EventId eventId,
        TState state,
        Exception? exception,
        Func<TState, Exception?, string> formatter)
    {
        if (!IsEnabled(logLevel)) return;

        var message = formatter(state, exception);

        // Format the log line:
        // [2024-01-15 10:30:45 UTC] [INF] [CleanApiProject.Services.AuthService] User logged in: admin@example.com
        var line = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC] [{logLevel.ToString()[..3].ToUpper()}] [{_category}] {message}";

        // Append exception details if present (full stack trace)
        if (exception != null)
            line += Environment.NewLine + $"    EXCEPTION: {exception}" + Environment.NewLine;

        // Thread-safe file write
        lock (_lock)
        {
            try
            {
                File.AppendAllText(_filePath, line + Environment.NewLine);
            }
            catch
            {
                // Swallow file I/O errors — logging should never crash the app
            }
        }
    }
}
