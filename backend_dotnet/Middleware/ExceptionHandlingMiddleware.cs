using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Onconet.Web.Models;

namespace Onconet.Web.Middleware;

public class ExceptionHandlingMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        if (context.Response.HasStarted)
        {
            _logger.LogError(exception, "Exception thrown after response started for {Method} {Path}",
                context.Request.Method, context.Request.Path);
            return;
        }

        var (statusCode, message) = MapException(exception);

        _logger.LogError(exception, "Unhandled exception for {Method} {Path}: {Message}",
            context.Request.Method, context.Request.Path, exception.Message);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        object payload = _environment.IsDevelopment()
            ? ApiResponseHelpers.Fail(message, new { details = exception.Message, type = exception.GetType().Name })
            : ApiResponseHelpers.Fail(message);

        await context.Response.WriteAsync(JsonSerializer.Serialize(payload, JsonOptions));
    }

    private static (HttpStatusCode StatusCode, string Message) MapException(Exception exception)
    {
        return exception switch
        {
            UnauthorizedAccessException ex => (HttpStatusCode.Unauthorized, ex.Message),
            KeyNotFoundException ex => (HttpStatusCode.NotFound, ex.Message),
            ArgumentException ex => (HttpStatusCode.BadRequest, ex.Message),
            InvalidOperationException ex => (HttpStatusCode.BadRequest, ex.Message),
            DbUpdateConcurrencyException => (HttpStatusCode.Conflict, "داده‌ها توسط کاربر دیگری تغییر یافته‌اند. لطفاً مجدداً تلاش کنید."),
            DbUpdateException => (HttpStatusCode.Conflict, "خطا در ذخیره‌سازی داده‌ها. لطفاً اطلاعات را بررسی کنید."),
            _ => (HttpStatusCode.InternalServerError, "خطای داخلی سرور رخ داده است. لطفاً بعداً تلاش کنید.")
        };
    }
}
