namespace EmployeeConsoleApp.Config
{
   
    public static class AppConfig
    {
        private const string DefaultPath = "EmployeeData";
        private const string PathKey = "EmployeeDataPath";

  
        public static string GetEmployeeDataPath()
        {
            string? configuredPath = null;

            try
            {
           
                string configPath = Path.Combine(AppContext.BaseDirectory, "App.config");

                if (File.Exists(configPath))
                {
                    var lines = File.ReadAllLines(configPath);
                    foreach (var line in lines)
                    {
                        if (line.Contains(PathKey))
                        {
                         
                            int valueStart = line.IndexOf("value=\"", StringComparison.OrdinalIgnoreCase);
                            if (valueStart >= 0)
                            {
                                valueStart += 7; 
                                int valueEnd = line.IndexOf("\"", valueStart);
                                if (valueEnd > valueStart)
                                {
                                    configuredPath = line.Substring(valueStart, valueEnd - valueStart).Trim();
                                }
                            }
                            break;
                        }
                    }
                }
            }
            catch
            {
             
            }

            string finalPath = !string.IsNullOrWhiteSpace(configuredPath)
                ? configuredPath
                : Path.Combine(AppContext.BaseDirectory, DefaultPath);

         
            if (!Directory.Exists(finalPath))
            {
                Directory.CreateDirectory(finalPath);
            }

            return finalPath;
        }

     
        public static string GetEmployeeFilePath()
        {
            string folder = GetEmployeeDataPath();
            string fileName = $"EmployeeData_{DateTime.Today:dd-MM-yyyy}.json";
            return Path.Combine(folder, fileName);
        }
    }
}