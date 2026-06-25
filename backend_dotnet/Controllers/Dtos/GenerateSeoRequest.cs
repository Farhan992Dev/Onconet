namespace Onconet.Web.Controllers.Dtos;

public class GenerateSeoRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string Category { get; set; } = "عمومی";
}
