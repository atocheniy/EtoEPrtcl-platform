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
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProjectsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [Authorize]
    [SignatureRequired]
    public async Task<IActionResult> Create([FromBody] CreateProjectDto model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var project = new Project
        {
            Name = model.Name,
            UserId = userId,
            Iv = model.Iv, 
            IsPublic =  model.IsPublic,
            Priority =  model.Priority,
            Status =  model.Status,
            CreatedAt = DateTime.UtcNow
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync(); 
        
        var defaultFile = new ASP_Server.Models.File
        {
            Name = model.Name,
            Extension = ".md",
            Content = "",
            ProjectId = project.Id,
            Iv = project.Iv, 
            IsFolder = false
        };

        _context.Files.Add(defaultFile);
        await _context.SaveChangesAsync();

        return Ok(new { project.Id, project.Name });
    }
    
    [HttpDelete("{id}")]
    [Authorize]
    [SignatureRequired]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var project = await _context.Projects
            .Include(p => p.Files)
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (project == null)
        {
            return NotFound("Проект не найден или доступ запрещен");
        }

        _context.Projects.Remove(project);
    
        try 
        {
            await _context.SaveChangesAsync();
            return Ok(new { message = "Проект и все вложенные файлы удалены" });
        }
        catch (Exception)
        {
            return StatusCode(500, "Ошибка при удалении проекта из базы данных");
        }
    }
    
    [HttpPut("{id}")]
    [Authorize]
    [SignatureRequired]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectDto model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (project == null)
        {
            return NotFound("Проект не найден или у вас нет прав доступа.");
        }
        
        project.Name = model.Name;
        project.Iv = model.Iv;
        project.IsPublic = model.IsPublic;
        project.Priority = model.Priority;
        project.Status = model.Status;
        project.UpdatedAt = DateTime.UtcNow;

        try
        {
            _context.Projects.Update(project);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return StatusCode(500, "Ошибка при сохранении данных в базу.");
        }

        return Ok(new { project.Id, project.Name, message = "Настройки проекта обновлены" });
    }
        
    [HttpGet]
    [Authorize]
    [SignatureRequired]
    public IActionResult GetMyProjects()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var projects = _context.Projects.Where(p => p.UserId == userId).ToList();
        return Ok(projects);
    }
    
    [HttpGet("{id}")]
    [Authorize]
    [SignatureRequired]
    public async Task<ActionResult<Project>> GetProject(Guid id)
    {
        var project = await _context.Projects.FindAsync(id);

        if (project == null)
        {
            return NotFound(); 
        }

        return project;
    }
}
