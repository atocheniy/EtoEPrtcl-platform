using ASP_Server.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ASP_Server.Data;
using ASP_Server.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace ASP_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _config;
        private readonly ApplicationDbContext _context;

        public AuthController(UserManager<ApplicationUser> userManager, IConfiguration config, ApplicationDbContext context)
        {
            _userManager = userManager;
            _config = config;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterInfo model)
        {
            var user = new ApplicationUser { UserName = model.Email, Email = model.Email, FullName = model.FullName, SigningPublicKey = model.SigningPublicKey, EncryptedSigningPrivateKey = model.EncryptedSigningPrivateKey, SigningKeyIv = model.SigningKeyIv, ExchangePublicKey = model.ExchangePublicKey, EncryptedExchangePrivateKey = model.EncryptedExchangePrivateKey, ExchangeKeyIv = model.ExchangeKeyIv, SignSalt = model.SignSalt, Theme = model.Theme};
            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded) return Ok(new { message = "Регистрация успешна" });

            return BadRequest(result.Errors);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginInfo model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                return Ok(new { 
                    token = GenerateJwtToken(user),
                    
                    encryptedSigningPrivateKey = user.EncryptedSigningPrivateKey,
                    signingKeyIv = user.SigningKeyIv,
                    
                    encryptedExchangePrivateKey = user.EncryptedExchangePrivateKey,
                    exchangeKeyIv = user.ExchangeKeyIv,
                    
                    salt = user.SignSalt
                }); 
            }

            return Unauthorized("Неверный логин или пароль");
        }
        
        [HttpPatch("colors")]
        [Authorize]
        public async Task<IActionResult> UpdateColors([FromBody] UpdateColorsDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _context.Users.FindAsync(userId);
    
            if (user == null) return NotFound();

            user.OrbColor1 = model.Color1;
            user.OrbColor2 = model.Color2;

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPatch("theme")]
        [Authorize]
        public async Task<IActionResult> UpdateTheme([FromBody] UpdateThemeDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null) return NotFound();

            user.Theme = model.Theme;
            
            await _context.SaveChangesAsync();
            return Ok();
        }
        
        [HttpPost("change-name")]
        [Authorize]
        [SignatureRequired]
        public async Task<IActionResult> ChangeName([FromBody] UpdateNameDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null) return NotFound("Пользователь не найден");

            user.FullName = model.NewName;
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded) return Ok(new { message = "Имя успешно обновлено", fullName = user.FullName });
            return BadRequest(result.Errors);
        }


        [HttpPost("change-email")]
        [Authorize]
        [SignatureRequired]
        public async Task<IActionResult> ChangeEmail([FromBody] UpdateEmailDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null) return NotFound("Пользователь не найден");
            
            var existingUser = await _userManager.FindByEmailAsync(model.NewEmail);
            if (existingUser != null && existingUser.Id != userId) return BadRequest("Данная почта уже используется другим пользователем");
            
            user.Email = model.NewEmail;
            user.UserName = model.NewEmail; 
            
            user.NormalizedEmail = model.NewEmail.ToUpper();
            user.NormalizedUserName = model.NewEmail.ToUpper();

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                var newToken = GenerateJwtToken(user);
                return Ok(new { 
                    message = "Почта обновлена", 
                    token = newToken,
                    email = user.Email 
                });
            }

            return BadRequest(result.Errors);
        }
        
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return NotFound();

            return Ok(new { 
                email = user.Email, 
                fullName = user.FullName,
                orbColor1 = user.OrbColor1,
                orbColor2 = user.OrbColor2,
                theme = user.Theme,
            });
        }
        
        [HttpGet("search")]
        [Authorize]
        public async Task<IActionResult> SearchUser(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return NotFound("Пользователь не найден");

            return Ok(new { 
                id = user.Id, 
                email = user.Email, 
                exchangePublicKey = user.ExchangePublicKey
            });
        }

        private string GenerateJwtToken(ApplicationUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("FullName", user.FullName ?? "")            
            };

            var keyString = _config["Jwt:SigningKey"];

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var issuer = _config["Jwt:Site"];
            var audience = _config["Jwt:Site"];

            var expiryInDays = Convert.ToDouble(_config["Jwt:ExpiryInDays"] ?? "30");
            
            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(expiryInDays),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class RegisterInfo
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        
        public string SigningPublicKey { get; set; }
        public string EncryptedSigningPrivateKey { get; set; }
        public string SigningKeyIv { get; set; }
        
        public string ExchangePublicKey { get; set; }
        public string EncryptedExchangePrivateKey { get; set; }
        public string ExchangeKeyIv { get; set; }
        
        public string SignSalt { get; set; }
        
        public ApplicationTheme  Theme { get; set; }
    }

    public class  LoginInfo
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
    
    public class UpdateNameDto
    {
        public string NewName { get; set; } = string.Empty;
    }

    public class UpdateEmailDto
    {
        public string NewEmail { get; set; } = string.Empty;
    }
    
    public class UpdateThemeDto
    {
        public ApplicationTheme Theme { get; set; } = ApplicationTheme.Auto;
    }
}
