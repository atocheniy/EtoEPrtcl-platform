namespace ASP_Server.DTOs;

public class UpdateFileDto
{
    public string? Name { get; set; }
    public string? Content { get; set; }
    public string? Extension { get; set; }
    public string? Iv { get; set; }
    public Guid? ParentId { get; set; }
}