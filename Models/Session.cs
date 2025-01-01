using Microsoft.Extensions.Caching.Memory;

namespace CodeEditor.Models;

public class Session
{
    public Guid? Code { get; set; }

    public static Session Create()
    {
        var session = new Session { Code = Guid.NewGuid() };
        Context.MemoryCache.Set(session.Code, session);
        return session;
    }

    public static Session Get(Guid code)
    {
        return Context.MemoryCache.TryGetValue(code, out Session session)
            ? session
            : null;
    }
}
