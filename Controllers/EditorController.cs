using Microsoft.AspNetCore.Mvc;

namespace CodeEditor.Controllers;

public class EditorController : HtmxController
{
    [HttpGet("editor")]
    public IActionResult Index() => HtmxView("_Editor");
}
