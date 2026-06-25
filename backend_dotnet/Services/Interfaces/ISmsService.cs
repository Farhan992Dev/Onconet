namespace Onconet.Web.Services;

public interface ISmsService
{
    Task<bool> SendSmsAsync(string mobile, string message);
    Task<bool> SendOtpAsync(string mobile, string otpCode);
}
