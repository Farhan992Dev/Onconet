namespace Onconet.Web.Controllers.Dtos;

public class UserProfileDto
{
    public string? FullName { get; set; }
    public string? BirthYear { get; set; }
    public string? LastPeriodDate { get; set; }
    public bool HasRiskFactors { get; set; } = false;
    public string? FamilyHistory { get; set; }
    public bool SelfCheckReminderActive { get; set; } = true;
    public int ReminderDayOfMonth { get; set; } = 15;
}
