using System.Net.Security;
using IntelligentHack.IntelligentCache;
using StackExchange.Redis;
using MemoryCache = IntelligentHack.IntelligentCache.MemoryCache;

namespace CodeEditor;

public static class Context
{
    public static Lazy<ConfigurationOptions> RedisConfig { get; } = new(() =>
    {
        var redisUrl = Environment.GetEnvironmentVariable("REDIS_URL");
        if (redisUrl.StartsWith("redis://"))
            return new() { EndPoints = { redisUrl.Replace("redis://", "") } };

        redisUrl = redisUrl.Replace("rediss://:", "");
        var (password, endpoint) = redisUrl.Split('@') switch { var x => (x[0], x[1]) };

        return new()
        {
            EndPoints = { endpoint },
            Password = password,
            Ssl = true,
            SslClientAuthenticationOptions = _ => new SslClientAuthenticationOptions
            {
                RemoteCertificateValidationCallback = (_, _, _, _) => true,
            },
        };
    });

    public static Lazy<ICache> Cache { get; } = new(() =>
    {
        const string cachePrefix = "sessions";

        var redisConnection = ConnectionMultiplexer.Connect(RedisConfig.Value);
        var subscriber = redisConnection.GetSubscriber();
        var invalidationChannel = RedisChannel.Literal("cache-invalidations");

        return new CompositeCache(
            new RedisInvalidationReceiver(
                new MemoryCache(cachePrefix),
                subscriber,
                invalidationChannel),
            new CompositeCache(
                new RedisCache(redisConnection, cachePrefix),
                new RedisInvalidationSender(subscriber, invalidationChannel))
        );
    });
}
