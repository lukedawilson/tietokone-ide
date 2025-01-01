using CodeEditor.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace CodeEditor.Controllers;

public class HtmxController : Controller
{
    protected IActionResult HtmxView(string viewName, object model = null) => Request.IsPartialRequest()
        ? PartialView(viewName, model)
        : View(viewName, model);
}
