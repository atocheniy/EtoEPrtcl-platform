namespace ASP_Server.DTOs;

public class AddMemberDto {
    public string UserEmail { get; set; }
    public string EncryptedProjectKey { get; set; }
    public string Iv { get; set; }
    public string Role { get; set; } = "Viewer";
}