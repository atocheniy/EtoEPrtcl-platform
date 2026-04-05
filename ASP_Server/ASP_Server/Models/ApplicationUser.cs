using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace ASP_Server.Models;

public enum ApplicationTheme
{
    Light,
    Dark,
    Auto
}

public enum PerformanceMode
{
    On,
    Off,
    Auto
}

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
    public string? SigningPublicKey { get; set; } 
    public string? EncryptedSigningPrivateKey { get; set; }
    public string? SigningKeyIv { get; set; }
    public string? SignSalt {get; set;}
    
    // Project Key
    [Required]
    public string ExchangePublicKey { get; set; } = string.Empty;
    
    [Required]
    public string EncryptedExchangePrivateKey { get; set; } = string.Empty;
    
    [Required]
    public string ExchangeKeyIv { get; set; } = string.Empty;
    
    [Required]
    public ApplicationTheme Theme { get; set; } = ApplicationTheme.Auto;

    [Required] 
    public PerformanceMode Mode { get; set; } = PerformanceMode.On;
    
    public string? OrbColor1 { get; set; } = "rgba(125, 125, 125, 0)";
    public string? OrbColor2 { get; set; } = "rgba(125, 125, 125, 0)";
}

