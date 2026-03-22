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
    
    public DbSet<FileLink> FileLinks { get; set; }
    
    public DbSet<Tag> Tags { get; set; }
    public DbSet<ProjectMember> ProjectMembers { get; set; }
    
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        builder.Entity<ProjectMember>()
            .HasKey(pm => new { pm.ProjectId, pm.UserId });
        
        builder.Entity<ProjectMember>()
            .HasOne(pm => pm.Project)
            .WithMany(p => p.Members)
            .HasForeignKey(pm => pm.ProjectId);

        builder.Entity<ProjectMember>()
            .HasOne(pm => pm.User)
            .WithMany()
            .HasForeignKey(pm => pm.UserId);
        
        builder.Entity<Project>()
            .Property(p => p.Status)
            .HasConversion<string>();
        
        builder.Entity<Project>()
            .Property(p => p.Priority)
            .HasConversion<string>();
        
        builder.Entity<ApplicationUser>()
            .Property(u => u.Theme)
            .HasConversion<string>();
        
        
        
        builder.Entity<ASP_Server.Models.File>()
            .HasMany(f => f.Tags)
            .WithMany(t => t.Files);
        
        builder.Entity<FileLink>()
            .HasKey(fl => new { fl.SourceFileId, fl.TargetFileId });

        builder.Entity<FileLink>()
            .HasOne(fl => fl.SourceFile)
            .WithMany(f => f.LinksFrom)
            .HasForeignKey(fl => fl.SourceFileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<FileLink>()
            .HasOne(fl => fl.TargetFile)
            .WithMany(f => f.LinksTo)
            .HasForeignKey(fl => fl.TargetFileId)
            .OnDelete(DeleteBehavior.Cascade);
        
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
