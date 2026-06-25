namespace Onconet.Web.Models;

public class DbActionPermission
{
    public int Id { get; set; }
    public string ActionKey { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
