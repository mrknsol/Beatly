namespace Beatly.Application.DTOs;

public class SearchTrackDto
{
    public string ExternalId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Artist { get; set; } = string.Empty;
    public string? CoverUrl { get; set; }
    public string Source { get; set; } = string.Empty;
}