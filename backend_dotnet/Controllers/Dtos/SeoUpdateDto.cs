namespace Onconet.Web.Controllers.Dtos;

public class SeoUpdateDto
{
    public string PageId { get; set; } = null!;
    public string? PageName { get; set; }
    public string MetaTitle { get; set; } = null!;
    public string MetaDescription { get; set; } = null!;
    public string FocusKeywords { get; set; } = null!;
    public string CanonicalUrl { get; set; } = null!;
    public string OgTitle { get; set; } = null!;
    public string? OgDescription { get; set; }
    public string SiteMapPriority { get; set; } = null!;
}
