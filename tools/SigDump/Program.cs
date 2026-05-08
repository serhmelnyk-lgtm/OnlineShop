using System.Reflection;
using Elastic.Transport;

static void Dump(string name, Type t)
{
    Console.WriteLine($"=== {name}: {t.FullName} ===");
    foreach (var m in t.GetMethods(BindingFlags.Public | BindingFlags.Instance))
    {
        if (!m.Name.Contains("Request", StringComparison.OrdinalIgnoreCase)) continue;
        Console.WriteLine(m);
    }
}

Dump("ITransport", typeof(ITransport));
Console.WriteLine();
Console.WriteLine("=== EndpointPath constructors ===");
foreach (var c in typeof(EndpointPath).GetConstructors(BindingFlags.Public | BindingFlags.Instance))
    Console.WriteLine(c);

Console.WriteLine();
Console.WriteLine("=== RequestConfiguration properties ===");
foreach (var p in typeof(RequestConfiguration).GetProperties(BindingFlags.Public | BindingFlags.Instance))
    Console.WriteLine($"{p.PropertyType.Name} {p.Name}");

Console.WriteLine();
Console.WriteLine("=== StringResponse properties ===");
foreach (var p in typeof(StringResponse).GetProperties(BindingFlags.Public | BindingFlags.Instance))
    Console.WriteLine($"{p.PropertyType.Name} {p.Name}");

Console.WriteLine();
Console.WriteLine("=== ApiCallDetails properties ===");
foreach (var p in typeof(ApiCallDetails).GetProperties(BindingFlags.Public | BindingFlags.Instance))
    Console.WriteLine($"{p.PropertyType.Name} {p.Name}");
