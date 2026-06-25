using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Onconet.Web.Services;

public class OpenRouterAiSeoService : IAiSeoService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OpenRouterAiSeoService> _logger;

    public OpenRouterAiSeoService(HttpClient httpClient, IConfiguration configuration, ILogger<OpenRouterAiSeoService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<SeoMetadata> GenerateSeoMetadataAsync(string title, string content, string? summary, string category)
    {
        var apiKey = _configuration["OpenRouter:ApiKey"];
        
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("OpenRouter API key not configured, falling back to fake implementation");
            return await new FakeAiSeoService().GenerateSeoMetadataAsync(title, content, summary, category);
        }

        try
        {
            var prompt = BuildPrompt(title, content, summary, category);
            
            var requestBody = new
            {
                model = _configuration["OpenRouter:Model"] ?? "openrouter/owl-alpha",
                messages = new[]
                {
                    new { role = "system", content = "You are an expert SEO specialist for medical content in Persian (Farsi). Generate SEO metadata optimized for Persian search engines." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.7,
                max_tokens = 500
            };

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

            var response = await _httpClient.PostAsJsonAsync("https://openrouter.ai/api/v1/chat/completions", requestBody);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("OpenRouter API error: {StatusCode} - {Error}", response.StatusCode, errorContent);
                return await new FakeAiSeoService().GenerateSeoMetadataAsync(title, content, summary, category);
            }

            var result = await response.Content.ReadFromJsonAsync<OpenRouterResponse>();
            var aiContent = result?.Choices?.FirstOrDefault()?.Message?.Content;

            if (string.IsNullOrEmpty(aiContent))
            {
                return await new FakeAiSeoService().GenerateSeoMetadataAsync(title, content, summary, category);
            }

            return ParseAiResponse(aiContent, title, category);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling OpenRouter API");
            return await new FakeAiSeoService().GenerateSeoMetadataAsync(title, content, summary, category);
        }
    }

    private string BuildPrompt(string title, string content, string? summary, string category)
    {
        var plainText = content.Replace("#", " ").Replace("*", " ").Replace(">", " ").Replace("\n", " ");
        var excerpt = summary ?? (plainText.Length > 200 ? plainText.Substring(0, 200) : plainText);

        return $"""
        عنوان مقاله: {title}
        دسته‌بندی: {category}
        خلاصه: {excerpt}

        لطفاً سه مورد زیر را به زبان فارسی و برای سئو optimized تولید کن:
        1. عنوان سئو (SEO Title) - حداکثر 60 کاراکتر، جذاب و شامل کلمات کلیدی
        2. توضیحات متا (Meta Description) - حداکثر 160 کاراکتر، خلاصه محتوا
        3. کلمات کلیدی (Keywords) - 5 تا 8 کلمه یا عبارت مرتبط با کاما جدا شده

        پاسخ را دقیقاً در این فرمت بده:
        SEO_TITLE: [عنوان]
        SEO_DESCRIPTION: [توضیحات]
        KEYWORDS: [کلمات کلیدی]
        """;
    }

    private SeoMetadata ParseAiResponse(string aiContent, string title, string category)
    {
        var lines = aiContent.Split('\n');
        var seoTitle = "";
        var seoDesc = "";
        var keywords = "";

        foreach (var line in lines)
        {
            if (line.StartsWith("SEO_TITLE:", StringComparison.OrdinalIgnoreCase))
                seoTitle = line.Substring(10).Trim();
            else if (line.StartsWith("SEO_DESCRIPTION:", StringComparison.OrdinalIgnoreCase))
                seoDesc = line.Substring(16).Trim();
            else if (line.StartsWith("KEYWORDS:", StringComparison.OrdinalIgnoreCase))
                keywords = line.Substring(9).Trim();
        }

        if (string.IsNullOrEmpty(seoTitle))
            seoTitle = $"{title} | دانستنی‌های نوین و پزشکی onconet";
        if (string.IsNullOrEmpty(seoDesc))
            seoDesc = $"مقاله‌ای درباره {title}. اطلاعات تخصصی پزشکی و راهنمای سلامت پستان.";
        if (string.IsNullOrEmpty(keywords))
            keywords = $"{category}, سلامت پستان, پیشگیری سرطان, غربالگری";

        if (seoTitle.Length > 60)
            seoTitle = seoTitle.Substring(0, 60);
        if (seoDesc.Length > 160)
            seoDesc = seoDesc.Substring(0, 160);

        return new SeoMetadata
        {
            SeoTitle = seoTitle,
            SeoDescription = seoDesc,
            SeoKeywords = keywords
        };
    }
}
