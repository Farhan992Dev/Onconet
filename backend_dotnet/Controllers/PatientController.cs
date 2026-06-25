using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Onconet.Web.Models;
using Onconet.Web.Services;
using Onconet.Web.Controllers.Dtos;

namespace Onconet.Web.Controllers;

[ApiController]
[Route("api/user")]
[Authorize(Policy = "SiteUser")]
[EnableRateLimiting("User")]
public class PatientController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPanelAuthorizationService _authorizationService;

    public PatientController(ApplicationDbContext context, IPanelAuthorizationService authorizationService)
    {
        _context = context;
        _authorizationService = authorizationService;
    }

    private string GetUserMobile()
    {
        var mobileClaim = User.FindFirst(ClaimTypes.MobilePhone)?.Value
                          ?? User.FindFirst("mobile")?.Value;

        if (!string.IsNullOrEmpty(mobileClaim))
        {
            return mobileClaim;
        }

        throw new UnauthorizedAccessException("کاربر گرامی، شناسه کاربری شما احراز نگردیده است.");
    }

    [HttpGet("profile")]
    public async Task<ActionResult<UserProfileResponse>> GetProfile()
    {
        if (!await _authorizationService.IsSiteUserAsync(User))
        {
            return Forbid("این توکن مربوط به کاربر سایت نیست.");
        }

        try
        {
            var mobile = GetUserMobile();
            var profile = await _context.PatientProfiles.FirstOrDefaultAsync(p => p.Mobile == mobile);
            if (profile == null)
            {
                profile = new DbUserProfile
                {
                    Mobile = mobile,
                    FullName = "کاربر همراه صورتی",
                    BirthYear = "1370",
                    LastPeriodDate = "1405/02/10",
                    HasRiskFactors = false,
                    FamilyHistory = "هیچکدام",
                    SelfCheckReminderActive = true,
                    ReminderDayOfMonth = 15
                };
                _context.PatientProfiles.Add(profile);
                await _context.SaveChangesAsync();
            }
            return MapToProfileResponse(profile);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Message = ex.Message });
        }
    }

    [HttpPost("profile")]
    public async Task<ActionResult<UserProfileResponse>> SaveProfile([FromBody] UserProfileDto dto)
    {
        if (!await _authorizationService.IsSiteUserAsync(User))
        {
            return Forbid("این توکن مربوط به کاربر سایت نیست.");
        }

        try
        {
            var mobile = GetUserMobile();
            if (dto == null)
            {
                return BadRequest(new { Message = "داده‌های ارسالی معتبر نیستند." });
            }

            var existing = await _context.PatientProfiles.FirstOrDefaultAsync(p => p.Mobile == mobile);
            if (existing != null)
            {
                existing.FullName = dto.FullName ?? "کاربر همراه صورتی";
                existing.BirthYear = dto.BirthYear ?? "1370";
                existing.LastPeriodDate = dto.LastPeriodDate ?? "1405/02/10";
                existing.HasRiskFactors = dto.HasRiskFactors;
                existing.FamilyHistory = dto.FamilyHistory ?? "هیچکدام";
                existing.SelfCheckReminderActive = dto.SelfCheckReminderActive;
                existing.ReminderDayOfMonth = dto.ReminderDayOfMonth;
                _context.Entry(existing).State = EntityState.Modified;
            }
            else
            {
                _context.PatientProfiles.Add(new DbUserProfile
                {
                    Mobile = mobile,
                    FullName = dto.FullName ?? "کاربر همراه صورتی",
                    BirthYear = dto.BirthYear ?? "1370",
                    LastPeriodDate = dto.LastPeriodDate ?? "1405/02/10",
                    HasRiskFactors = dto.HasRiskFactors,
                    FamilyHistory = dto.FamilyHistory ?? "هیچکدام",
                    SelfCheckReminderActive = dto.SelfCheckReminderActive,
                    ReminderDayOfMonth = dto.ReminderDayOfMonth
                });
            }

            await _context.SaveChangesAsync();
            var profile = await _context.PatientProfiles.FirstOrDefaultAsync(p => p.Mobile == mobile);
            return Ok(new { Success = true, Profile = MapToProfileResponse(profile!) });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Message = ex.Message });
        }
    }

    [HttpGet("logs")]
    public async Task<ActionResult<IEnumerable<PatientLogResponse>>> GetLogs()
    {
        if (!await _authorizationService.IsSiteUserAsync(User))
        {
            return Forbid("این توکن مربوط به کاربر سایت نیست.");
        }

        try
        {
            var mobile = GetUserMobile();
            var logs = await _context.PatientLogs
                .Where(l => l.Mobile == mobile)
                .OrderByDescending(l => l.Id)
                .ToListAsync();

            return logs.Select(MapToLogResponse).ToList();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Message = ex.Message });
        }
    }

    [HttpPost("logs")]
    public async Task<ActionResult<PatientLogResponse>> AddLog([FromBody] PatientLogDto dto)
    {
        if (!await _authorizationService.IsSiteUserAsync(User))
        {
            return Forbid("این توکن مربوط به کاربر سایت نیست.");
        }

        try
        {
            var mobile = GetUserMobile();
            if (dto == null)
            {
                return BadRequest(new { Message = "لاگ ارسالی معتبر نیست." });
            }

            var log = new DbPatientLog
            {
                Mobile = mobile,
                Date = dto.Date ?? $"1405/03/{DateTime.Now.Day}",
                Status = dto.Status,
                Notes = dto.Notes,
                SymptomsJson = dto.SymptomsJson
            };

            _context.PatientLogs.Add(log);
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Log = MapToLogResponse(log) });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Message = ex.Message });
        }
    }

    private static UserProfileResponse MapToProfileResponse(DbUserProfile p)
    {
        return new UserProfileResponse
        {
            FullName = p.FullName,
            Mobile = p.Mobile,
            BirthYear = p.BirthYear,
            LastPeriodDate = p.LastPeriodDate,
            HasRiskFactors = p.HasRiskFactors,
            FamilyHistory = p.FamilyHistory,
            SelfCheckReminderActive = p.SelfCheckReminderActive,
            ReminderDayOfMonth = p.ReminderDayOfMonth
        };
    }

    private static PatientLogResponse MapToLogResponse(DbPatientLog l)
    {
        List<string> symptoms;
        try
        {
            symptoms = JsonSerializer.Deserialize<List<string>>(l.SymptomsJson) ?? new List<string>();
        }
        catch
        {
            symptoms = new List<string>();
        }

        return new PatientLogResponse
        {
            Id = l.Id,
            Date = l.Date,
            Status = l.Status,
            Notes = l.Notes,
            Symptoms = symptoms
        };
    }
}
