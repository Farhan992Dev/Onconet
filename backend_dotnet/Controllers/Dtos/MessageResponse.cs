namespace Onconet.Web.Controllers.Dtos;

public class MessageResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Mobile { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string Date { get; set; } = null!;
}
