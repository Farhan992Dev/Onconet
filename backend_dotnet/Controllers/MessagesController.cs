using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Onconet.Web.Models;
using Onconet.Web.Services;
using Onconet.Web.Controllers.Dtos;

namespace Onconet.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPanelAuthorizationService _authorizationService;

    public MessagesController(ApplicationDbContext context, IPanelAuthorizationService authorizationService)
    {
        _context = context;
        _authorizationService = authorizationService;
    }

    [HttpGet]
    [Authorize(Policy = "PanelUser")]
    [EnableRateLimiting("Admin")]
    public async Task<ActionResult<IEnumerable<MessageResponse>>> GetMessages()
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.MessagesRead))
        {
            return Forbid();
        }

        var messages = await _context.Messages.ToListAsync();
        return messages.Select(m => MapToMessageResponse(m)).ToList();
    }

    [HttpPost("submit")]
    [EnableRateLimiting("SubmitLimit")]
    public async Task<ActionResult<MessageResponse>> SubmitMessage([FromBody] MessageSubmitDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Mobile))
        {
            return BadRequest(new { Message = "وارد کردن نام و شماره تماس الزامی است." });
        }

        var newMessage = new DbMessage
        {
            Name = dto.Name,
            Mobile = dto.Mobile,
            Subject = dto.Subject ?? "تماس عمومی",
            Content = dto.Content ?? "",
            Date = DateTime.Now.ToString("yyyy/MM/dd")
        };

        _context.Messages.Add(newMessage);
        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = MapToMessageResponse(newMessage) });
    }

    [HttpPost]
    [Authorize(Policy = "PanelUser")]
    [EnableRateLimiting("Sensitive")]
    public async Task<IActionResult> SyncMessages([FromBody] List<MessageSyncDto> incomingMessages)
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.MessagesDelete))
        {
            return Forbid();
        }

        return await BulkSync(incomingMessages);
    }

    [HttpPost("bulk-sync")]
    [Authorize(Policy = "PanelUser")]
    [EnableRateLimiting("Sensitive")]
    public async Task<IActionResult> BulkSync([FromBody] List<MessageSyncDto> incomingMessages)
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.MessagesDelete))
        {
            return Forbid();
        }

        if (incomingMessages == null)
        {
            return BadRequest(new { Message = "لیست پیام‌ها خالی است." });
        }

        var existing = await _context.Messages.ToListAsync();
        _context.Messages.RemoveRange(existing);

        foreach (var dto in incomingMessages)
        {
            _context.Messages.Add(new DbMessage
            {
                Name = dto.Name,
                Mobile = dto.Mobile,
                Subject = dto.Subject,
                Content = dto.Content,
                Date = dto.Date ?? DateTime.Now.ToString("yyyy/MM/dd")
            });
        }

        await _context.SaveChangesAsync();
        return Ok(new { Success = true, Count = incomingMessages.Count });
    }

    private static MessageResponse MapToMessageResponse(DbMessage m)
    {
        return new MessageResponse
        {
            Id = m.Id,
            Name = m.Name,
            Mobile = m.Mobile,
            Subject = m.Subject,
            Content = m.Content,
            Date = m.Date
        };
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "PanelUser")]
    [EnableRateLimiting("Sensitive")]
    public async Task<IActionResult> DeleteMessage(int id)
    {
        if (!await _authorizationService.HasActionAsync(User, PanelActionKeys.MessagesDelete))
        {
            return Forbid();
        }

        var msg = await _context.Messages.FindAsync(id);
        if (msg == null)
        {
            return NotFound(new { Message = "پیام مورد نظر جهت حذف یافت نشد." });
        }

        _context.Messages.Remove(msg);
        await _context.SaveChangesAsync();

        return Ok(new { Success = true, Message = "پیام با موفقیت حذف شد." });
    }
}
