using System.ComponentModel.DataAnnotations;

namespace CleanApiProject.Models;

public class Item
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Item name is required")]
    [MaxLength(200, ErrorMessage = "Name cannot exceed 200 characters")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Price is required")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public decimal Price { get; set; }
}
