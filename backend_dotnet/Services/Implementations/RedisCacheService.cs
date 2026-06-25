using Microsoft.Extensions.Caching.Memory;

namespace Onconet.Web.Services;

public class RedisCacheService : ICacheService
{
    private readonly IMemoryCache _cache;

    public RedisCacheService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
    {
        var payload = value?.ToString() ?? string.Empty;
        _cache.Set(key, payload, expiration.Value);
        return Task.CompletedTask;
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        var payload = _cache.Get(key);
        if (payload == null)
        {
            return default;
        }

        if (typeof(T) == typeof(string))
        {
            return (T?)(object)payload;
        }

        return default;
    }

    public Task RemoveAsync(string key)
    {
        _cache.Remove(key);
        return Task.CompletedTask;
    }
}
