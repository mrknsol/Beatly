namespace Beatly.Core.Entities;

public class Track {
    public Guid Id { get; set;} = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Artist { get; set; } = string.Empty;
    public string AudioUrl { get; set; } = string.Empty; 
    public string? CoverUrl { get; set; } 
    public TimeSpan Duration { get; set; }
    
    public List<Playlist> Playlists { get; set; } = new();
}