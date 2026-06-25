using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Onconet.Web.Models;
using Onconet.Web.Services;
using Onconet.Web.Controllers.Dtos;
using System.Security.Claims;

namespace Onconet.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPanelAuthorizationService _authorizationService;
    private readonly IAiSeoService _aiSeoService;

    public ArticlesController(ApplicationDbContext context, IPanelAuthorizationService authorizationService, IAiSeoService aiSeoService)
    {
        _context = context;
        _authorizationService = authorizationService;
        _aiSeoService = aiSeoService;
    }

    #region Helpers

    private int GetCurrentUserId()
    {
        var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)!.Value;
        return int.Parse(claim);
    }

    private async Task<bool> IsSuperAdminAsync()
    {
        var user = await _context.Users.FindAsync(GetCurrentUserId());
        return user?.Role == "super_admin";
    }

    private static ArticleResponse MapToArticleResponse(DbArticle a)
    {
        return new ArticleResponse
        {
            Id = a.Id,
            Title = a.Title,
            Slug = a.Slug,
            Content = a.Content,
            Summary = a.Summary,
            Category = a.Category,
            CoverImage = a.CoverImage,
            Author = a.Author?.FullName ?? "",
            PublishDate = a.PublishDate,
            IsPublished = a.IsPublished,
            ReadingTime = a.ReadingTime,
            ViewCount = a.ViewCount,
            SeoTitle = a.SeoTitle,
            SeoDescription = a.SeoDescription,
            SeoKeywords = a.SeoKeywords,
            OgImage = a.OgImage
        };
    }

    private bool ArticleExists(int id)
    {
        return _context.Articles.Any(e => e.Id == id);
    }

    #endregion

    #region Site APIs

    [HttpGet]
    [EnableRateLimiting("Public")]
    public async Task<ActionResult<IEnumerable<ArticleResponse>>> GetSiteArticles()
    {
        var articles = await _context.Articles
            .Include(x => x.Author)
            .Where(x => x.IsPublished)
            .Take(20)
            .OrderByDescending(c => c.PublishDate)
            .ToListAsync();

        return articles.Select(a => MapToArticleResponse(a)).ToList();
    }

    [HttpGet("{id}")]
    [EnableRateLimiting("Public")]
    public async Task<ActionResult<ArticleResponse>> GetArticle(int id)
    {
        var article = await _context.Articles
            .Include(x => x.Author)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (article == null)
        {
            return NotFound(new { Message = "مقاله مورد نظر یافت نشد." });
        }

        article.ViewCount++;
        await _context.SaveChangesAsync();

        return MapToArticleResponse(article);
    }

    #endregion

    #region Panel APIs

    [HttpGet("panel")]
    [Authorize(Policy = "PanelUser")]
    [EnableRateLimiting("Admin")]
    public async Task<ActionResult<IEnumerable<ArticleResponse>>> GetPanelArticles()
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.ArticlesRead))
        {
            return Forbid();
        }

        var isSuperAdmin = await IsSuperAdminAsync();
        var currentUserId = GetCurrentUserId();

        var articles = await _context.Articles
            .Include(x => x.Author)
            .Where(x => isSuperAdmin || x.AuthorId == currentUserId)
            .OrderByDescending(c => c.PublishDate)
            .ToListAsync();

        return articles.Select(a => MapToArticleResponse(a)).ToList();
    }

    [HttpGet("panel/{id}")]
    [Authorize(Policy = "PanelUser")]
    [EnableRateLimiting("Admin")]
    public async Task<ActionResult<ArticleResponse>> GetPanelArticle(int id)
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.ArticlesRead))
        {
            return Forbid();
        }

        var article = await _context.Articles
            .Include(x => x.Author)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (article == null)
        {
            return NotFound(new { Message = "مقاله مورد نظر یافت نشد." });
        }

        if (!await IsSuperAdminAsync() && article.AuthorId != GetCurrentUserId())
        {
            return Forbid();
        }

        return MapToArticleResponse(article);
    }

    [HttpPost]
    [Authorize(Policy = "PanelUser")]
    [EnableRateLimiting("Admin")]
    public async Task<ActionResult<ArticleResponse>> CreateArticle([FromBody] ArticleCreateDto dto)
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.ArticlesWrite))
        {
            return Forbid();
        }

        if (dto == null)
        {
            return BadRequest(new { Message = "داده‌های ورودی نامعتبر می‌باشند." });
        }

        var article = new DbArticle
        {
            Title = dto.Title,
            Slug = dto.Slug,
            Content = dto.Content,
            Summary = dto.Summary,
            Category = dto.Category,
            CoverImage = dto.CoverImage,
            AuthorId = GetCurrentUserId(),
            PublishDate = dto.PublishDate ?? DateTime.Now.ToString("yyyy/MM/dd"),
            IsPublished = dto.IsPublished,
            ReadingTime = dto.ReadingTime,
            SeoTitle = dto.SeoTitle,
            SeoDescription = dto.SeoDescription,
            SeoKeywords = dto.SeoKeywords,
            OgImage = dto.OgImage
        };

        _context.Articles.Add(article);
        await _context.SaveChangesAsync();

        await _context.Entry(article).Reference(x => x.Author).LoadAsync();
        return CreatedAtAction(nameof(GetPanelArticle), new { id = article.Id }, MapToArticleResponse(article));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "PanelUser")]
    [EnableRateLimiting("Admin")]
    public async Task<ActionResult<ArticleResponse>> UpdateArticle(int id, [FromBody] ArticleUpdateDto dto)
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.ArticlesWrite))
        {
            return Forbid();
        }

        if (dto == null)
        {
            return BadRequest(new { Message = "داده‌های ورودی نامعتبر می‌باشند." });
        }

        var existingArticle = await _context.Articles.FirstOrDefaultAsync(x => x.Id == id);
        if (existingArticle == null)
        {
            return NotFound(new { Message = "مقاله مورد نظر پیدا نشد." });
        }

        if (!await IsSuperAdminAsync() && existingArticle.AuthorId != GetCurrentUserId())
        {
            return Forbid();
        }

        existingArticle.Title = dto.Title;
        existingArticle.Slug = dto.Slug;
        existingArticle.Content = dto.Content;
        existingArticle.Summary = dto.Summary;
        existingArticle.Category = dto.Category;
        existingArticle.CoverImage = dto.CoverImage;
        existingArticle.PublishDate = dto.PublishDate ?? existingArticle.PublishDate;
        existingArticle.IsPublished = dto.IsPublished;
        existingArticle.ReadingTime = dto.ReadingTime;
        existingArticle.SeoTitle = dto.SeoTitle;
        existingArticle.SeoDescription = dto.SeoDescription;
        existingArticle.SeoKeywords = dto.SeoKeywords;
        existingArticle.OgImage = dto.OgImage;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ArticleExists(id))
            {
                return NotFound(new { Message = "مقاله مورد نظر پیدا نشد." });
            }
            throw;
        }

        await _context.Entry(existingArticle).Reference(x => x.Author).LoadAsync();
        return Ok(MapToArticleResponse(existingArticle));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "PanelUser")]
    [EnableRateLimiting("Sensitive")]
    public async Task<IActionResult> DeleteArticle(int id)
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.ArticlesDelete))
        {
            return Forbid();
        }

        var article = await _context.Articles.FindAsync(id);
        if (article == null)
        {
            return NotFound(new { Message = "مقاله یافت نشد." });
        }

        if (!await IsSuperAdminAsync() && article.AuthorId != GetCurrentUserId())
        {
            return Forbid();
        }

        _context.Articles.Remove(article);
        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = "مقاله با موفقیت حذف گردید." });
    }

    [HttpPost("generate-seo")]
    [Authorize(Policy = "PanelUser")]
    [EnableRateLimiting("Admin")]
    public async Task<ActionResult<SeoMetadata>> GenerateSeo([FromBody] GenerateSeoRequest request)
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.ArticlesWrite))
        {
            return Forbid();
        }

        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new { Message = "محتوای مقاله نمی‌تواند خالی باشد." });
        }

        var metadata = await _aiSeoService.GenerateSeoMetadataAsync(
            request.Title,
            request.Content,
            request.Summary,
            request.Category
        );

        return Ok(metadata);
    }

    #endregion
}
