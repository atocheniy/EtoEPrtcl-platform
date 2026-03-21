namespace ASP_Server.Models;

public class FileLink
{
    public Guid SourceFileId { get; set; }
    public virtual File SourceFile { get; set; } = null!;

    public Guid TargetFileId { get; set; }
    public virtual File TargetFile { get; set; } = null!;
}