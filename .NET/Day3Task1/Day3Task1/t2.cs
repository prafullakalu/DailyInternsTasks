using System;
using System.Collections.Generic;
using System.Linq;

namespace Day3Task1
{
    class Program2
    {
        static void Main(string[] args)
        {
            // ----------- QUESTION 1 -----------
            Console.WriteLine("Question 1:");

            List<int> numbers = new List<int> { 1, 2, 3, 4, 5 };

            var newList = numbers.Select(x => (x + 2) * 5).ToList();

            Console.WriteLine("Original List:");
            Console.WriteLine(string.Join(", ", numbers));

            Console.WriteLine("New List ((n + 2) * 5):");
            Console.WriteLine(string.Join(", ", newList));


            // ----------- QUESTION 2 -----------
            Console.WriteLine("\nQuestion 2:");

            List<int> pages = new List<int>
            {
                1, 2, 4, 6, 7, 8, 9, 10, 12, 17, 19, 20, 21, 24, 25, 30
            };

            Console.WriteLine("Original Pages:");
            Console.WriteLine(string.Join(", ", pages));

            List<string> result = new List<string>();

            int start = pages[0];
            int end = pages[0];

            for (int i = 1; i < pages.Count; i++)
            {
                if (pages[i] == end + 1)
                {
                    end = pages[i];
                }
                else
                {
                    if (start == end)
                        result.Add(start.ToString());
                    else
                        result.Add(start + "-" + end);

                    start = pages[i];
                    end = pages[i];
                }
            }

            // Add last range
            if (start == end)
                result.Add(start.ToString());
            else
                result.Add(start + "-" + end);

            Console.WriteLine("Grouped Pages:");
            Console.WriteLine(string.Join(", ", result));

            Console.ReadLine();
        }
    }
}