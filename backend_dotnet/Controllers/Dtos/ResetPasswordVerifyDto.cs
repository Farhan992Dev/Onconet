namespace Onconet.Web.Controllers.Dtos;

public class ResetPasswordVerifyDto
{
    public string Mobile { get; set; } = null!;
    public string OtpCode { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}
