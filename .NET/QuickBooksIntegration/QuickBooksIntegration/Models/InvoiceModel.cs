namespace QuickBooksIntegration.Models;

public class invoiceModel
{
    public string id { get; set; }
    public string syncToken { get; set; }
    public string customerId { get; set; }
    public string itemId { get; set; }
    public decimal amount { get; set; }
}