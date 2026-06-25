namespace Onconet.Web.Controllers.Dtos;

public class PatientLogDto
{
    public string? Date { get; set; }
    public string Status { get; set; } = "normal";
    public string Notes { get; set; } = null!;
    public string SymptomsJson { get; set; } = "[]";
}
