using System.Security.Claims;
using ASP_Server.Data;
using ASP_Server.DTOs;
using ASP_Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
            Content = "",
            Iv = model.Iv, 
            IsFolder = false
        };

        _context.Files.Add(file);
        await _context.SaveChangesAsync();

        return Ok(file);
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFile(Guid id, [FromBody] UpdateFileDto model)
    {
        var file = await _context.Files.FindAsync(id);
        if (file == null) return NotFound("Файл не найден");

        file.Name = model.Name; 
        file.Content = model.Content;
        file.Iv = model.Iv;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Сохранено" });
    }
    
    [HttpGet("project/{projectId}")]
    public IActionResult GetFilesByProject(Guid projectId)
    {
        
        var files = _context.Files
            .Where(f => f.ProjectId == projectId)
            .Select(f => new { f.Id, f.Name, f.IsFolder, f.Extension, f.Iv }) 
            .ToList();
                            
        return Ok(files);
    }
    
    [HttpGet("{fileId}")]
    public IActionResult GetFileContent(Guid fileId)
    {
        var file = _context.Files.Find(fileId);
        if (file == null) return NotFound();

        return Ok(new { file.Id, file.Name, file.Content, file.Iv });
    }
}