using System.Diagnostics;
using CodeEditor.Extensions;
using Microsoft.AspNetCore.Mvc;
using CodeEditor.Models;

namespace CodeEditor.Controllers;

public class HomeController : Controller
{
    [HttpGet("")]
    public IActionResult Home() => Request.IsPartialRequest() ? PartialView("_Index") : View("_Index");

    [HttpGet("privacy")]
    public IActionResult Privacy() => Request.IsPartialRequest() ? PartialView("_Privacy") : View("_Privacy");

    [HttpGet("error")]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new Error { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
