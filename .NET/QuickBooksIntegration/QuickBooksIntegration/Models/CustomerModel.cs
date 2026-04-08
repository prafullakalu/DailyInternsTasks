using System.ComponentModel.DataAnnotations;

namespace QuickBooksIntegration.Models;

public class customerModel
{
    [Required]
    [MaxLength(200, ErrorMessage = "Max 200 chars. allowed")]
    public string displayName { get; set; }
}