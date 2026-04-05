using ASP_Server.Models;

namespace ASP_Server.DTOs;

public class UpdateProjectDto
{
    public string Name { get; set; } = string.Empty;
    public bool IsPublic { get; set; } = false;
    public ProjectPriority Priority { get; set; } = ProjectPriority.Low;
    public ProjectStatus Status { get; set; } = ProjectStatus.Active;
    public string Iv { get; set; } = string.Empty;
    
    public string? PublicEncryptedKey { get; set; } 
    public string? PublicKeyIv { get; set; }
}
