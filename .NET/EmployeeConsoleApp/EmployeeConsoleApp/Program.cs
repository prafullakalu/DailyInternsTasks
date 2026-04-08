using EmployeeConsoleApp.Config;
using EmployeeConsoleApp.Helpers;
using EmployeeConsoleApp.Services;

namespace EmployeeConsoleApp
{
   
    class Program
    {
        static void Main(string[] args)
        {
            Console.Title = "Employee Management System";

            try
            {
                Run();
            }
            catch (Exception ex)
            {
                ConsoleHelper.PrintError($"An unexpected error occurred: {ex.Message}");
                Console.WriteLine("\nPress any key to exit...");
                Console.ReadKey();
            }
        }

        static void Run()
        {
         
            var employeeService = new EmployeeService();
            var inputService = new EmployeeInputService(employeeService);

            ConsoleHelper.PrintHeader("EMPLOYEE MANAGEMENT SYSTEM");
            ConsoleHelper.PrintInfo($"Data file: {employeeService.FilePath}");
            ConsoleHelper.PrintInfo($"Employees loaded: {employeeService.TotalEmployees}");

            bool running = true;

            while (running)
            {
                ConsoleHelper.PrintMenu();

                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.Write("  Please select an option (1/2/3): ");
                Console.ResetColor();

                string? input = Console.ReadLine()?.Trim();

                switch (input)
                {
                    case "1":
                        HandleAddEmployee(employeeService, inputService);
                        break;

                    case "2":
                        HandleDeleteEmployee(employeeService);
                        break;

                    case "3":
                        running = false;
                        ConsoleHelper.PrintInfo("Exiting the application. Goodbye!");
                        break;

                    default:
                        ConsoleHelper.PrintWarning("Invalid option. Please press 1 to Add, 2 to Delete, or 3 to Exit.");
                        break;
                }
            }
        }

    
        static void HandleAddEmployee(EmployeeService employeeService, EmployeeInputService inputService)
        {
            try
            {
                var employee = inputService.CollectEmployeeDetails();

                ConsoleHelper.PrintSeparator();
                ConsoleHelper.PrintInfo("Saving employee details...");

                var (success, message) = employeeService.AddEmployee(employee);

                if (success)
                {
                    ConsoleHelper.PrintSuccess(message);
                    ConsoleHelper.PrintInfo($"Total Experience: {employee.TotalExperience}");
                    ConsoleHelper.PrintInfo($"Data saved to: {employeeService.FilePath}");
                }
                else
                {
                    ConsoleHelper.PrintError(message);
                }
            }
            catch (Exception ex)
            {
                ConsoleHelper.PrintError($"Error while adding employee: {ex.Message}");
            }
        }

     
       
        static void HandleDeleteEmployee(EmployeeService employeeService)
        {
            try
            {
                ConsoleHelper.PrintHeader("DELETE EMPLOYEE");

                if (employeeService.TotalEmployees == 0)
                {
                    ConsoleHelper.PrintWarning("No employees found in the system. Nothing to delete.");
                    return;
                }

                ConsoleHelper.PrintInfo($"Current employees: {employeeService.TotalEmployees}");
                Console.WriteLine();

                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.Write("  Please provide the Employee ID which you want to delete: ");
                Console.ResetColor();

                string? employeeId = Console.ReadLine()?.Trim();

                if (string.IsNullOrWhiteSpace(employeeId))
                {
                    ConsoleHelper.PrintError("Employee ID cannot be empty.");
                    return;
                }

                var (success, message) = employeeService.DeleteEmployee(employeeId);

                if (success)
                    ConsoleHelper.PrintSuccess(message);
                else
                    ConsoleHelper.PrintError(message);
            }
            catch (Exception ex)
            {
                ConsoleHelper.PrintError($"Error while deleting employee: {ex.Message}");
            }
        }
    }
}