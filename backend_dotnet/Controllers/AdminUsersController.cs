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
[Route("api/admin/users")]
[Authorize(Policy = "PanelUser")]
[EnableRateLimiting("Admin")]
public class AdminUsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<DbUser> _userManager;
    private readonly RoleManager<DbRole> _roleManager;
    private readonly IPanelAuthorizationService _authorizationService;

    public AdminUsersController(
        ApplicationDbContext context,
        UserManager<DbUser> userManager,
        RoleManager<DbRole> roleManager,
        IPanelAuthorizationService authorizationService)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _authorizationService = authorizationService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetUsers()
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.UsersManage))
        {
            return Forbid();
        }

        var users = await _context.Users
            .Where(x => x.UserType == "panel")
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                Mobile = x.PhoneNumber,
                x.FullName,
                x.Role,
                x.UserType,
                x.Specialization,
                x.CreatedAt,
                RoleIds = _context.UserRoles.Where(ur => ur.UserId == x.Id).Select(ur => ur.RoleId).ToList()
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] AdminUserUpsertDto dto)
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.UsersManage))
        {
            return Forbid();
        }

        if (string.IsNullOrWhiteSpace(dto.Mobile) || string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Role) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { Message = "اطلاعات کاربر کامل نیست." });
        }

        if (dto.RoleIds == null || dto.RoleIds.Count == 0)
        {
            return BadRequest(new { Message = "حداقل یک نقش باید به کاربر تخصیص داده شود." });
        }

        var validRolesCount = await _context.Roles.CountAsync(r => dto.RoleIds.Contains(r.Id) && r.UserType == "panel");
        if (validRolesCount != dto.RoleIds.Count)
        {
            return BadRequest(new { Message = "نقش انتخاب شده معتبر نیست." });
        }

        var exists = await _context.Users.AnyAsync(x => x.PhoneNumber == dto.Mobile);
        if (exists)
        {
            return Conflict(new { Message = "کاربر با این شماره موبایل قبلا ثبت شده است." });
        }

        var user = new DbUser
        {
            UserName = dto.Mobile,
            PhoneNumber = dto.Mobile,
            PhoneNumberConfirmed = true,
            FullName = dto.FullName,
            Role = dto.Role,
            UserType = "panel",
            Specialization = dto.Specialization
        };

        var createResult = await _userManager.CreateAsync(user, dto.Password!);
        if (!createResult.Succeeded)
        {
            return BadRequest(new { Message = string.Join(" | ", createResult.Errors.Select(e => e.Description)) });
        }

        var roleNames = await _context.Roles.Where(r => dto.RoleIds.Contains(r.Id)).Select(r => r.Name!).ToListAsync();
        var addRoleResult = await _userManager.AddToRolesAsync(user, roleNames);
        if (!addRoleResult.Succeeded)
        {
            return BadRequest(new { Message = string.Join(" | ", addRoleResult.Errors.Select(e => e.Description)) });
        }

        return Ok(new { Success = true, Id = user.Id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] AdminUserUpsertDto dto)
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.UsersManage))
        {
            return Forbid();
        }

        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { Message = "کاربر یافت نشد." });
        }

        if (!string.Equals(user.UserType, "panel", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { Message = "ویرایش کاربر سایت از این پنل مجاز نیست." });
        }

        if (dto.RoleIds == null || dto.RoleIds.Count == 0)
        {
            return BadRequest(new { Message = "حداقل یک نقش باید به کاربر تخصیص داده شود." });
        }

        var validRolesCount = await _context.Roles.CountAsync(r => dto.RoleIds.Contains(r.Id) && r.UserType == "panel");
        if (validRolesCount != dto.RoleIds.Count)
        {
            return BadRequest(new { Message = "نقش انتخاب شده معتبر نیست." });
        }

        user.FullName = dto.FullName;
        user.Role = dto.Role;
        user.Specialization = dto.Specialization;
        user.UserType = "panel";

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            var removePasswordResult = await _userManager.RemovePasswordAsync(user);
            if (!removePasswordResult.Succeeded)
            {
                return BadRequest(new { Message = string.Join(" | ", removePasswordResult.Errors.Select(e => e.Description)) });
            }

            var addPasswordResult = await _userManager.AddPasswordAsync(user, dto.Password);
            if (!addPasswordResult.Succeeded)
            {
                return BadRequest(new { Message = string.Join(" | ", addPasswordResult.Errors.Select(e => e.Description)) });
            }
        }

        var existingRoleNames = await _userManager.GetRolesAsync(user);
        if (existingRoleNames.Any())
        {
            await _userManager.RemoveFromRolesAsync(user, existingRoleNames);
        }

        var newRoleNames = await _context.Roles.Where(r => dto.RoleIds.Contains(r.Id)).Select(r => r.Name!).ToListAsync();
        await _userManager.AddToRolesAsync(user, newRoleNames);

        await _userManager.UpdateAsync(user);

        return Ok(new { Success = true });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.UsersManage))
        {
            return Forbid();
        }

        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { Message = "کاربر یافت نشد." });
        }

        if (user.Role == "super_admin")
        {
            var superAdminRole = await _roleManager.FindByNameAsync("super_admin");
            var superAdminCount = superAdminRole == null
                ? 0
                : await _context.UserRoles.CountAsync(ur => ur.RoleId == superAdminRole.Id);
            if (superAdminCount <= 1)
            {
                return BadRequest(new { Message = "حذف آخرین مدیر ارشد مجاز نیست." });
            }
        }

        var deleteResult = await _userManager.DeleteAsync(user);
        if (!deleteResult.Succeeded)
        {
            return BadRequest(new { Message = string.Join(" | ", deleteResult.Errors.Select(e => e.Description)) });
        }

        return Ok(new { Success = true });
    }
}
