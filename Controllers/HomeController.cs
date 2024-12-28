using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CodeEditor.Models;

namespace CodeEditor.Controllers;

public class HomeController : HtmxController
{
    [HttpGet("")]
    public IActionResult Home() => HtmxView("_Index");

    [HttpGet("privacy")]
    public IActionResult Privacy() => HtmxView("_Privacy");

    [HttpGet("error")]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new Error { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
