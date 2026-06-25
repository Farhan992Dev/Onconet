namespace Onconet.Web.Controllers.Dtos;

public class PatientLogResponse
{
    public int Id { get; set; }
    public string Date { get; set; } = null!;
    public string Status { get; set; } = "normal";
    public string Notes { get; set; } = null!;
    public List<string> Symptoms { get; set; } = new();
}
