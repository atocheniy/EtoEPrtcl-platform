using ASP_Server.Data;

namespace ASP_Server;

using System.Security.Cryptography;
using System.Text;
using System.Formats.Asn1;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

public class SignatureVerifier
{
    public static bool Verify(string publicKeyBase64, string signatureBase64, string message)
    {
        try
        {
            byte[] publicKeyBytes = Convert.FromBase64String(publicKeyBase64);
            byte[] signatureBytes = Convert.FromBase64String(signatureBase64);
            byte[] messageBytes = Encoding.UTF8.GetBytes(message);

            using var ecdsa = ECDsa.Create();
            ecdsa.ImportSubjectPublicKeyInfo(publicKeyBytes, out _);

            return ecdsa.VerifyData(
                messageBytes, 
                signatureBytes, 
                HashAlgorithmName.SHA256, 
                DSASignatureFormat.IeeeP1363FixedFieldConcatenation
            );
        }
        catch
        {
            return false;
        }
    }
}

public class SignatureRequiredAttribute : ActionFilterAttribute
{
    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var request = context.HttpContext.Request;
        
        if (!request.Headers.TryGetValue("X-Signature", out var signature) ||
            !request.Headers.TryGetValue("X-Timestamp", out var timestamp))
        {
            context.Result = new BadRequestObjectResult("Missing digital signature");
            return;
        }
        
        if (!long.TryParse(timestamp, out var ts))
        {
            context.Result = new BadRequestObjectResult("Invalid timestamp");
            return;
        }
        
        var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        if (Math.Abs(now - long.Parse(timestamp)) > 300000)
        {
            context.Result = new BadRequestObjectResult("Request expired");
            return;
        }
        
        var db = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
        var userId = context.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }
        
        var user = await db.Users.FindAsync(userId);

        if (user?.SigningPublicKey == null)
        {
            context.Result = new UnauthorizedObjectResult("User has no registered signing key");
            return;
        }
        
        string message = $"{request.Method}|{request.Path}|{timestamp}";
        
        /*
        Console.WriteLine($"Method: {request.Method}");
        Console.WriteLine($"Path: {request.Path}");
        Console.WriteLine($"Timestamp: {timestamp}");
        Console.WriteLine($"Full Message: {message}");
        Console.WriteLine($"Public Key (first 10): {user.SigningPublicKey.Substring(0, 10)}...");
        */

        if (!SignatureVerifier.Verify(user.SigningPublicKey, signature, message))
        {
            context.Result = new UnauthorizedObjectResult("Invalid signature. Access denied.");
            return;
        }

        await next();
    }
}