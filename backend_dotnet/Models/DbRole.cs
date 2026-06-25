using Microsoft.AspNetCore.Identity;

namespace Onconet.Web.Models;

public class DbRole : IdentityRole<int>
{
    public string DisplayName { get; set; } = string.Empty;
    public string UserType { get; set; } = "panel";
    public bool IsSystem { get; set; }
}
