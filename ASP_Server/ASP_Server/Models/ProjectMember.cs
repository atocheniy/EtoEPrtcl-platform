using System.ComponentModel.DataAnnotations;

namespace ASP_Server.Models;

public class ProjectMember
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    
    [Required]
    public string EncryptedProjectKey { get; set; } = string.Empty;
    
    public string Role { get; set; } = "Viewer";
    [Required]
    public string Iv { get; set; } = string.Empty; 

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}