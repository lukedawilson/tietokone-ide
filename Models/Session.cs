namespace CodeEditor.Models;

public class Session
{
    public Guid Code { get; set; }
    public string Content { get; private set; }

    public static Session Create() => Upsert(new Session { Code = Guid.NewGuid() });

    public static Session Get(Guid code)
    {
        var session = Context.Cache.Value.GetSet<Session>(code.ToString(), () => null, TimeSpan.FromDays(1));
        if (session == null)
            return null;

        // refresh cache to reset expiration time
        return Upsert(session);
    }

    public void UpdateContent(string content)
    {
        Content = content;
        Upsert(this);
    }

    private static Session Upsert(Session session)
    {
        Context.Cache.Value.Invalidate(session.Code.ToString());
        Context.Cache.Value.GetSet(session.Code.ToString(), () => session, TimeSpan.FromDays(1));
        return session;
    }
}
