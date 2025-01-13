using CodeEditor.Models;
using Microsoft.AspNetCore.SignalR;

namespace CodeEditor.Hubs;

public class CodeHub: Hub
{
    public async Task JoinSession(Guid sessionCode)
    {
        var session = Session.Get(sessionCode);
        if (session == null)
            return;

        await Groups.AddToGroupAsync(Context.ConnectionId, sessionCode.ToString());
        await Clients.Caller.SendAsync(
            "ReceiveMessage",
            null,
            new { action = "init", value = session.DocString() });
    }

    public async Task SendMessage(Guid sessionCode, Update update)
    {
        var session = Session.Get(sessionCode);
        if (session == null)
            return;

        session.ApplyDocUpdate(update);
        await Clients.Group(sessionCode.ToString()).SendAsync("ReceiveMessage", Context.ConnectionId, update);
    }
}
