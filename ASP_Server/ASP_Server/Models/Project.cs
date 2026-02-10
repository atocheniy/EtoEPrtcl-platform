using System.ComponentModel.DataAnnotations;
namespace ASP_Server.Models;

public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();
        
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public ICollection<File> Files { get; set; } = new List<File>();
        
    public string? Iv { get; set; } 
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public string UserId { get; set; }
    public ApplicationUser User { get; set; }
}