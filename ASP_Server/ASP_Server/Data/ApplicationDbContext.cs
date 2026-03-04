using System.Text.Json;
using ASP_Server.Data;
using ASP_Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using File = ASP_Server.Models.File;

namespace ASP_Server.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<Project> Projects { get; set; }
    public DbSet<File> Files { get; set; }
    
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        builder.Entity<Project>()
            .Property(p => p.Status)
            .HasConversion<string>();
        
        builder.Entity<Project>()
            .Property(p => p.Priority)
            .HasConversion<string>();
        
        builder.Entity<ApplicationUser>()
            .Property(u => u.Theme)
            .HasConversion<string>();
        
        /*
        var encryptionConverter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<string, string>(
            v => AesEncryption.Encrypt(v), 
            v => AesEncryption.Decrypt(v) 
        );
        
        builder.Entity<ASP_Server.Models.File>(entity =>
        {
            entity.Property(f => f.Name).HasConversion(encryptionConverter);
            entity.Property(f => f.Content).HasConversion(encryptionConverter);
        });
        
        builder.Entity<ASP_Server.Models.Project>(entity =>
        {
            entity.Property(p => p.Name).HasConversion(encryptionConverter);
        });
        */
    }
}
