using System.IO;
using System.Xml.Serialization;

namespace Day_4_Task2.Services
{
    public static class XmlHelper
    {
        public static void SerializeToXml<T>(string path, T data)
        {
            XmlSerializer serializer = new XmlSerializer(typeof(T));

            using (StreamWriter writer = new StreamWriter(path))
            {
                serializer.Serialize(writer, data);
            }
        }

        public static T DeserializeFromXml<T>(string path)
        {
            if (!File.Exists(path))
                throw new FileNotFoundException("Account file not found");

            XmlSerializer serializer = new XmlSerializer(typeof(T));

            using (StreamReader reader = new StreamReader(path))
            {
                return (T)serializer.Deserialize(reader);
            }
        }
    }
}