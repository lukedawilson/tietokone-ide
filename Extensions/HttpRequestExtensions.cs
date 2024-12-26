namespace CodeEditor.Extensions;

public static class HttpRequestExtensions
{
    public static bool IsPartialRequest(this HttpRequest request) => !string.IsNullOrEmpty(request.Headers["HX-Target"]);
}
