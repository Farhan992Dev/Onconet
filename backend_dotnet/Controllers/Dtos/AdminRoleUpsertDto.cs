namespace Onconet.Web.Controllers.Dtos;

public class AdminRoleUpsertDto
{
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public List<int> ActionIds { get; set; } = new();
}
