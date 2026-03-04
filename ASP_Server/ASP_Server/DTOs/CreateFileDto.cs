namespace ASP_Server.DTOs;

public class CreateFileDto
{
    public string Name { get; set; } = string.Empty;
    public string? Content { get; set; }
    public Guid ProjectId { get; set; }
    public string Iv { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    
    public bool IsFolder { get; set; }
}