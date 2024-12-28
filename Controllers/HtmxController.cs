using CodeEditor.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace CodeEditor.Controllers;

public class HtmxController : Controller
{
    protected IActionResult HtmxView(string viewName) => Request.IsPartialRequest() ? PartialView(viewName) : View(viewName);
}
