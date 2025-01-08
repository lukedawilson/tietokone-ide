using Newtonsoft.Json;

namespace CodeEditor.Models;

public class Session
{
    public Guid Code { get; set; }
    public List<string> Content { get; } = new();

    public static Session Create() => Upsert(new Session { Code = Guid.NewGuid() });

    public static Session Get(Guid code)
    {
        var session = Context.Cache.Value.GetSet<Session>(code.ToString(), () => null, TimeSpan.FromDays(1));
        if (session == null)
            return null;

        // refresh cache to reset expiration time
        return Upsert(session);
    }

    public void ApplyUpdate(string @event)
    {
        var update = JsonConvert.DeserializeAnonymousType(@event, new
        {
            start = new { row = 0, column = 0 },
            end = new { row = 0, column = 0 },
            action = "",
            lines = Array.Empty<string>(),
        });

        switch (update.action) {
            case "insert":
                if (update.start.row == Content.Count)
                {
                    Content.AddRange(update.lines);
                }
                else
                {
                    Content[update.start.row] = Content[update.start.row].Insert(update.start.column, update.lines[0]);
                    Content.InsertRange(update.start.row + 1, update.lines.Skip(1));
                }
                break;

            case "remove":
                Content[update.start.row] = Content[update.start.row].Remove(update.start.column, update.end.column - update.start.column);
                if (update.start.row != update.end.row)
                {
                    Content.RemoveRange(update.start.row + 1, update.end.row - update.start.row);
                }

                break;
        }

        Upsert(this);
    }

    private static Session Upsert(Session session)
    {
        Context.Cache.Value.Invalidate(session.Code.ToString());
        Context.Cache.Value.GetSet(session.Code.ToString(), () => session, TimeSpan.FromDays(1));
        return session;
    }
}
