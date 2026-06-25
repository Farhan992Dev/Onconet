namespace Onconet.Web.Services;

public class KavenegarSmsService : ISmsService
{
    public Task<bool> SendSmsAsync(string mobile, string message)
    {
        Console.WriteLine($"[SMS Outbox] Dynamic message sent to {mobile}: {message}");
        return Task.FromResult(true);
    }

    public Task<bool> SendOtpAsync(string mobile, string otpCode)
    {
        Console.WriteLine($"[SMS OTP] Verification code {otpCode} sent to mobile: {mobile}");
        return Task.FromResult(true);
    }
}
