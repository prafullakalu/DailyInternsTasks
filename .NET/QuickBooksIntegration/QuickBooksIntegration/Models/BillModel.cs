namespace QuickBooksIntegration.Models;

public class billModel
{
    public string id { get; set; }
    public string syncToken { get; set; }
    public string vendorId { get; set; }
    public string itemId { get; set; }
    public decimal amount { get; set; }
}