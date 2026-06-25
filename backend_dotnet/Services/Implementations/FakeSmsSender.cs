namespace Onconet.Web.Services;

public class FakeSmsSender : ISmsSender
{
    public Task SendSmsAsync(string mobile, string message)
    {
        Console.WriteLine($"[FAKE SMS SENDER] SMS sent to {mobile}: {message}");
        return Task.CompletedTask;
    }
}
