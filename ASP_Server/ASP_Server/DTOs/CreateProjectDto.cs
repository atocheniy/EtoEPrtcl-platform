using System.ComponentModel.DataAnnotations;
using ASP_Server.Models;

namespace ASP_Server.DTOs;

public class CreateProjectDto
{
    [Required(ErrorMessage = "Название проекта обязательно")]
    [MinLength(1, ErrorMessage = "Название не может быть пустым")]
    public string Name { get; set; } = string.Empty;
    
    public string Iv { get; set; } = string.Empty;
    
    public bool IsPublic { get; set; } = false;
    
    [Required]
    public ProjectPriority Priority { get; set; } = ProjectPriority.Low;
    
    [Required]
    public ProjectStatus Status { get; set; } = ProjectStatus.Active;
}