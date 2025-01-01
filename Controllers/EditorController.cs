using CodeEditor.Models;
using Microsoft.AspNetCore.Mvc;

namespace CodeEditor.Controllers;

public class EditorController : HtmxController
{
    [HttpGet("editor/{sessionCode}")]
    public IActionResult Index(Guid sessionCode) => HtmxView("_Editor", new Session { Code = sessionCode });

    [HttpPost("sessions")]
    public IActionResult CreateSession()
    {
        var session = Session.Create();
        return RedirectToAction("Index", new { sessionCode = session.Code });
    }

    [HttpGet("sessions")]
    public IActionResult GetSession([FromQuery] Guid code)
    {
        var session = Session.Get(code);
        if (session == null)
        {
            return BadRequest("Session not found");
        }

        return RedirectToAction("Index", new { sessionCode = code });
    }
}
