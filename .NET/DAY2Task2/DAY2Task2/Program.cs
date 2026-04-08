using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Configuration;


enum designation
{
    developer,
    qa
}

class employee
{
    public int id { get; set; }
    public string firstName { get; set; }
    public string lastName { get; set; }
    public string gender { get; set; }
    public string email { get; set; }
    public string phone { get; set; }
    public designation designation { get; set; }
    public decimal salary { get; set; }
}

static class validationExtensions
{
    public static bool isValidName(this string name)
    {
        return !string.IsNullOrWhiteSpace(name) &&
               Regex.IsMatch(name, @"^[a-zA-Z]{2,}$");
    }

    public static bool isValidEmail(this string email)
    {
        return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
    }

    public static bool isValidPhone(this string phone)
    {
        return phone.Length == 10 && long.TryParse(phone, out _);
    }

    public static bool isValidSalary(this decimal salary)
    {
        return salary >= 10000 && salary <= 50000;
    }
}

class employeeService
{
    string filePath = "employees.json";

    public List<employee> getEmployees()
    {
        if (!File.Exists(filePath))
            return new List<employee>();

        string json = File.ReadAllText(filePath);

        return JsonSerializer.Deserialize<List<employee>>(json)
               ?? new List<employee>();
    }

    public void saveEmployees(List<employee> list)
    {
        string json = JsonSerializer.Serialize(
            list,
            new JsonSerializerOptions { WriteIndented = true }
        );

        File.WriteAllText(filePath, json);
    }

    void printTable(List<employee> list)
    {
        if (list.Count == 0)
        {
            Console.WriteLine("No employees found.");
            return;
        }

        Console.WriteLine();
        Console.WriteLine("+----+------------+------------+--------+----------------------+------------+------------+--------+");
        Console.WriteLine("| Id | FirstName  | LastName   | Gender | Email                | Phone      | Role       | Salary |");
        Console.WriteLine("+----+------------+------------+--------+----------------------+------------+------------+--------+");

        foreach (var e in list)
        {
            Console.WriteLine(
                $"| {e.id,-2} | {e.firstName,-10} | {e.lastName,-10} | {e.gender,-6} | {e.email,-20} | {e.phone,-10} | {e.designation,-10} | {e.salary,-6} |"
            );
        }

        Console.WriteLine("+----+------------+------------+--------+----------------------+------------+------------+--------+");
    }

    public void showAll()
    {
        printTable(getEmployees());
    }

    public void showById(int id)
    {
        var list = getEmployees().Where(e => e.id == id).ToList();
        printTable(list);
    }

    public void showByEmail(string email)
    {
        var list = getEmployees().Where(e => e.email == email).ToList();
        printTable(list);
    }

    public bool emailExists(string email)
    {
        return getEmployees().Exists(e => e.email == email);
    }

    public void addEmployee(employee emp)
    {
        var list = getEmployees();

        if (emailExists(emp.email))
        {
            Console.WriteLine("Email already exists.");
            return;
        }

        emp.id = list.Count == 0 ? 1 : list.Max(e => e.id) + 1;

        list.Add(emp);
        saveEmployees(list);

        Console.WriteLine("Employee added.");
    }

    public void deleteEmployee(int id)
    {
        var list = getEmployees();
        var emp = list.Find(e => e.id == id);

        if (emp == null)
        {
            Console.WriteLine("Employee not found.");
            return;
        }

        list.Remove(emp);
        saveEmployees(list);

        Console.WriteLine("Employee removed.");
    }

    public void updateSalary(int id, decimal salary)
    {
        var list = getEmployees();
        var emp = list.Find(e => e.id == id);

        if (emp == null)
        {
            Console.WriteLine("Employee not found.");
            return;
        }

        emp.salary = salary;

        saveEmployees(list);

        Console.WriteLine("Salary updated.");
    }
}

static class inputHelper
{
    public static string getValidInput(string message, Func<string, bool> validator)
    {
        while (true)
        {
            Console.Write(message);
            string input = Console.ReadLine();

            if (validator(input))
                return input;

            Console.WriteLine("Invalid input. Try again.");
        }
    }

    public static int getValidInt(string message, int min, int max)
    {
        while (true)
        {
            Console.Write(message);

            if (int.TryParse(Console.ReadLine(), out int val)
                && val >= min && val <= max)
                return val;

            Console.WriteLine("Invalid number.");
        }
    }

    public static decimal getValidSalary(string message)
    {
        while (true)
        {
            Console.Write(message);

            if (decimal.TryParse(Console.ReadLine(), out decimal sal)
                && sal.isValidSalary())
                return sal;

            Console.WriteLine("Salary must be 10000–50000.");
        }
    }
}

class program
{
    static bool validatePin()
    {
        string configPin = ConfigurationManager.AppSettings["appPin"];

        while (true)
        {
            Console.Write("Enter PIN: ");
            string pin = Console.ReadLine();

            if (pin == configPin)
                return true;

            Console.WriteLine("Invalid PIN. Try again.");
        }
    }

    static void Main()
    {
        validatePin();

        employeeService service = new employeeService();

        while (true)
        {
            Console.WriteLine("\n1 Add Employee");
            Console.WriteLine("2 Show All");
            Console.WriteLine("3 Show By Id");
            Console.WriteLine("4 Show By Email");
            Console.WriteLine("5 Update Salary");
            Console.WriteLine("6 Delete Employee");
            Console.WriteLine("7 Exit");

            int choice = inputHelper.getValidInt("Choose option: ", 1, 7);

            if (choice == 1)
            {
                employee emp = new employee();

                emp.firstName = inputHelper.getValidInput(
                    "First Name: ", s => s.isValidName());

                emp.lastName = inputHelper.getValidInput(
                    "Last Name: ", s => s.isValidName());

                emp.gender = inputHelper.getValidInput(
                    "Gender (male/female): ",
                    s => s == "male" || s == "female");

                emp.email = inputHelper.getValidInput(
                    "Email: ", s => s.isValidEmail());

                emp.phone = inputHelper.getValidInput(
                    "Phone: ", s => s.isValidPhone());

                emp.designation = Enum.Parse<designation>(
                    inputHelper.getValidInput(
                        "Designation (developer/qa): ",
                        s => Enum.TryParse<designation>(s, true, out _)
                    ),
                    true
                );

                emp.salary = inputHelper.getValidSalary("Salary: ");

                service.addEmployee(emp);
            }

            else if (choice == 2)
                service.showAll();

            else if (choice == 3)
            {
                int id = inputHelper.getValidInt("Enter Id: ", 1, int.MaxValue);
                service.showById(id);
            }

            else if (choice == 4)
            {
                string email = inputHelper.getValidInput(
                    "Enter Email: ", s => s.isValidEmail());

                service.showByEmail(email);
            }

            else if (choice == 5)
            {
                int id = inputHelper.getValidInt("Enter Id: ", 1, int.MaxValue);
                decimal salary = inputHelper.getValidSalary("New Salary: ");

                service.updateSalary(id, salary);
            }

            else if (choice == 6)
            {
                int id = inputHelper.getValidInt("Enter Id: ", 1, int.MaxValue);
                service.deleteEmployee(id);
            }

            else if (choice == 7)
                break;
        }
    }
}

