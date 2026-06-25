namespace Onconet.Web.Services;

public interface ISmsSender
{
    Task SendSmsAsync(string mobile, string message);
}
