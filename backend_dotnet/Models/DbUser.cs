using Microsoft.AspNetCore.Identity;

namespace Onconet.Web.Models;

public class DbUser : IdentityUser<int>
{
    public string FullName { get; set; } = "پزشک کادر درمان";
    public string Role { get; set; } = "site_user";
    public string UserType { get; set; } = "site";
    public string? Specialization { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
