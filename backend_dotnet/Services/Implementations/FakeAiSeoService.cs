namespace Onconet.Web.Services;

public class FakeAiSeoService : IAiSeoService
{
    public Task<SeoMetadata> GenerateSeoMetadataAsync(string title, string content, string? summary, string category)
    {
        var plainText = content.Replace("#", " ").Replace("*", " ").Replace(">", " ").Replace("\n", " ");
        if (plainText.Length > 300)
            plainText = plainText.Substring(0, 300);

        var titleClean = string.IsNullOrEmpty(title) ? "سلامت پستان" : title;
        var summaryText = summary ?? plainText;

        var seoTitle = $"{titleClean} | دانستنی‌های نوین و پزشکی onconet";
        var seoDesc = $"بخوانید: {summaryText.Substring(0, Math.Min(120, summaryText.Length))}... روش تشخیص، علائم غربالگری و پیامدهای پزشکی تایید شده.";
        var keywords = $"{category}, پیشگیری سرطان پستان, درمان سینه, درمان خوش خیم, غربالگری پستان, خودارزیابی دستی";

        if (seoDesc.Length > 160)
            seoDesc = seoDesc.Substring(0, 160);

        return Task.FromResult(new SeoMetadata
        {
            SeoTitle = seoTitle,
            SeoDescription = seoDesc,
            SeoKeywords = keywords
        });
    }
}
