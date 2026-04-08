using EmployeeConsoleApp.Enums;
using Newtonsoft.Json;

namespace EmployeeConsoleApp.Models
{
  
    public class Employee
    {
       
        [JsonProperty("employeeId")]
        public string EmployeeId { get; set; } = GenerateEmployeeId();

        [JsonProperty("name")]
        public string Name { get; set; } = string.Empty;

        [JsonProperty("dob")]
        public DateTime DOB { get; set; }

        [JsonProperty("gender")]
        public string Gender { get; set; } = string.Empty;

        [JsonProperty("designation")]
        public string Designation { get; set; } = string.Empty;

        [JsonProperty("city")]
        public string City { get; set; } = string.Empty;

        [JsonProperty("state")]
        public string State { get; set; } = string.Empty;

        [JsonProperty("postcode")]
        public string Postcode { get; set; } = string.Empty;

        [JsonProperty("phone")]
        public string Phone { get; set; } = string.Empty;

        [JsonProperty("email")]
        public string Email { get; set; } = string.Empty;

        [JsonProperty("dateOfJoining")]
        public DateTime DateOfJoining { get; set; }

        [JsonProperty("totalExperience")]
        public string TotalExperience { get; set; } = string.Empty;

        [JsonProperty("remarks")]
        public string Remarks { get; set; } = string.Empty;

        [JsonProperty("department")]
        public Department Department { get; set; }

        [JsonProperty("monthlySalary")]
        public decimal MonthlySalary { get; set; }

        [JsonProperty("departmentColor")]
        public string DepartmentColor => DepartmentColors.GetColor(Department);

      
        public static string GenerateEmployeeId()
        {
            string guidPart = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
            return $"EMP-{guidPart}";
        }

    
        public void CalculateTotalExperience()
        {
            DateTime today = DateTime.Today;
            int years = today.Year - DateOfJoining.Year;
            int months = today.Month - DateOfJoining.Month;
            if (months < 0) { years--; months += 12; }
            TotalExperience = years > 0
                ? $"{years} year(s) {months} month(s)"
                : $"{months} month(s)";
        }
    }
}