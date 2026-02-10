using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASP_Server.Models;

public class File
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Name { get; set; } = "Untitled.md";

    public string Extension { get; set; } = ".md";
    
    public string? Content { get; set; } 
    
    public string? Iv { get; set; }
    
    public bool IsFolder { get; set; } = false;
    
    public Guid? ParentId { get; set; }
    
    public Guid ProjectId { get; set; }
    [ForeignKey("ProjectId")]
    public Project? Project { get; set; }
}