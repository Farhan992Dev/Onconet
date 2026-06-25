namespace Onconet.Web.Services;

public interface IAiSeoService
{
    Task<SeoMetadata> GenerateSeoMetadataAsync(string title, string content, string? summary, string category);
}
