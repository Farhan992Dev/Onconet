namespace Onconet.Web.Models;

public class DbPatientLog
{
    public int Id { get; set; }
    public string Mobile { get; set; } = null!;
    public string Date { get; set; } = null!;
    public string Status { get; set; } = "normal";
    public string Notes { get; set; } = null!;
    public string SymptomsJson { get; set; } = "[]";
}
