using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace ASP_Server.Models;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
    public string? SigningPublicKey { get; set; } 
    public string? EncryptedSigningPrivateKey { get; set; }
    public string? SigningKeyIv { get; set; }
}

