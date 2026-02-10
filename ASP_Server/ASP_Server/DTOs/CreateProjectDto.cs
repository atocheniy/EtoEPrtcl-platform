using System.ComponentModel.DataAnnotations;

namespace ASP_Server.DTOs;

public class CreateProjectDto
{
    [Required(ErrorMessage = "Название проекта обязательно")]
    [MinLength(1, ErrorMessage = "Название не может быть пустым")]
    public string Name { get; set; } = string.Empty;
    
    public string Iv { get; set; } = string.Empty;
}