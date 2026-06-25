namespace Onconet.Web.Controllers.Dtos;

public class MessageSubmitDto
{
    public string Name { get; set; } = null!;
    public string Mobile { get; set; } = null!;
    public string? Subject { get; set; }
    public string? Content { get; set; }
}
