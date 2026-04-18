using Beatly.Application.DTOs;

namespace Beatly.Application.Interfaces;

public interface IMusicService
{
    Task<IEnumerable<SearchTrackDto>> SearchTracksAsync(string query, string source = "netease", bool mergeSources = false);
    Task<string?> ResolvePlayUrlAsync(string id, string source, int br = 128);
}
