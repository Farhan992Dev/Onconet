namespace Onconet.Web.Controllers.Dtos;

public class UserProfileResponse
{
    public string FullName { get; set; } = null!;
    public string Mobile { get; set; } = null!;
    public string BirthYear { get; set; } = "1370";
    public string LastPeriodDate { get; set; } = "1405/02/10";
    public bool HasRiskFactors { get; set; }
    public string FamilyHistory { get; set; } = "هیچکدام";
    public bool SelfCheckReminderActive { get; set; }
    public int ReminderDayOfMonth { get; set; }
}
