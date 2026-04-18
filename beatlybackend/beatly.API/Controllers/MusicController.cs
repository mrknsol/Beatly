using Beatly.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Beatly.API.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/[controller]")]
public class MusicController : ControllerBase
{
    private readonly IMusicService _musicService;
    public MusicController(IMusicService musicService)
    {
        _musicService = musicService;
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string q,
        [FromQuery] string source = "netease",
        [FromQuery] bool merge = false)
    {
        if (string.IsNullOrWhiteSpace(q)) return BadRequest("Query cannot be empty");

        try
        {
            var results = await _musicService.SearchTracksAsync(q, source, merge);
            return Ok(results);
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { error = ex.Message });
        }
    }
}
