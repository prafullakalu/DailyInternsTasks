using System;
using System.IO;

class createFileAddText
{
    public static void run()
    {
        string path = "file1.txt";
        File.WriteAllText(path, "Hello this file is created using CSharp.");
        Console.WriteLine("File created and text added.");
    }
}

class createAndReadFile
{
    public static void run()
    {
        string path = "file2.txt";

        File.WriteAllText(path, "This is a sample file.\nReading file example.");

        string content = File.ReadAllText(path);

        Console.WriteLine("File Content:");
        Console.WriteLine(content);
    }
}

class writeArrayToFile
{
    public static void run()
    {
        string path = "file3.txt";

        string[] lines =
        {
            "Line One",
            "Line Two",
            "Line Three",
            "Line Four"
        };

        File.WriteAllLines(path, lines);

        Console.WriteLine("Array of strings written to file.");
    }
}

class appendTextToFile
{
    public static void run()
    {
        string path = "file4.txt";

        File.WriteAllText(path, "Original Text\n");

        File.AppendAllText(path, "Appended Text");

        Console.WriteLine("Text appended to file.");
    }
}

class readFirstLine
{
    public static void run()
    {
        string path = "file5.txt";

        File.WriteAllText(path, "First Line\nSecond Line\nThird Line");

        using (StreamReader reader = new StreamReader(path))
        {
            string firstLine = reader.ReadLine();
            Console.WriteLine("First Line: " + firstLine);
        }
    }
}

class countLinesInFile
{
    public static void run()
    {
        string path = "file6.txt";

        File.WriteAllText(path, "Line1\nLine2\nLine3\nLine4");

        int count = File.ReadAllLines(path).Length;

        Console.WriteLine("Total number of lines: " + count);
    }
}

class mainProgram
{
    static void Main()
    {
        createFileAddText.run();
        createAndReadFile.run();
        writeArrayToFile.run();
        appendTextToFile.run();
        readFirstLine.run();
        countLinesInFile.run();


    }
}