namespace Onconet.Web.Services;

public class OpenRouterResponse
{
    public List<OpenRouterChoice> Choices { get; set; } = new();
}

public class OpenRouterChoice
{
    public OpenRouterMessage Message { get; set; } = new();
}

public class OpenRouterMessage
{
    public string Content { get; set; } = string.Empty;
}
