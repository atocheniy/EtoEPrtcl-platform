namespace ASP_Server.DTOs;

public class TagDto
{
    public string Index { get; set; } = string.Empty;
    public string EncryptedName { get; set; } = string.Empty;
    public string Iv { get; set; } = string.Empty;
}