using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Onconet.Web.Models;
using Onconet.Web.Services;
using Onconet.Web.Controllers.Dtos;

namespace Onconet.Web.Controllers;

[ApiController]
[Route("api/admin/roles")]
[Authorize(Policy = "PanelUser")]
[EnableRateLimiting("Admin")]
public class AdminRolesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPanelAuthorizationService _authorizationService;
    private readonly RoleManager<DbRole> _roleManager;

    public AdminRolesController(
        ApplicationDbContext context,
        IPanelAuthorizationService authorizationService,
        RoleManager<DbRole> roleManager)
    {
        _context = context;
        _authorizationService = authorizationService;
        _roleManager = roleManager;
    }

    [HttpGet("actions")]
    public async Task<IActionResult> GetActions()
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.RolesManage))
        {
            return Forbid();
        }

        var actions = await _context.ActionPermissions
            .OrderBy(x => x.ActionKey)
            .Select(x => new { x.Id, x.ActionKey, x.Description })
            .ToListAsync();

        return Ok(actions);
    }

    [HttpGet]
    public async Task<IActionResult> GetRoles()
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.RolesManage))
        {
            return Forbid();
        }

        var roles = await _context.Roles
            .Where(x => x.UserType == "panel")
            .OrderBy(x => x.Name)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.DisplayName,
                x.IsSystem,
                ActionIds = _context.RoleActionPermissions.Where(rap => rap.RoleId == x.Id).Select(rap => rap.ActionPermissionId).ToList()
            })
            .ToListAsync();

        return Ok(roles);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRole([FromBody] AdminRoleUpsertDto dto)
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.RolesManage))
        {
            return Forbid();
        }

        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.DisplayName))
        {
            return BadRequest(new { Message = "نام نقش و عنوان نمایشی الزامی است." });
        }

        if (await _context.Roles.AnyAsync(x => x.Name == dto.Name))
        {
            return Conflict(new { Message = "نام نقش تکراری است." });
        }

        var role = new DbRole
        {
            Name = dto.Name.Trim().ToLowerInvariant(),
            NormalizedName = dto.Name.Trim().ToUpperInvariant(),
            DisplayName = dto.DisplayName,
            UserType = "panel",
            IsSystem = false
        };

        var createResult = await _roleManager.CreateAsync(role);
        if (!createResult.Succeeded)
        {
            return BadRequest(new { Message = string.Join(" | ", createResult.Errors.Select(e => e.Description)) });
        }

        await SyncRoleActions(role.Id, dto.ActionIds);

        return Ok(new { Success = true, Id = role.Id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] AdminRoleUpsertDto dto)
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.RolesManage))
        {
            return Forbid();
        }

        var role = await _context.Roles.FirstOrDefaultAsync(x => x.Id == id && x.UserType == "panel");
        if (role == null)
        {
            return NotFound(new { Message = "نقش یافت نشد." });
        }

        role.DisplayName = dto.DisplayName;
        if (!role.IsSystem)
        {
            role.Name = dto.Name.Trim().ToLowerInvariant();
            role.NormalizedName = dto.Name.Trim().ToUpperInvariant();
        }

        var updateResult = await _roleManager.UpdateAsync(role);
        if (!updateResult.Succeeded)
        {
            return BadRequest(new { Message = string.Join(" | ", updateResult.Errors.Select(e => e.Description)) });
        }

        await SyncRoleActions(role.Id, dto.ActionIds);

        return Ok(new { Success = true });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteRole(int id)
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.RolesManage))
        {
            return Forbid();
        }

        var role = await _context.Roles.FirstOrDefaultAsync(x => x.Id == id && x.UserType == "panel");
        if (role == null)
        {
            return NotFound(new { Message = "نقش یافت نشد." });
        }

        if (role.IsSystem)
        {
            return BadRequest(new { Message = "حذف نقش سیستمی مجاز نیست." });
        }

        var assignedUsers = await _context.UserRoles.AnyAsync(x => x.RoleId == role.Id);
        if (assignedUsers)
        {
            return BadRequest(new { Message = "این نقش به کاربر تخصیص داده شده و قابل حذف نیست." });
        }

        var roleActions = await _context.RoleActionPermissions.Where(x => x.RoleId == role.Id).ToListAsync();
        _context.RoleActionPermissions.RemoveRange(roleActions);

        var deleteResult = await _roleManager.DeleteAsync(role);
        if (!deleteResult.Succeeded)
        {
            return BadRequest(new { Message = string.Join(" | ", deleteResult.Errors.Select(e => e.Description)) });
        }

        await _context.SaveChangesAsync();

        return Ok(new { Success = true });
    }

    private async Task SyncRoleActions(int roleId, List<int> actionIds)
    {
        var roleActions = await _context.RoleActionPermissions.Where(x => x.RoleId == roleId).ToListAsync();
        _context.RoleActionPermissions.RemoveRange(roleActions);

        var distinctActionIds = actionIds?.Distinct().ToList() ?? new List<int>();
        foreach (var actionId in distinctActionIds)
        {
            _context.RoleActionPermissions.Add(new DbRoleActionPermission
            {
                RoleId = roleId,
                ActionPermissionId = actionId
            });
        }

        await _context.SaveChangesAsync();
    }
}
