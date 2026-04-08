using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Xml.Serialization;

namespace SerializationDemo
{
    public class City
    {
        public string Name { get; set; }
        public int Population { get; set; }

        public override string ToString()
        {
            return $"City: {Name}, Population: {Population}";
        }
    }

    public class Person
    {
        public string Name { get; set; }
        public int Age { get; set; }
        public City City { get; set; }

        public override string ToString()
        {
            return $"Name: {Name}, Age: {Age}, {City}";
        }
    }

    class Program1
    {
        static void Main(string[] args)
        {
            // ArrayList Example
            ArrayList list = new ArrayList();

            // Generic List Example
            List<string> l1 = new List<string>();

            // -------- TAKE INPUT FROM USER --------
            Console.Write("Enter Person Name: ");
            string personName = Console.ReadLine();

            Console.Write("Enter Age: ");
            int age = Convert.ToInt32(Console.ReadLine());

            Console.Write("Enter City Name: ");
            string cityName = Console.ReadLine();

            Console.Write("Enter City Population: ");
            int population = Convert.ToInt32(Console.ReadLine());

            // -------- CREATE OBJECTS --------
            City city = new City
            {
                Name = cityName,
                Population = population
            };

            Person person = new Person
            {
                Name = personName,
                Age = age,
                City = city
            };

            // File Paths
            string jsonPath = "PersonData.json";
            string xmlPath = "PersonData.xml";

            // -------- JSON SERIALIZATION --------
            string jsonData = JsonConvert.SerializeObject(person, Formatting.Indented);
            File.WriteAllText(jsonPath, jsonData);

            Console.WriteLine("\nJSON File Created Successfully.");

            // -------- JSON DESERIALIZATION --------
            string readJson = File.ReadAllText(jsonPath);
            Person jsonPerson = JsonConvert.DeserializeObject<Person>(readJson);

            Console.WriteLine("\nData Read From JSON:");
            Console.WriteLine(jsonPerson.ToString());

            // -------- XML SERIALIZATION --------
            XmlSerializer xmlSerializer = new XmlSerializer(typeof(Person));

            using (FileStream fs = new FileStream(xmlPath, FileMode.Create))
            {
                xmlSerializer.Serialize(fs, person);
            }

            Console.WriteLine("\nXML File Created Successfully.");

            // -------- XML DESERIALIZATION --------
            using (FileStream fs = new FileStream(xmlPath, FileMode.Open))
            {
                Person xmlPerson = (Person)xmlSerializer.Deserialize(fs);

                Console.WriteLine("\nData Read From XML:");
                Console.WriteLine(xmlPerson.ToString());
            }

            Console.ReadLine();
        }
    }
}