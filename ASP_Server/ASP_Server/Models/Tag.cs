using System.ComponentModel.DataAnnotations;

namespace ASP_Server.Models;

public class Tag
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string Index { get; set; } = string.Empty; 
    
    [Required]
    public string EncryptedName { get; set; } = string.Empty;
    [Required]
    public string Iv { get; set; } = string.Empty;

    public ICollection<File> Files { get; set; } = new List<File>();
}