namespace Onconet.Web.Models;

public class DbPageSEO
{
    public int Id { get; set; }
    public string PageId { get; set; } = null!;
    public string PageName { get; set; } = null!;
    public string MetaTitle { get; set; } = null!;
    public string MetaDescription { get; set; } = null!;
    public string FocusKeywords { get; set; } = null!;
    public string CanonicalUrl { get; set; } = null!;
    public string OgTitle { get; set; } = null!;
    public string OgDescription { get; set; } = string.Empty;
    public string SiteMapPriority { get; set; } = null!;
}
