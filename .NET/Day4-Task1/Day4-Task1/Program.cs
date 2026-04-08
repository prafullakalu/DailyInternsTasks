using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.IO;
using System.Security.Cryptography;
using System.Configuration;

namespace SecureEmployeeManagement
{
    class Program
    {
        static List<Employee> employees = new List<Employee>();
        static string filePath;
        static string encryptionKey;

        static void Main(string[] args)
        {
            try
            {
                filePath = ConfigurationManager.AppSettings["filePath"];
                encryptionKey = ConfigurationManager.AppSettings["encryptionKey"];

                if (string.IsNullOrWhiteSpace(filePath) || string.IsNullOrWhiteSpace(encryptionKey))
                {
                    Console.WriteLine("Configuration missing in app.config");
                    return;
                }

                var data = FileService.DeserializeFromJson<List<Employee>>(filePath);
                if (data != null)
                    employees = data;

                while (true)
                {
                    Console.WriteLine();
                    Console.WriteLine("1 Add Employee");
                    Console.WriteLine("2 Show Employees");
                    Console.WriteLine("3 Exit");

                    var choice = Console.ReadLine();

                    if (choice == "1")
                        addEmployee();
                    else if (choice == "2")
                        showEmployees();
                    else if (choice == "3")
                        break;
                    else
                        Console.WriteLine("Invalid choice");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        static void addEmployee()
        {
            try
            {
                string firstName;
                while (true)
                {
                    Console.Write("First Name: ");
                    firstName = Console.ReadLine();
                    if (!string.IsNullOrWhiteSpace(firstName))
                        break;
                    Console.WriteLine("First name required");
                }

                string lastName;
                while (true)
                {
                    Console.Write("Last Name: ");
                    lastName = Console.ReadLine();
                    if (!string.IsNullOrWhiteSpace(lastName))
                        break;
                    Console.WriteLine("Last name required");
                }

                string email;
                while (true)
                {
                    Console.Write("Email: ");
                    email = Console.ReadLine();
                    if (!email.IsValidEmail())
                    {
                        Console.WriteLine("Invalid email format");
                        continue;
                    }
                    if (employees.Exists(x => x.Email.Equals(email, StringComparison.OrdinalIgnoreCase)))
                    {
                        Console.WriteLine("Email already exists");
                        continue;
                    }
                    break;
                }

                string phone;
                while (true)
                {
                    Console.Write("Phone Number: ");
                    phone = Console.ReadLine();
                    if (phone.IsValidPhoneNumber())
                        break;
                    Console.WriteLine("Phone must be 10 digits");
                }

                decimal salary;
                while (true)
                {
                    Console.Write("Salary: ");
                    var input = Console.ReadLine();
                    if (decimal.TryParse(input, out salary) && salary >= 20000 && salary <= 100000)
                        break;
                    Console.WriteLine("Salary must be between 20000 and 100000");
                }

                string password;
                while (true)
                {
                    Console.Write("Password: ");
                    password = Console.ReadLine();
                    if (!string.IsNullOrWhiteSpace(password))
                        break;
                    Console.WriteLine("Password required");
                }

                var encrypted = CryptoService.encrypt(password, encryptionKey);

                var emp = new Employee
                {
                    Id = Guid.NewGuid(),
                    FirstName = firstName.Trim(),
                    LastName = lastName.Trim(),
                    Email = email.Trim(),
                    PhoneNumber = phone,
                    Salary = salary,
                    Password = encrypted
                };

                employees.Add(emp);

                FileService.serializeToJson(filePath, employees);

                Console.WriteLine("Employee Added Successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        static void showEmployees()
        {
            try
            {
                if (!File.Exists(filePath))
                {
                    Console.WriteLine("File not found");
                    return;
                }

                if (employees.Count == 0)
                {
                    Console.WriteLine("No employees found");
                    return;
                }

                Console.WriteLine();
                Console.WriteLine("-------------------------------------------------------------------------------------------------------------");
                Console.WriteLine(String.Format("{0,-36} {1,-12} {2,-12} {3,-12} {4,-12} {5,-10} {6,-10}", "Id", "FirstName", "LastName", "Email", "Phone", "Salary", "Password"));
                Console.WriteLine("-------------------------------------------------------------------------------------------------------------");

                foreach (var e in employees)
                {
                    var pass = CryptoService.decrypt(e.Password, encryptionKey);

                    Console.WriteLine(String.Format("{0,-36} {1,-12} {2,-12} {3,-12} {4,-12} {5,-10} {6,-10}",
                        e.Id,
                        e.FirstName,
                        e.LastName,
                        e.Email,
                        e.PhoneNumber,
                        e.Salary,
                        pass));
                }

                Console.WriteLine("-------------------------------------------------------------------------------------------------------------");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
    }

    class Employee
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public decimal Salary { get; set; }
        public string Password { get; set; }
    }

    static class ValidationExtensions
    {
        public static bool IsValidEmail(this string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;
            return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
        }

        public static bool IsValidPhoneNumber(this string phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                return false;
            return Regex.IsMatch(phone, @"^\d{10}$");
        }
    }

    static class CryptoService
    {
        public static string encrypt(string text, string key)
        {
            using (Aes aes = Aes.Create())
            {
                var keyBytes = Encoding.UTF8.GetBytes(key.PadRight(32));
                aes.Key = keyBytes;
                aes.GenerateIV();

                var iv = aes.IV;

                using (var encryptor = aes.CreateEncryptor())
                {
                    var bytes = Encoding.UTF8.GetBytes(text);
                    var cipher = encryptor.TransformFinalBlock(bytes, 0, bytes.Length);

                    var result = new byte[iv.Length + cipher.Length];
                    Array.Copy(iv, result, iv.Length);
                    Array.Copy(cipher, 0, result, iv.Length, cipher.Length);

                    return Convert.ToBase64String(result);
                }
            }
        }

        public static string decrypt(string cipherText, string key)
        {
            var full = Convert.FromBase64String(cipherText);

            using (Aes aes = Aes.Create())
            {
                var keyBytes = Encoding.UTF8.GetBytes(key.PadRight(32));
                aes.Key = keyBytes;

                var iv = new byte[16];
                var cipher = new byte[full.Length - 16];

                Array.Copy(full, iv, 16);
                Array.Copy(full, 16, cipher, 0, cipher.Length);

                aes.IV = iv;

                using (var decryptor = aes.CreateDecryptor())
                {
                    var plain = decryptor.TransformFinalBlock(cipher, 0, cipher.Length);
                    return Encoding.UTF8.GetString(plain);
                }
            }
        }
    }

    static class FileService
    {
        public static void serializeToJson<T>(string path, T data)
        {
            try
            {
                var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(path, json);
            }
            catch
            {
                Console.WriteLine("Error writing file");
            }
        }

        public static T DeserializeFromJson<T>(string path)
        {
            try
            {
                if (!File.Exists(path))
                {
                    Console.WriteLine("File not found, new file will be created after first insert");
                    return default;
                }

                var json = File.ReadAllText(path);
                return JsonSerializer.Deserialize<T>(json);
            }
            catch
            {
                Console.WriteLine("Error reading file");
                return default;
            }
        }
    }
}