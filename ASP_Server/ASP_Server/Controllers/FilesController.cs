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
    [SignatureRequired]
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
            IsFolder = false
        };

        _context.Files.Add(file);
        await _context.SaveChangesAsync();

        return Ok(file);
    }
    
    [HttpDelete("{id}")]
    [Authorize]
    [SignatureRequired]
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
    [SignatureRequired]
    public async Task<IActionResult> UpdateFile(Guid id, [FromBody] UpdateFileDto model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var file = await _context.Files
            .Include(f => f.Project)
            .FirstOrDefaultAsync(f => f.Id == id && f.Project.UserId == userId);
        if (file == null) return NotFound("Файл не найден");
        
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
    [Authorize]
    [SignatureRequired]
    public IActionResult GetFilesByProject(Guid projectId)
    {
        
        var files = _context.Files
            .Where(f => f.ProjectId == projectId)
            .Select(f => new { f.Id, f.Name, f.IsFolder, f.Extension, f.Iv }) 
            .ToList();
                            
        return Ok(files);
    }
    
    [HttpGet("{fileId}")]
    [Authorize]
    [SignatureRequired]
    public IActionResult GetFileContent(Guid fileId)
    {
        var file = _context.Files.Find(fileId);
        if (file == null) return NotFound();

        return Ok(new { file.Id, file.Name, file.Content, file.Iv });
    }
    
    [HttpGet("all")]
    [Authorize]
    [SignatureRequired] 
    public async Task<IActionResult> GetAllUserFiles()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var allFiles = await _context.Files
            .Where(f => f.Project.UserId == userId)
            .Select(f => new { f.Id, f.Name, f.Iv, f.ProjectId })
            .ToListAsync();

        return Ok(allFiles);
    }
}