namespace Onconet.Web.Controllers.Dtos;

public class AdminUserUpsertDto
{
    public string Mobile { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "editor";
    public string? Specialization { get; set; }
    public string? Password { get; set; }
    public List<int> RoleIds { get; set; } = new();
}
