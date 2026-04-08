using EmployeeConsoleApp.Enums;
using EmployeeConsoleApp.Helpers;
using EmployeeConsoleApp.Models;

namespace EmployeeConsoleApp.Services
{
 
    public class EmployeeInputService
    {
        private readonly EmployeeService _employeeService;

        public EmployeeInputService(EmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

    
        public Employee CollectEmployeeDetails()
        {
            var employee = new Employee(); 

            ConsoleHelper.PrintHeader("ADD NEW EMPLOYEE");
            ConsoleHelper.PrintInfo($"Auto-generated Employee ID: {employee.EmployeeId}");
            ConsoleHelper.PrintSeparator();

            employee.Name = ConsoleHelper.GetValidatedInput(
                "Please enter Name",
                input => ValidationHelper.ValidateName(input));

            DateTime dob = CollectDOB();
            employee.DOB = dob;

            employee.Gender = ConsoleHelper.GetValidatedInput(
                "Please enter Gender (M/F)",
                input => ValidationHelper.ValidateGender(input)).ToUpper();

          
            employee.Designation = ConsoleHelper.GetValidatedInput(
                "Please enter Designation",
                input => ValidationHelper.ValidateDesignation(input));

            // ── City ─────────────────────────────────────────────────────────────
            employee.City = ConsoleHelper.GetValidatedInput(
                "Please enter City",
                input => ValidationHelper.ValidateCity(input));

            // ── State ────────────────────────────────────────────────────────────
            employee.State = ConsoleHelper.GetValidatedInput(
                "Please enter State",
                input => ValidationHelper.ValidateState(input));

            // ── Postcode ─────────────────────────────────────────────────────────
            employee.Postcode = ConsoleHelper.GetValidatedInput(
                "Please enter Postcode",
                input => ValidationHelper.ValidatePostcode(input));

            // ── Phone ────────────────────────────────────────────────────────────
            employee.Phone = ConsoleHelper.GetValidatedInput(
                "Please enter Phone",
                input => ValidationHelper.ValidatePhone(input));

            // ── Email ────────────────────────────────────────────────────────────
            employee.Email = CollectEmail();

            // ── Date of Joining ──────────────────────────────────────────────────
            employee.DateOfJoining = CollectDateOfJoining(dob);

            // ── Remarks (optional) ───────────────────────────────────────────────
            employee.Remarks = CollectRemarks();

            // ── Department ───────────────────────────────────────────────────────
            employee.Department = CollectDepartment();

            // ── Monthly Salary ───────────────────────────────────────────────────
            employee.MonthlySalary = CollectSalary();

            return employee;
        }

        private DateTime CollectDOB()
        {
            while (true)
            {
                string input = ConsoleHelper.GetInput("Please enter Date of Birth (dd-MM-yyyy)");
                var (isValid, error) = ValidationHelper.ValidateDOB(input, out DateTime dob);
                if (isValid) return dob;
                ConsoleHelper.PrintError(error);
            }
        }

        private string CollectEmail()
        {
            while (true)
            {
                string email = ConsoleHelper.GetValidatedInput(
                    "Please enter Email",
                    input => ValidationHelper.ValidateEmail(input));

                if (_employeeService.EmailExists(email))
                {
                    ConsoleHelper.PrintError($"Email '{email}' is already registered. Please enter a unique email.");
                    continue;
                }
                return email;
            }
        }

        private DateTime CollectDateOfJoining(DateTime dob)
        {
            while (true)
            {
                string input = ConsoleHelper.GetInput("Please enter Date of Joining (dd-MM-yyyy)");
                var (isValid, error) = ValidationHelper.ValidateDateOfJoining(input, dob, out DateTime joiningDate);
                if (isValid) return joiningDate;
                ConsoleHelper.PrintError(error);
            }
        }

        private string CollectRemarks()
        {
            while (true)
            {
                string remarks = ConsoleHelper.GetInput("Please enter Remarks (optional, press Enter to skip)");
                if (string.IsNullOrWhiteSpace(remarks)) return string.Empty;
                var (isValid, error) = ValidationHelper.ValidateRemarks(remarks);
                if (isValid) return remarks;
                ConsoleHelper.PrintError(error);
            }
        }

        private Department CollectDepartment()
        {
            Console.WriteLine();
            ConsoleHelper.PrintInfo("Available Departments:");
            Console.WriteLine("     1. Sales       ");
            Console.WriteLine("     2. Marketing   ");
            Console.WriteLine("     3. Development ");
            Console.WriteLine("     4. QA         ");
            Console.WriteLine("     5. HR          ");
            Console.WriteLine("     6. SEO       ");

            while (true)
            {
                string input = ConsoleHelper.GetInput("Please select Department (1-6)");
                var (isValid, error) = ValidationHelper.ValidateDepartmentChoice(input, out int choice);
                if (isValid) return (Department)choice;
                ConsoleHelper.PrintError(error);
            }
        }

        private decimal CollectSalary()
        {
            while (true)
            {
                string input = ConsoleHelper.GetInput("Please enter Monthly Salary");
                var (isValid, error) = ValidationHelper.ValidateSalary(input, out decimal salary);
                if (isValid) return salary;
                ConsoleHelper.PrintError(error);
            }
        }
    }
}