namespace Onconet.Web.Models;

public static class ApiResponseHelpers
{
    public static ApiResponse<object?> Ok(object? data = null, string? message = null) =>
        ApiResponse<object?>.Ok(data, message);

    public static ApiResponse<object?> Fail(string message, object? data = null) =>
        ApiResponse<object?>.Fail(message, data);
}
