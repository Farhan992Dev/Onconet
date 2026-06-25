namespace Onconet.Web.Models;

public class DbUserProfile
{
    public int Id { get; set; }
    public string Mobile { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string BirthYear { get; set; } = "1370";
    public string LastPeriodDate { get; set; } = "1405/02/10";
    public bool HasRiskFactors { get; set; } = false;
    public string FamilyHistory { get; set; } = "هیچکدام";
    public bool SelfCheckReminderActive { get; set; } = true;
    public int ReminderDayOfMonth { get; set; } = 15;
}
