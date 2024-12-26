using CodeEditor.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace CodeEditor.Controllers;

public class EditorController : Controller
{
    [HttpGet("editor")]
    public IActionResult Index() => Request.IsPartialRequest() ? PartialView("_Editor") : View("_Editor");
}
