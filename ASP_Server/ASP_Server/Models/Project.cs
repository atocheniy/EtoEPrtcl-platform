using System.ComponentModel.DataAnnotations;
namespace ASP_Server.Models;

public enum ProjectPriority
{
    Low,
    Medium,
    High
}

public enum ProjectStatus
{
    Planning,
    Active,
    Hold,
    Completed
}

public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();
        
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public ICollection<File> Files { get; set; } = new List<File>();
    
    public bool IsPublic { get; set; } = false;
    
    public string? PublicEncryptedKey { get; set; } 
    public string? PublicKeyIv { get; set; }
    
    [Required]
    public ProjectPriority Priority { get; set; } = ProjectPriority.Low;
    
    [Required]
    public ProjectStatus Status { get; set; } = ProjectStatus.Active;
    
    public string? Iv { get; set; } 
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; } 
    
    public string UserId { get; set; }
    public ApplicationUser User { get; set; }
    
    public virtual ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
}