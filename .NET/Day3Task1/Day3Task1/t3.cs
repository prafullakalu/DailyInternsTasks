using System;
using System.Collections.Generic;

namespace Day3Task11
{
    class Program3
    {
        static void Main(string[] args)
        {
            // Generic List for Students
            List<string> students = new List<string>();

            // -------- Admission --------
            students.Add("Rahul");
            students.Add("Amit");
            students.Add("Priya");
            students.Add("Neha");
            students.Add("Karan");

            Console.WriteLine("Students admitted successfully.\n");

            Console.WriteLine("Total Students: " + students.Count);

            Console.WriteLine("\nStudent List:");
            foreach (string s in students)
            {
                Console.WriteLine(s);
            }

            // -------- Students Leaving --------
            Console.WriteLine("\nSome students are leaving college...");

            students.Remove("Amit");
            students.Remove("Neha");

            Console.WriteLine("\nRemaining Students:");
            foreach (string s in students)
            {
                Console.WriteLine(s);
            }

            Console.WriteLine("\nTotal Students After Removal: " + students.Count);

            // -------- Best Students --------
            Console.WriteLine("\nBest Students Award:");

            List<string> bestStudents = new List<string>();
            bestStudents.Add("Rahul");
            bestStudents.Add("Priya");

            foreach (string s in bestStudents)
            {
                Console.WriteLine(s);
            }

            Console.ReadLine();
        }
    }
}