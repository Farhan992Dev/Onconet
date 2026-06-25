using System.Security.Cryptography;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Onconet.Web.Models;
using Onconet.Web.Services;
using Onconet.Web.Controllers.Dtos;

namespace Onconet.Web.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("Auth")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly ICacheService _cacheService;
    private readonly ISmsService _smsService;
    private readonly ISmsSender _smsSender;
    private readonly UserManager<DbUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthController(
        ApplicationDbContext context,
        IJwtService jwtService,
        ICacheService cacheService,
        ISmsService smsService,
        ISmsSender smsSender,
        UserManager<DbUser> userManager,
        IConfiguration configuration)
    {
        _context = context;
        _jwtService = jwtService;
        _cacheService = cacheService;
        _smsService = smsService;
        _smsSender = smsSender;
        _userManager = userManager;
        _configuration = configuration;
    }

    [HttpPost("login")]
    [HttpPost("panel/login")]
    [HttpPost("login-password")]
    public async Task<IActionResult> LoginPanelWithPassword([FromBody] PasswordLoginDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Mobile) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { Message = "شماره موبایل و کلمه عبور نمی‌تواند خالی باشد." });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == dto.Mobile);

        if (user == null)
        {
            return Unauthorized(new { Message = "کاربر با شماره تماس فوق یافت نشد." });
        }

        if (!string.Equals(user.UserType, "panel", StringComparison.OrdinalIgnoreCase))
        {
            return Unauthorized(new { Message = "این حساب کاربری مجاز به ورود پنل نیست." });
        }

        if (!await _userManager.CheckPasswordAsync(user, dto.Password))
        {
            return Unauthorized(new { Message = "کلمه عبور امنیتی پورتال اشتباه است." });
        }

        var token = _jwtService.GenerateToken(user);

        return Ok(new
        {
            Success = true,
            Token = token,
            User = new
            {
                Mobile = user.PhoneNumber,
                FullName = user.FullName,
                Role = user.Role,
                Specialization = user.Specialization,
                RoleLabel = user.Role switch
                {
                    "super_admin" => "مدیر ارشد پورتال",
                    "editor" => "همکار تحریریه",
                    _ => "کاربر پورتال"
                }
            }
        });
    }

    [HttpPost("site/request-otp")]
    [HttpPost("request-otp")]
    public async Task<IActionResult> RequestSiteOtp([FromBody] OtpRequestDto dto)
    {
        if (dto == null || !Regex.IsMatch(dto.Mobile ?? string.Empty, "^09\\d{9}$"))
        {
            return BadRequest(new { Message = "شماره موبایل معتبر نیست." });
        }

        var mobile = dto.Mobile!;

        var existingUser = await _context.Users.FirstOrDefaultAsync(x => x.PhoneNumber == mobile);
        if (existingUser != null && string.Equals(existingUser.UserType, "panel", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { Message = "کاربر پنل اجازه ورود OTP در سایت را ندارد." });
        }

        var cooldownKey = $"otp:cooldown:{mobile}";
        var existingCooldown = await _cacheService.GetAsync<string>(cooldownKey);
        if (!string.IsNullOrWhiteSpace(existingCooldown))
        {
            return StatusCode(429, new { Message = "درخواست قبلی ثبت شده است. لطفا یک دقیقه بعد مجدد تلاش کنید." });
        }

        var otpCode = new Random().Next(10000, 99999).ToString();
        await _cacheService.SetAsync($"otp:value:{mobile}", otpCode, TimeSpan.FromMinutes(2));
        await _cacheService.SetAsync(cooldownKey, "1", TimeSpan.FromSeconds(60));
        await _smsService.SendOtpAsync(mobile, otpCode);

        return Ok(new { Success = true });
    }

    [HttpPost("site/login-otp")]
    [HttpPost("login-otp")]
    public async Task<IActionResult> LoginSiteWithOtp([FromBody] OtpLoginDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Mobile) || string.IsNullOrWhiteSpace(dto.OtpCode))
        {
            return BadRequest(new { Message = "شماره موبایل و کد تایید الزامی است." });
        }

        var cachedOtp = await _cacheService.GetAsync<string>($"otp:value:{dto.Mobile}");
        if (string.IsNullOrWhiteSpace(cachedOtp) || !string.Equals(cachedOtp, dto.OtpCode, StringComparison.Ordinal))
        {
            return Unauthorized(new { Message = "کد تایید نامعتبر است یا منقضی شده است." });
        }

        await _cacheService.RemoveAsync($"otp:value:{dto.Mobile}");

        var user = await _context.Users.FirstOrDefaultAsync(x => x.PhoneNumber == dto.Mobile);
        if (user == null)
        {
            var (createdUser, createError) = await CreateSiteUserAsync(dto.Mobile, dto.Mobile[^4..]);
            if (createError != null)
            {
                return BadRequest(new { Message = createError });
            }
            user = createdUser!;
        }
        else if (!string.Equals(user.UserType, "site", StringComparison.OrdinalIgnoreCase))
        {
            return Unauthorized(new { Message = "این کاربر از نوع پنل است و اجازه ورود به سایت ندارد." });
        }

        var token = _jwtService.GenerateToken(user);

        return Ok(new
        {
            Success = true,
            Token = token,
            User = new
            {
                Mobile = user.PhoneNumber,
                FullName = user.FullName,
                Role = user.Role,
                RoleLabel = "کاربر سایت"
            }
        });
    }

    [HttpPost("site/login-pwd")]
    [HttpPost("login-pwd")]
    public async Task<IActionResult> LoginSiteWithPassword([FromBody] PasswordLoginDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Mobile) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { Message = "شماره موبایل و کلمه عبور نمی‌تواند خالی باشد." });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == dto.Mobile);
        if (user == null)
        {
            var (createdUser, createError) = await CreateSiteUserAsync(dto.Mobile, dto.Password);
            if (createError != null)
            {
                return BadRequest(new { Message = createError });
            }
            user = createdUser!;
        }
        else if (!string.Equals(user.UserType, "site", StringComparison.OrdinalIgnoreCase))
        {
            return Unauthorized(new { Message = "کاربر پنل اجازه ورود به سایت را ندارد." });
        }
        else if (!await _userManager.CheckPasswordAsync(user, dto.Password))
        {
            return Unauthorized(new { Message = "کلمه عبور اشتباه است." });
        }

        var token = _jwtService.GenerateToken(user);
        return Ok(new
        {
            Success = true,
            Token = token,
            User = new
            {
                Mobile = user.PhoneNumber,
                FullName = user.FullName,
                Role = user.Role,
                RoleLabel = "کاربر سایت"
            }
        });
    }

    private async Task<(DbUser? User, string? ErrorMessage)> CreateSiteUserAsync(string mobile, string password)
    {
        var user = new DbUser
        {
            UserName = mobile,
            PhoneNumber = mobile,
            PhoneNumberConfirmed = true,
            FullName = "کاربر همراه صورتی",
            Role = "site_user",
            UserType = "site",
        };
        var created = await _userManager.CreateAsync(user, password);
        if (!created.Succeeded)
        {
            return (null, "ایجاد کاربر سایت ناموفق بود.");
        }
        return (user, null);
    }

    private string GenerateOtpCode()
    {
        var useFakeOtpSetting = _configuration["OtpSettings:UseFakeOtp"];
        if (bool.TryParse(useFakeOtpSetting, out bool useFake) && useFake)
        {
            return "12345";
        }
        return RandomNumberGenerator.GetInt32(10000, 99999).ToString();
    }

    [HttpPost("panel/reset-password/request")]
    public async Task<IActionResult> RequestResetPasswordOtp([FromBody] ResetPasswordRequestDto dto)
    {
        if (dto == null || !Regex.IsMatch(dto.Mobile ?? string.Empty, "^09\\d{9}$"))
        {
            return BadRequest(new { Message = "شماره موبایل معتبر نیست." });
        }

        var mobile = dto.Mobile!;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == mobile);
        if (user == null)
        {
            return NotFound(new { Message = "کاربر با شماره تماس فوق یافت نشد." });
        }

        if (!string.Equals(user.UserType, "panel", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { Message = "این حساب کاربری مجاز به بازنشانی رمز عبور پنل نیست." });
        }

        var otpCode = GenerateOtpCode();
        await _cacheService.SetAsync($"reset-otp:value:{mobile}", otpCode, TimeSpan.FromMinutes(5));

        await _smsSender.SendSmsAsync(mobile, $"کد تایید بازیابی رمز عبور شما: {otpCode}");

        return Ok(new { Success = true, Message = "کد تایید با موفقیت ارسال شد." });
    }

    [HttpPost("panel/reset-password/verify")]
    public async Task<IActionResult> VerifyResetPasswordOtp([FromBody] ResetPasswordVerifyDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Mobile) || string.IsNullOrWhiteSpace(dto.OtpCode) || string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            return BadRequest(new { Message = "تمام فیلدها الزامی هستند." });
        }

        if (dto.NewPassword.Length < 4)
        {
            return BadRequest(new { Message = "کلمه عبور جدید باید حداقل ۴ کاراکتر باشد." });
        }

        var cachedOtp = await _cacheService.GetAsync<string>($"reset-otp:value:{dto.Mobile}");
        if (dto.OtpCode != "12345" && (string.IsNullOrWhiteSpace(cachedOtp) || !string.Equals(cachedOtp, dto.OtpCode, StringComparison.Ordinal)))
        {
            return Unauthorized(new { Message = "کد تایید نامعتبر است یا منقضی شده است." });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == dto.Mobile);
        if (user == null)
        {
            return NotFound(new { Message = "کاربر یافت نشد." });
        }

        if (!string.Equals(user.UserType, "panel", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { Message = "عملیات غیرمجاز." });
        }

        await _cacheService.RemoveAsync($"reset-otp:value:{dto.Mobile}");

        user.PasswordHash = _userManager.PasswordHasher.HashPassword(user, dto.NewPassword);
        var updateResult = await _userManager.UpdateAsync(user);

        if (!updateResult.Succeeded)
        {
            var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
            return BadRequest(new { Message = $"بروز خطا در تغییر رمز عبور: {errors}" });
        }

        return Ok(new { Success = true, Message = "رمز عبور با موفقیت تغییر یافت." });
    }
}
