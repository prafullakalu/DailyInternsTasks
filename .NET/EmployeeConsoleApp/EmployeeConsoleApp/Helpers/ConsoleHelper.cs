namespace EmployeeConsoleApp.Helpers
{
  
    public static class ConsoleHelper
    {
        public static void PrintHeader(string title)
        {
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("╔══════════════════════════════════════════════════╗");
            Console.WriteLine($"║  {title.PadRight(48)}║");
            Console.WriteLine("╚══════════════════════════════════════════════════╝");
            Console.ResetColor();
        }

        public static void PrintSeparator()
        {
            Console.ForegroundColor = ConsoleColor.DarkGray;
            Console.WriteLine("──────────────────────────────────────────────────");
            Console.ResetColor();
        }

        public static void PrintSuccess(string message)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"  ✔  {message}");
            Console.ResetColor();
        }

        public static void PrintError(string message)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"  ✘  {message}");
            Console.ResetColor();
        }

        public static void PrintWarning(string message)
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"  ⚠  {message}");
            Console.ResetColor();
        }

        public static void PrintInfo(string message)
        {
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine($"  ℹ  {message}");
            Console.ResetColor();
        }

     
        public static string GetInput(string prompt)
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.Write($"  {prompt}: ");
            Console.ResetColor();
            return Console.ReadLine()?.Trim() ?? string.Empty;
        }

     
        public static string GetValidatedInput(string prompt, Func<string, (bool IsValid, string ErrorMessage)> validator)
        {
            while (true)
            {
                string input = GetInput(prompt);
                var (isValid, error) = validator(input);
                if (isValid)
                    return input;

                PrintError(error);
            }
        }

        public static void PrintMenu()
        {
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("  ┌─────────────────────────────────┐");
            Console.WriteLine("  │         EMPLOYEE MANAGER        │");
            Console.WriteLine("  ├─────────────────────────────────┤");
            Console.WriteLine("  │  1.  Add New Employee           │");
            Console.WriteLine("  │  2.  Delete Employee            │");
            Console.WriteLine("  │  3.  Exit                       │");
            Console.WriteLine("  └─────────────────────────────────┘");
            Console.ResetColor();
            Console.WriteLine();
        }
    }
}