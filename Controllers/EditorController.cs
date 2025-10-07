using CodeEditor.Models;
using Microsoft.AspNetCore.Mvc;

namespace CodeEditor.Controllers;

public class EditorController : HtmxController
{
    [HttpGet("editor/{sessionCode}")]
    public IActionResult Index(Guid sessionCode)
    {
        return HtmxView("_Editor", Session.Get(sessionCode));
    }

    [HttpPost("sessions")]
    public IActionResult CreateSession(bool enableCodeExecution)
    {
        var session = Session.Create(enableCodeExecution);
        return RedirectToAction("Index", new { sessionCode = session.Code });
    }

    [HttpGet("sessions")]
    public IActionResult GetSession([FromQuery] Guid code)
    {
        var session = Session.Get(code);
        if (session == null)
            return BadRequest("Session not found");

        return RedirectToAction("Index", new { sessionCode = code });
    }
}
