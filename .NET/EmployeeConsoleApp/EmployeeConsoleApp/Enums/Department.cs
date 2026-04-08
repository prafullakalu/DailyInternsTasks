namespace EmployeeConsoleApp.Enums
{
  
    public enum Department
    {
        Sales = 1,       
        Marketing = 2,  
        Development = 3, 
        QA = 4,          
        HR = 5,          
        SEO = 6          
    }


    public static class DepartmentColors
    {
        private static readonly Dictionary<Department, string> Colors = new()
        {
            { Department.Sales,       "Red"    },
            { Department.Marketing,   "Red"  },
            { Department.Development, "Black"  },
            { Department.QA,          "Blue"   },
            { Department.HR,          "Orange" },
            { Department.SEO,         "Pink"   }
        };

        public static string GetColor(Department department)
        {
            return Colors.TryGetValue(department, out var color) ? color : "Black";
        }
    }
}