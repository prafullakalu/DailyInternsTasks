using Microsoft.Azure.Functions.Worker;

namespace AzureTask1
{
    public class DailySummaryTimer
    {
        [Function("DailySummaryTimer")]
        // This output binding will overwrite the file in the 'reports' container every minute
        [BlobOutput("reports/daily-report.csv", Connection = "AzureWebJobsStorage")]
        public static string Run([TimerTrigger("0 * * * * *")] TimerInfo timer)
        {
            // For your demo: Generating a timestamp so you can see the file updating
            string timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            string reportContent = $"ReportGeneratedAt,TotalOrders,Revenue\n{timestamp},10,5000";

            return reportContent;
        }
    }
}