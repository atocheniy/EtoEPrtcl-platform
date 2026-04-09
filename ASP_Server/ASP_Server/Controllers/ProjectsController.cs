using System.Security.Claims;
using ASP_Server.Data;
using ASP_Server.DTOs;
using ASP_Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ASP_Server.Controllers;


[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public ProjectsController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpPost]
    [Authorize]
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
        
        var member = new ProjectMember {
            ProjectId = project.Id,
            UserId = userId,
            EncryptedProjectKey = model.EncryptedProjectKey,
            Iv = model.ProjectKeyIv,
            Role = "Owner"
        };
        
        _context.ProjectMembers.Add(member);
        await _context.SaveChangesAsync();

        return Ok(new { project.Id, project.Name });
    }
    
    [HttpDelete("{id}")]
    [Authorize]
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
        project.PublicEncryptedKey = model.PublicEncryptedKey;
        project.PublicKeyIv = model.PublicKeyIv;

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
    public async Task<IActionResult> GetMyProjects()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var projects = await _context.ProjectMembers
            .Where(pm => pm.UserId == userId)
            .Select(pm => new {
                id = pm.Project.Id,
                name = pm.Project.Name,
                iv = pm.Project.Iv,
                isPublic = pm.Project.IsPublic,
                priority = pm.Project.Priority,
                status = pm.Project.Status,
                encryptedProjectKey = pm.EncryptedProjectKey,
                keyIv = pm.Iv 
            })
            .ToListAsync();
        return Ok(projects);
    }
    
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<Project>> GetProject(Guid id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null) return NotFound();
        
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId != null) 
        {
            var memberInfo = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == id && pm.UserId == userId);

            if (memberInfo != null)
            {
                return Ok(new {
                    id = project.Id,
                    name = project.Name,
                    iv = project.Iv,
                    isPublic = project.IsPublic,
                    priority = project.Priority, 
                    status = project.Status,
                    encryptedProjectKey = memberInfo.EncryptedProjectKey,
                    keyIv = memberInfo.Iv,
                    role = memberInfo.Role
                });
            }
        }
        
        if (!project.IsPublic)
        {
            return Unauthorized();
        }

        return Ok(new {
            id = project.Id,
            name = project.Name,
            iv = project.Iv,
            isPublic = true,
            priority = project.Priority,
            status = project.Status,
            encryptedProjectKey = project.PublicEncryptedKey, 
            keyIv = project.PublicKeyIv, 
            role = "Viewer"
        });
    }
    
    [HttpPost("{projectId}/members")]
    [Authorize]
    public async Task<IActionResult> AddMember(Guid projectId, [FromBody] AddMemberDto model)
    {
        var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var isOwner = await _context.ProjectMembers
            .AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == ownerId && pm.Role == "Owner");

        if (!isOwner) return Forbid("Только владелец может добавлять участников");

        var targetUser = await _userManager.FindByEmailAsync(model.UserEmail);
        if (targetUser == null) return NotFound("Пользователь не найден");

        var member = new ProjectMember {
            ProjectId = projectId,
            UserId = targetUser.Id,
            EncryptedProjectKey = model.EncryptedProjectKey,
            Iv = model.Iv,
            Role = model.Role
        };

        _context.ProjectMembers.Add(member);
        await _context.SaveChangesAsync();

        return Ok();
    }
    
    [HttpGet("{projectId}/members")]
    [Authorize]
    public async Task<IActionResult> GetMembers(Guid projectId)
    {
        var members = await _context.ProjectMembers
            .Where(pm => pm.ProjectId == projectId)
            .Select(pm => new {
                userId = pm.UserId,
                email = pm.User.Email,
                role = pm.Role,
                isMe = pm.UserId == User.FindFirstValue(ClaimTypes.NameIdentifier)
            })
            .ToListAsync();
        return Ok(members);
    }
    
    [HttpDelete("{projectId}/members/{userId}")]
    [Authorize]
    public async Task<IActionResult> RemoveMember(Guid projectId, string userId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var isOwner = await _context.ProjectMembers.AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == currentUserId && pm.Role == "Owner");
        if (!isOwner && currentUserId != userId) return Forbid();

        var member = await _context.ProjectMembers.FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
        if (member == null) return NotFound();
        if (member.Role == "Owner") return BadRequest("Нельзя удалить владельца");

        _context.ProjectMembers.Remove(member);
        await _context.SaveChangesAsync();
        return Ok();
    }
    
    [HttpPatch("{projectId}/members/{userId}/role")]
    [Authorize]
    public async Task<IActionResult> UpdateRole(Guid projectId, string userId, [FromBody] string newRole)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isOwner = await _context.ProjectMembers.AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == currentUserId && pm.Role == "Owner");
        if (!isOwner) return Forbid();

        var member = await _context.ProjectMembers.FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
        if (member == null) return NotFound();

        member.Role = newRole;
        await _context.SaveChangesAsync();
        return Ok();
    }
}
