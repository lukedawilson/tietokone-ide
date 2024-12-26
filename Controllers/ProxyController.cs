using Microsoft.AspNetCore.Mvc;

namespace CodeEditor.Controllers;

public class ProxyController(HttpClient httpClient) : ControllerBase
{
    /// <summary>
    /// Proxies the request to the CodeMirror js file,
    /// so it can be referenced in a js module
    /// without falling foul of CORS checks.
    /// </summary>
    /// <returns>The minified js file.</returns>
    [HttpGet("proxy/codemirror.js")]
    public async Task<IActionResult> GetCodeMirror()
    {
        var response = await httpClient.GetAsync("https://codemirror.net/codemirror.js");
        var content = await response.Content.ReadAsStringAsync();
        return Content(content, "application/javascript");
    }
}
