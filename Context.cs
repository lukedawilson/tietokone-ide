using Microsoft.Extensions.Caching.Memory;

namespace CodeEditor;

public static class Context
{
    public static IMemoryCache MemoryCache { get; set; }
}