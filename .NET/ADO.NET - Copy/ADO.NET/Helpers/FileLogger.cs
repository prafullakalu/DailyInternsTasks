namespace CleanApiProject.Helpers;

public class FileLoggerProvider : ILoggerProvider
{
    private readonly string _filePath;
    private readonly object _lock = new();

    public FileLoggerProvider(string filePath)
    {
        _filePath = filePath;

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

        var line = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC] [{logLevel.ToString()[..3].ToUpper()}] [{_category}] {message}";

        if (exception != null)
            line += Environment.NewLine + $"    EXCEPTION: {exception}" + Environment.NewLine;

        lock (_lock)
        {
            try
            {
                File.AppendAllText(_filePath, line + Environment.NewLine);
            }
            catch
            {
            }
        }
    }
}
