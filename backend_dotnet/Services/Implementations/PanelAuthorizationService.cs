using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Onconet.Web.Models;

namespace Onconet.Web.Services;

public class PanelAuthorizationService : IPanelAuthorizationService
{
    private readonly ApplicationDbContext _context;

    public PanelAuthorizationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public Task<bool> IsSiteUserAsync(ClaimsPrincipal principal)
    {
        return Task.FromResult(string.Equals(principal.FindFirst("user_type")?.Value, "site", StringComparison.OrdinalIgnoreCase));
    }

    public Task<bool> IsPanelUserAsync(ClaimsPrincipal principal)
    {
        return Task.FromResult(string.Equals(principal.FindFirst("user_type")?.Value, "panel", StringComparison.OrdinalIgnoreCase));
    }

    public async Task<DbUser?> GetCurrentUserAsync(ClaimsPrincipal principal)
    {
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return null;
        }

        return await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);
    }

    public async Task<bool> HasActionAsync(ClaimsPrincipal principal, string actionKey)
    {
        if (!await IsPanelUserAsync(principal))
        {
            return false;
        }

        var user = await GetCurrentUserAsync(principal);
        if (user == null)
        {
            return false;
        }

        var allowedActions = await _context.UserRoles
            .Where(ur => ur.UserId == user.Id)
            .Join(_context.RoleActionPermissions, ur => ur.RoleId, rap => rap.RoleId, (ur, rap) => rap)
            .Join(_context.ActionPermissions, rap => rap.ActionPermissionId, ap => ap.Id, (rap, ap) => ap.ActionKey)
            .Distinct()
            .ToListAsync();

        return allowedActions.Contains(PanelActionKeys.All) || allowedActions.Contains(actionKey);
    }
}
