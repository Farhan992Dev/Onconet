namespace Onconet.Web.Controllers.Dtos;

public class ArticleResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = null!;
    public string? Summary { get; set; }
    public string Category { get; set; } = "عمومی";
    public string CoverImage { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string PublishDate { get; set; } = null!;
    public bool IsPublished { get; set; } = true;
    public int ReadingTime { get; set; } = 3;
    public int ViewCount { get; set; } = 0;
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public string? SeoKeywords { get; set; }
    public string? OgImage { get; set; }
}
