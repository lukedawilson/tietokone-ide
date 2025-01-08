using CodeEditor.Models;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

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
            JsonConvert.SerializeObject(new { action = "init", value = string.Join('\n', session.Content) }));
    }

    public async Task SendMessage(Guid sessionCode, string @event)
    {
        var session = Session.Get(sessionCode);
        if (session == null)
            return;

        session.ApplyUpdate(@event);
        await Clients.Group(sessionCode.ToString()).SendAsync("ReceiveMessage", Context.ConnectionId, @event);
    }
}
