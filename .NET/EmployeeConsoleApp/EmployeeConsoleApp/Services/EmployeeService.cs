using EmployeeConsoleApp.Config;
using EmployeeConsoleApp.Models;
using Newtonsoft.Json;



namespace EmployeeConsoleApp.Services
{
    
    public class EmployeeService
    {
        private readonly string _filePath;
        private List<Employee> _employees;

        public EmployeeService()
        {
            _filePath = AppConfig.GetEmployeeFilePath();
            _employees = LoadEmployees();
        }

        
        public string FilePath => _filePath;

     
        private List<Employee> LoadEmployees()
        {
            try
            {
                if (!File.Exists(_filePath))
                    return new List<Employee>();

                string json = File.ReadAllText(_filePath);

                if (string.IsNullOrWhiteSpace(json))
                    return new List<Employee>();

           

                var employees = JsonConvert.DeserializeObject<List<Employee>>(json);
                return employees ?? new List<Employee>();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to load employee data from file: {ex.Message}", ex);
            }
        }

        private void SaveEmployees()
        {
            try
            {
                var sorted = _employees.OrderByDescending(e => e.MonthlySalary).ToList();
                string json = JsonConvert.SerializeObject(sorted, Newtonsoft.Json.Formatting.Indented);
                File.WriteAllText(_filePath, json);
                _employees = sorted;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to save employee data to file: {ex.Message}", ex);
            }
        }


        public bool EmployeeIdExists(string employeeId)
        {
            return _employees.Any(e =>
                e.EmployeeId.Equals(employeeId, StringComparison.OrdinalIgnoreCase));
        }

        
        public bool EmailExists(string email)
        {
            return _employees.Any(e =>
                e.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
        }

     
        public (bool Success, string Message) AddEmployee(Employee employee)
        {
            try
            {
                if (EmployeeIdExists(employee.EmployeeId))
                    return (false, $"An employee with ID '{employee.EmployeeId}' already exists.");

                if (EmailExists(employee.Email))
                    return (false, $"An employee with email '{employee.Email}' already exists.");

                employee.CalculateTotalExperience();

                _employees.Add(employee);
                SaveEmployees();

                return (true, $"Employee '{employee.Name}' added successfully.");
            }
            catch (Exception ex)
            {
                return (false, $"Error adding employee: {ex.Message}");
            }
        }

    
        public (bool Success, string Message) DeleteEmployee(string employeeId)
        {
            try
            {
                var employee = _employees.FirstOrDefault(e =>
                    e.EmployeeId.Equals(employeeId, StringComparison.OrdinalIgnoreCase));

                if (employee == null)
                    return (false, $"No employee found with ID '{employeeId}'. Please check and try again.");

                _employees.Remove(employee);
                SaveEmployees();

                return (true, $"Employee '{employee.Name}' (ID: {employee.EmployeeId}) deleted successfully.");
            }
            catch (Exception ex)
            {
                return (false, $"Error deleting employee: {ex.Message}");
            }
        }
        public IReadOnlyList<Employee> GetAllEmployees() => _employees.AsReadOnly();

        public int TotalEmployees => _employees.Count;
    }
}