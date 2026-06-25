using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Onconet.Web.Models;
using Onconet.Web.Services;
using Onconet.Web.Controllers.Dtos;

namespace Onconet.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeoController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPanelAuthorizationService _authorizationService;

    public SeoController(ApplicationDbContext context, IPanelAuthorizationService authorizationService)
    {
        _context = context;
        _authorizationService = authorizationService;
    }

    [HttpGet]
    [EnableRateLimiting("Public")]
    public async Task<ActionResult<IEnumerable<SeoResponse>>> GetSeoSettings()
    {
        var seos = await _context.SeoSettings.ToListAsync();
        return seos.Select(s => MapToSeoResponse(s)).ToList();
    }

    [HttpPost]
    [Authorize(Policy = "PanelUser")]
    [EnableRateLimiting("Admin")]
    public async Task<IActionResult> UpdateSeo([FromBody] List<SeoUpdateDto> updatedSeoSettings)
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.SeoManage))
        {
            return Forbid();
        }

        if (updatedSeoSettings == null)
        {
            return BadRequest(new { Message = "ساختار تنظیمات سئو ارسال شده معتبر نیست." });
        }

        foreach (var item in updatedSeoSettings)
        {
            var existing = await _context.SeoSettings.FirstOrDefaultAsync(s => s.PageId == item.PageId);
            if (existing != null)
            {
                existing.MetaTitle = item.MetaTitle;
                existing.MetaDescription = item.MetaDescription;
                existing.FocusKeywords = item.FocusKeywords;
                existing.CanonicalUrl = item.CanonicalUrl;
                existing.OgTitle = item.OgTitle;
                existing.OgDescription = item.OgDescription ?? existing.OgDescription;
                existing.SiteMapPriority = item.SiteMapPriority;
                _context.Entry(existing).State = EntityState.Modified;
            }
            else
            {
                _context.SeoSettings.Add(new DbPageSEO
                {
                    PageId = item.PageId,
                    PageName = item.PageName ?? item.PageId,
                    MetaTitle = item.MetaTitle,
                    MetaDescription = item.MetaDescription,
                    FocusKeywords = item.FocusKeywords,
                    CanonicalUrl = item.CanonicalUrl,
                    OgTitle = item.OgTitle,
                    OgDescription = item.OgDescription ?? string.Empty,
                    SiteMapPriority = item.SiteMapPriority
                });
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { Success = true, Message = "سئو صفحات با موفقیت هماهنگ و در دیتابیس دات‌نت ذخیره گردید." });
    }

    private static SeoResponse MapToSeoResponse(DbPageSEO s)
    {
        return new SeoResponse
        {
            Id = s.Id,
            PageId = s.PageId,
            PageName = s.PageName,
            MetaTitle = s.MetaTitle,
            MetaDescription = s.MetaDescription,
            FocusKeywords = s.FocusKeywords,
            CanonicalUrl = s.CanonicalUrl,
            OgTitle = s.OgTitle,
            OgDescription = s.OgDescription,
            SiteMapPriority = s.SiteMapPriority
        };
    }
}
