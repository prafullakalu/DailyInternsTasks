using Microsoft.Azure.Functions.Worker;

namespace AzureTask1
{
    public class CsvBlobProcessor
    {
        [Function("CsvBlobProcessor")]
        [ServiceBusOutput("orders-queue", Connection = "ServiceBusConnection")]
        public static async Task<string[]> Run(
            [BlobTrigger("orders-upload/{name}", Connection = "AzureWebJobsStorage")] Stream blob,
            string name)
        {
            using var reader = new StreamReader(blob);
            var orders = new List<string>();

            while (!reader.EndOfStream)
            {
                var line = await reader.ReadLineAsync();
                if (!string.IsNullOrWhiteSpace(line))
                {
                    orders.Add(line);
                }
            }
            return orders.ToArray(); // Each string in the array is sent as a separate message
        }
    }
}