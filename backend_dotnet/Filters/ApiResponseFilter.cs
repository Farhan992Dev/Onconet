using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Onconet.Web.Models;

namespace Onconet.Web.Filters;

public class ApiResponseFilter : IAsyncResultFilter
{
    public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        if (ShouldSkip(context))
        {
            await next();
            return;
        }

        switch (context.Result)
        {
            case ObjectResult objectResult:
                NormalizeObjectResult(objectResult);
                break;
            case ForbidResult:
                context.Result = new ObjectResult(ApiResponseHelpers.Fail("دسترسی به این عملیات مجاز نیست."))
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
                break;
            case UnauthorizedResult:
                context.Result = new ObjectResult(ApiResponseHelpers.Fail("احراز هویت انجام نشده یا توکن نامعتبر است."))
                {
                    StatusCode = StatusCodes.Status401Unauthorized
                };
                break;
            case NotFoundResult:
                context.Result = new ObjectResult(ApiResponseHelpers.Fail("مورد درخواستی یافت نشد."))
                {
                    StatusCode = StatusCodes.Status404NotFound
                };
                break;
        }

        await next();
    }

    private static bool ShouldSkip(ResultExecutingContext context)
    {
        var path = context.HttpContext.Request.Path.Value ?? string.Empty;
        return path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase);
    }

    private static void NormalizeObjectResult(ObjectResult objectResult)
    {
        if (IsApiResponse(objectResult.Value))
        {
            return;
        }

        var statusCode = objectResult.StatusCode ?? StatusCodes.Status200OK;
        var isSuccess = statusCode >= StatusCodes.Status200OK && statusCode < StatusCodes.Status300MultipleChoices;

        if (isSuccess)
        {
            objectResult.Value = ApiResponseHelpers.Ok(objectResult.Value);
            return;
        }

        objectResult.Value = WrapFailure(objectResult.Value, GetDefaultErrorMessage(statusCode));
    }

    private static ApiResponse<object?> WrapFailure(object? value, string fallbackMessage)
    {
        var message = ExtractMessage(value) ?? fallbackMessage;
        return ApiResponseHelpers.Fail(message, value);
    }

    private static bool IsApiResponse(object? value)
    {
        if (value == null)
        {
            return false;
        }

        var type = value.GetType();
        return type.IsGenericType && type.GetGenericTypeDefinition() == typeof(ApiResponse<>)
               || type.Name.StartsWith("ApiResponse", StringComparison.Ordinal);
    }

    private static string? ExtractMessage(object? value)
    {
        if (value == null)
        {
            return null;
        }

        if (value is string text && !string.IsNullOrWhiteSpace(text))
        {
            return text;
        }

        var type = value.GetType();
        foreach (var propertyName in new[] { "Message", "message", "Title", "title" })
        {
            var property = type.GetProperty(propertyName);
            if (property?.GetValue(value) is string message && !string.IsNullOrWhiteSpace(message))
            {
                return message;
            }
        }

        return null;
    }

    private static string GetDefaultErrorMessage(int statusCode) => statusCode switch
    {
        StatusCodes.Status400BadRequest => "درخواست نامعتبر است.",
        StatusCodes.Status401Unauthorized => "احراز هویت انجام نشده یا توکن نامعتبر است.",
        StatusCodes.Status403Forbidden => "دسترسی به این عملیات مجاز نیست.",
        StatusCodes.Status404NotFound => "مورد درخواستی یافت نشد.",
        StatusCodes.Status409Conflict => "تداخل در داده‌ها رخ داده است.",
        StatusCodes.Status429TooManyRequests => "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً مدتی صبر کنید.",
        _ => "خطای داخلی سرور رخ داده است. لطفاً بعداً تلاش کنید."
    };
}
