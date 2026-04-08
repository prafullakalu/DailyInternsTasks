using System.Text.RegularExpressions;

namespace EmployeeConsoleApp.Helpers
{

    public static class ValidationHelper
    {
     
        private static readonly Regex EmailRegex = new(
            @"^[a-zA-Z0-9][a-zA-Z0-9._%+\-]*[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9\-]*(\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,}$",
            RegexOptions.Compiled);

    
        private static readonly Regex ConsecutiveDotsRegex = new(@"\.\.", RegexOptions.Compiled);

        private static readonly Regex PhoneRegex = new(@"^\+?[0-9]{7,15}$", RegexOptions.Compiled);
        private static readonly Regex PostcodeRegex = new(@"^[A-Za-z0-9\s\-]{3,10}$", RegexOptions.Compiled);
        private static readonly Regex AlphaSpaceRegex = new(@"^[A-Za-z\s'\-]{2,100}$", RegexOptions.Compiled);

        public static (bool IsValid, string ErrorMessage) ValidateName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return (false, "Name cannot be empty.");
            if (!AlphaSpaceRegex.IsMatch(name))
                return (false, "Name must contain only letters, spaces, hyphens, or apostrophes (2-100 chars).");
            return (true, string.Empty);
        }

        public static (bool IsValid, string ErrorMessage) ValidateDOB(string input, out DateTime dob)
        {
            dob = default;
            if (string.IsNullOrWhiteSpace(input))
                return (false, "Date of Birth cannot be empty.");
            if (!DateTime.TryParse(input, out dob))
                return (false, "Invalid date format. Please use dd-MM-yyyy.");
            if (dob >= DateTime.Today)
                return (false, "Date of Birth must be in the past.");
            int age = DateTime.Today.Year - dob.Year;
            if (dob.Date > DateTime.Today.AddYears(-age)) age--;
            if (age < 18) return (false, "Employee must be at least 18 years old.");
            if (age > 80) return (false, "Please enter a valid Date of Birth.");
            return (true, string.Empty);
        }

        public static (bool IsValid, string ErrorMessage) ValidateGender(string gender)
        {
            if (string.IsNullOrWhiteSpace(gender))
                return (false, "Gender cannot be empty.");
            if (gender.ToUpper() != "M" && gender.ToUpper() != "F")
                return (false, "Gender must be 'M' for Male or 'F' for Female.");
            return (true, string.Empty);
        }

        public static (bool IsValid, string ErrorMessage) ValidateDesignation(string designation)
        {
            if (string.IsNullOrWhiteSpace(designation))
                return (false, "Designation cannot be empty.");
            if (designation.Trim().Length < 2 || designation.Trim().Length > 100)
                return (false, "Designation must be between 2 and 100 characters.");
            return (true, string.Empty);
        }

        public static (bool IsValid, string ErrorMessage) ValidateCity(string city)
        {
            if (string.IsNullOrWhiteSpace(city))
                return (false, "City cannot be empty.");
            if (!AlphaSpaceRegex.IsMatch(city))
                return (false, "City must contain only letters and spaces.");
            return (true, string.Empty);
        }

        public static (bool IsValid, string ErrorMessage) ValidateState(string state)
        {
            if (string.IsNullOrWhiteSpace(state))
                return (false, "State cannot be empty.");
            if (!AlphaSpaceRegex.IsMatch(state))
                return (false, "State must contain only letters and spaces.");
            return (true, string.Empty);
        }

        public static (bool IsValid, string ErrorMessage) ValidatePostcode(string postcode)
        {
            if (string.IsNullOrWhiteSpace(postcode))
                return (false, "Postcode cannot be empty.");
            if (!PostcodeRegex.IsMatch(postcode))
                return (false, "Postcode must be 3-10 alphanumeric characters.");
            return (true, string.Empty);
        }

        public static (bool IsValid, string ErrorMessage) ValidatePhone(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                return (false, "Phone number cannot be empty.");
            if (!PhoneRegex.IsMatch(phone))
                return (false, "Phone must be 7-15 digits (optional leading +).");
            return (true, string.Empty);
        }

      
        public static (bool IsValid, string ErrorMessage) ValidateEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return (false, "Email cannot be empty.");

     
            char first = email[0];
            if (!char.IsLetterOrDigit(first))
                return (false, "Email must start with a letter or digit.");

        
            if (ConsecutiveDotsRegex.IsMatch(email))
                return (false, "Email cannot contain consecutive dots (..).");

            if (!EmailRegex.IsMatch(email))
                return (false, "Please enter a valid email address (e.g., john.doe@company.com).");

            if (email.Length > 254)
                return (false, "Email address is too long (max 254 characters).");

            return (true, string.Empty);
        }

        public static (bool IsValid, string ErrorMessage) ValidateDateOfJoining(string input, DateTime dob, out DateTime joiningDate)
        {
            joiningDate = default;
            if (string.IsNullOrWhiteSpace(input))
                return (false, "Date of Joining cannot be empty.");
            if (!DateTime.TryParse(input, out joiningDate))
                return (false, "Invalid date format. Please use dd-MM-yyyy.");
            if (joiningDate > DateTime.Today)
                return (false, "Date of Joining cannot be in the future.");
            if (joiningDate <= dob)
                return (false, "Date of Joining must be after Date of Birth.");
            int ageAtJoining = joiningDate.Year - dob.Year;
            if (joiningDate < dob.AddYears(ageAtJoining)) ageAtJoining--;
            if (ageAtJoining < 16)
                return (false, "Employee must be at least 16 years old at time of joining.");
            return (true, string.Empty);
        }

        public static (bool IsValid, string ErrorMessage) ValidateRemarks(string remarks)
        {
            if (remarks != null && remarks.Length > 500)
                return (false, "Remarks cannot exceed 500 characters.");
            return (true, string.Empty);
        }

        public static (bool IsValid, string ErrorMessage) ValidateSalary(string input, out decimal salary)
        {
            salary = 0;
            if (string.IsNullOrWhiteSpace(input))
                return (false, "Monthly Salary cannot be empty.");
            if (!decimal.TryParse(input, out salary))
                return (false, "Monthly Salary must be a valid numeric value.");
            if (salary <= 0)
                return (false, "Monthly Salary must be greater than zero.");
            if (salary > 10_000_000)
                return (false, "Monthly Salary seems unrealistically high. Please re-enter.");
            return (true, string.Empty);
        }

        public static (bool IsValid, string ErrorMessage) ValidateDepartmentChoice(string input, out int choice)
        {
            choice = 0;
            if (string.IsNullOrWhiteSpace(input))
                return (false, "Department selection cannot be empty.");
            if (!int.TryParse(input, out choice))
                return (false, "Please enter a number (1-6) for the department.");
            if (choice < 1 || choice > 6)
                return (false, "Department choice must be between 1 and 6.");
            return (true, string.Empty);
        }
    }
}