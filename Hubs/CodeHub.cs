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
        await Clients.Caller.SendAsync("ReceiveMessage", null, session.Content);
    }

    public async Task SendMessage(Guid sessionCode, string message)
    {
        var session = Session.Get(sessionCode);
        if (session == null)
            return;

        session.UpdateContent(message);
        await Clients.Group(sessionCode.ToString()).SendAsync("ReceiveMessage", Context.ConnectionId, message);
    }
}
