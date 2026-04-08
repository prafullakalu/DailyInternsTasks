using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;

namespace AzureTask1
{
    public class OrderHttpReceiver
    {
        [Function("OrderHttpReceiver")]
        // The return value of this method goes directly to the Service Bus Queue
        [ServiceBusOutput("orders-queue", Connection = "ServiceBusConnection")]
        public static async Task<string> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "order")] HttpRequestData req)
        {
            var body = await new StreamReader(req.Body).ReadToEndAsync();
            return string.IsNullOrEmpty(body) ? null : body;
        }
    }
}