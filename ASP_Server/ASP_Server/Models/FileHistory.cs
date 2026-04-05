using System.ComponentModel.DataAnnotations;

namespace ASP_Server.Models;

public class FileHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FileId { get; set; }
    public File File { get; set; } = null!;

    [Required]
    public string Content { get; set; } = string.Empty;
    
    [Required]
    public string Iv { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
}