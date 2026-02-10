using System.Security.Claims;
using ASP_Server.Data;
using ASP_Server.DTOs;
using ASP_Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    public async Task<IActionResult> Create([FromBody] CreateProjectDto model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var project = new Project
        {
            Name = model.Name,
            UserId = userId,
            Iv = model.Iv, 
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
        
    [HttpGet]
    public IActionResult GetMyProjects()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var projects = _context.Projects.Where(p => p.UserId == userId).ToList();
        return Ok(projects);
    }
    
    [HttpGet("{id}")]
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
