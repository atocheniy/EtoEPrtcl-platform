using System.Security.Claims;
using ASP_Server.Data;
using ASP_Server.DTOs;
using ASP_Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASP_Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FilesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FilesController(ApplicationDbContext context)
    {
        _context = context;
    }
    
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateFileDto model)
    {
        var projectExists = _context.Projects.Any(p => p.Id == model.ProjectId);
        if (!projectExists) return BadRequest("Проект не найден");
        
        var file = new ASP_Server.Models.File
        {
            Name = model.Name,
            ProjectId = model.ProjectId,
            ParentId = model.ParentId,
            Extension = Path.GetExtension(model.Name) == "" ? ".md" : Path.GetExtension(model.Name),
            Content = model.Content,
            Iv = model.Iv, 
            IsFolder = model.IsFolder,
        };

        _context.Files.Add(file);
        await _context.SaveChangesAsync();

        return Ok(file);
    }
    
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteFile(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var file = await _context.Files
            .Include(f => f.Project)
            .FirstOrDefaultAsync(f => f.Id == id && f.Project.UserId == userId);

        if (file == null)
        {
            return NotFound("Файл не найден или доступ запрещен");
        }
        
        _context.Files.Remove(file);

        try
        {
            await _context.SaveChangesAsync();
            return Ok(new { message = "Файл успешно удален" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка при удалении файла");
        }
    }
    
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateFile(Guid id, [FromBody] UpdateFileDto model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var file = await _context.Files
            .Include(f => f.Tags)
            .Include(f => f.LinksFrom)
            .Include(f => f.Project)
            .FirstOrDefaultAsync(f => f.Id == id && _context.ProjectMembers
                .Any(pm => pm.ProjectId == f.ProjectId && pm.UserId == userId && (pm.Role == "Owner" || pm.Role == "Editor")));
        if (file == null) return NotFound("Файл не найден");
        
        if (model.Content != null) 
        {
            var historyRecord = new FileHistory
            {
                FileId = file.Id,
                Content = file.Content,
                Iv = file.Iv,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            _context.FileHistories.Add(historyRecord);
        }
        
        if (model.Tags != null)
        {
            file.Tags.Clear();
            foreach (var tDto in model.Tags)
            {
                var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Index == tDto.Index);
                if (tag == null)
                {
                    tag = new Tag { Index = tDto.Index, EncryptedName = tDto.EncryptedName, Iv = tDto.Iv };
                    _context.Tags.Add(tag);
                }
                file.Tags.Add(tag);
            }
        }
        
        if (model.LinkedFileIds != null)
        {
            _context.FileLinks.RemoveRange(file.LinksFrom);
            foreach (var targetId in model.LinkedFileIds)
            {
                file.LinksFrom.Add(new FileLink { SourceFileId = id, TargetFileId = targetId });
            }
        }
        
        if (model.Name != null) file.Name = model.Name;
        if (model.Extension != null) file.Extension = model.Extension;
        
        if (model.Content != null) file.Content = model.Content;
        if (model.Iv != null) file.Iv = model.Iv;
        if (model.ParentId != null) file.ParentId = model.ParentId;

        try
        {
            await _context.SaveChangesAsync();
            return Ok(new { message = "Файл обновлен успешно" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка при сохранении");
        }
    }
    
    [HttpGet("project/{projectId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFilesByProject(Guid projectId)
    {
        var project = await _context.Projects.FindAsync(projectId);
        
        if (project == null || (!project.IsPublic && User.FindFirstValue(ClaimTypes.NameIdentifier) == null)) 
            return Unauthorized();
        
        var files = _context.Files
            .Include(f => f.LinksFrom)
            .Include(f => f.Tags)
            .Where(f => f.ProjectId == projectId)
            .Select(f => new { f.Id, f.Name, f.IsFolder, f.Extension, f.Iv, f.ParentId, Links = f.LinksFrom.Select(l => l.TargetFileId), Tags = f.Tags.Select(t => new { t.EncryptedName, t.Iv, t.Index })   }) 
            .ToList();
                            
        return Ok(files);
    }
    
    [HttpGet("{fileId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFileContent(Guid fileId)
    {
        var file = await _context.Files
            .Include(f => f.Project)   
            .Include(f => f.Tags)           
            .Include(f => f.LinksFrom)     
            .FirstOrDefaultAsync(f => f.Id == fileId);

        if (file == null) return NotFound();
        
        if (!file.Project.IsPublic)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            
            var isMember = await _context.ProjectMembers
                .AnyAsync(pm => pm.ProjectId == file.ProjectId && pm.UserId == userId);
            
            if (!isMember) return Forbid("У вас нет доступа к этому приватному файлу");
        }

        return Ok(new { file.Id, file.Name, file.Content, file.Iv, Tags = file.Tags.Select(t => new { t.EncryptedName, t.Iv, t.Index }), Links = file.LinksFrom.Select(l => l.TargetFileId)  });
    }
    
    [HttpGet("all")]
    [Authorize]
    public async Task<IActionResult> GetAllUserFiles()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var allFiles = await _context.Files
            .Include(f => f.LinksFrom)
            .Include(f => f.Tags)
            .Where(f => f.Project.UserId == userId)
            .Select(f => new { 
                f.Id, 
                f.Name, 
                f.Iv, 
                f.ProjectId,
                f.IsFolder,
                f.Extension,
                Tags = f.Tags.Select(t => new { t.EncryptedName, t.Iv, t.Index }),
                Links = f.LinksFrom.Select(l => l.TargetFileId)
            })
            .ToListAsync();

        return Ok(allFiles);
    }
    
    [HttpGet("{id}/history")]
    [Authorize]
    public async Task<IActionResult> GetFileHistory(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var history = await _context.FileHistories
            .Where(h => h.FileId == id && h.File.Project.UserId == userId) 
            .OrderByDescending(h => h.CreatedAt)
            .Select(h => new { h.Id, h.CreatedAt, h.Iv, h.Content, userEmail = h.User.Email })
            .ToListAsync();

        return Ok(history);
    }
}