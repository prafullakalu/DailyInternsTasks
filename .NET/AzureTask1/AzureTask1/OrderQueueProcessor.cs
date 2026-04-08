using Microsoft.Azure.Functions.Worker;
using System.Text.Json;

namespace AzureTask1
{
    public class OrderQueueProcessor
    {
        [Function("OrderQueueProcessor")]
        public static void Run(
            [ServiceBusTrigger("orders-queue", Connection = "ServiceBusConnection")] string message)
        {
            var order = JsonSerializer.Deserialize<Order>(message);
            if (order != null)
            {
                // Logic to save to DB goes here
                Console.WriteLine($"Processed Order ID: {order.OrderId}");
            }
        }
    }

    public class Order
    {
        public string OrderId { get; set; }
        public double Amount { get; set; }
    }
}