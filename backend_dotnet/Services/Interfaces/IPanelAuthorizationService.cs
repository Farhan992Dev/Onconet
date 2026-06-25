using System.Security.Claims;
using Onconet.Web.Models;

namespace Onconet.Web.Services;

public interface IPanelAuthorizationService
{
    Task<bool> IsSiteUserAsync(ClaimsPrincipal principal);
    Task<bool> IsPanelUserAsync(ClaimsPrincipal principal);
    Task<bool> HasActionAsync(ClaimsPrincipal principal, string actionKey);
    Task<DbUser?> GetCurrentUserAsync(ClaimsPrincipal principal);
}
