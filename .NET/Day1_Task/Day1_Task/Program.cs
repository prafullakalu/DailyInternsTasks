using System;

namespace Day1_Task
{
    internal class QuizeApplication
    {
        static void Main()
        {
            Console.BackgroundColor = ConsoleColor.DarkBlue;
            Console.ForegroundColor = ConsoleColor.White;
            Console.Clear();

            printHeader();

            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.Write("Enter your name: ");
            string userName = Console.ReadLine();

            char restart;

            do
            {
                Console.Clear();
                printHeader();

                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.WriteLine("\nWelcome " + userName + " to the Quiz Challenge!\n");

                string[] questions =
                {
                    "What is the capital of India?",
                    "Which language is used in .NET?",
                    "What is 5 + 3?",
                    "Which planet is known as the Red Planet?",
                    "Which keyword is used to define a class in C#?",
                    "Which data type stores true or false?",
                    "What symbol ends a statement in C#?",
                    "Which loop repeats while a condition is true?",
                    "Which company developed C#?",
                    "Which method is the starting point of a C# program?"
                };

                string[,] options =
                {
                    {"A. Delhi","B. Mumbai","C. Kolkata","D. Chennai"},
                    {"A. Python","B. Java","C. C#","D. PHP"},
                    {"A. 6","B. 8","C. 9","D. 10"},
                    {"A. Earth","B. Mars","C. Venus","D. Jupiter"},
                    {"A. class","B. object","C. define","D. new"},
                    {"A. int","B. bool","C. string","D. double"},
                    {"A. .","B. ,","C. ;","D. :"},
                    {"A. for","B. while","C. switch","D. if"},
                    {"A. Google","B. Apple","C. Microsoft","D. IBM"},
                    {"A. Start()","B. Main()","C. Run()","D. Begin()"}
                };

                char[] answers = { 'A', 'C', 'B', 'B', 'A', 'B', 'C', 'B', 'C', 'B' };

                int score = 0;

                for (int i = 0; i < questions.Length; i++)
                {
                    Console.ForegroundColor = ConsoleColor.White;
                    Console.WriteLine("\n--------------------------------------------------");

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("Question " + (i + 1));

                    Console.ForegroundColor = ConsoleColor.Cyan;
                    Console.WriteLine(questions[i] + "\n");

                    Console.ForegroundColor = ConsoleColor.Yellow;

                    for (int j = 0; j < 4; j++)
                    {
                        Console.WriteLine(options[i, j]);
                    }

                    Console.ResetColor();

                    char userAnswer;

                    while (true)
                    {
                        Console.ForegroundColor = ConsoleColor.White;
                        Console.Write("\nYour answer (A/B/C/D): ");

                        string input = Console.ReadLine().Trim().ToUpper();

                        if (input.Length == 1 && "ABCD".Contains(input))
                        {
                            userAnswer = input[0];
                            break;
                        }
                        else
                        {
                            Console.ForegroundColor = ConsoleColor.Red;
                            Console.WriteLine("Invalid input! Please enter A, B, C, or D.");
                        }
                    }

                    if (userAnswer == answers[i])
                    {
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.WriteLine("✔ Correct!");
                        score++;
                    }
                    else
                    {
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine("✘ Incorrect!");
                    }

                    Console.ResetColor();
                }

                Console.WriteLine("\n==================================================");

                Console.ForegroundColor = ConsoleColor.Magenta;
                Console.WriteLine("\nQuiz Completed!");

                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine(userName + ", your score: " + score + " / 10");

                double percentage = (score / 10.0) * 100;

                if (percentage >= 70)
                {
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("Result: PASS");
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Result: FAIL");
                }

                Console.ResetColor();

                Console.WriteLine("\n==================================================");

                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.Write("\nRestart quiz? (Y/N): ");

                restart = Convert.ToChar(Console.ReadLine().Trim().ToUpper());

            } while (restart == 'Y');

            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("\nThank you for playing the Quiz!");

            Console.ResetColor();
        }

        static void printHeader()
        {
            Console.ForegroundColor = ConsoleColor.White;

            Console.WriteLine("==================================================");
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("              C# QUIZ APPLICATION");
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("==================================================");

            Console.ResetColor();
        }
    }
}   