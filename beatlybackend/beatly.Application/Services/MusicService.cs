using System.Net.Http;
using System.Text.Json;
using Beatly.Application.DTOs;
using Beatly.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Beatly.Application.Services;

public class MusicService : IMusicService
{
    public readonly HttpClient _httpClient;
    private readonly string _proxyBase;

    public MusicService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _proxyBase = (configuration["MetingProxy:BaseUrl"] ?? "http://localhost:3000").TrimEnd('/');
    }

    public async Task<IEnumerable<SearchTrackDto>> SearchTracksAsync(string query, string source = "netease", bool mergeSources = false)
    {
        if (mergeSources)
            return await SearchMergedAsync(query.Trim());

        return await SearchSingleAsync(query.Trim(), source);
    }

    private async Task<List<SearchTrackDto>> SearchSingleAsync(string query, string source)
    {
        var json = await FetchSearchJsonAsync(query, source, 30);
        using var doc = JsonDocument.Parse(json);
        if (doc.RootElement.ValueKind != JsonValueKind.Array)
            return [];

        return doc.RootElement.EnumerateArray().Select(ParseTrack).OfType<SearchTrackDto>().ToList();
    }

    /// <summary>
    /// Queries several Meting providers and merges results. For Latin-heavy queries, Tencent/Kuwo are asked first
    /// (often closer to international originals); Chinese-heavy queries start with NetEase.
    /// </summary>
    private async Task<List<SearchTrackDto>> SearchMergedAsync(string query)
    {
        var limit = 14;
        var order = IsLatinHeavyQuery(query)
            ? new[] { "tencent", "kuwo", "netease" }
            : new[] { "netease", "tencent", "kuwo" };

        var batches = await Task.WhenAll(order.Select(s => SearchSingleSourceListAsync(query, s, limit)));
        var flat = batches.SelectMany(x => x).ToList();
        return MergePreferLatinOriginals(flat);
    }

    private async Task<List<SearchTrackDto>> SearchSingleSourceListAsync(string query, string source, int limit)
    {
        try
        {
            var json = await FetchSearchJsonAsync(query, source, limit);
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind != JsonValueKind.Array)
                return [];
            return doc.RootElement.EnumerateArray().Select(ParseTrack).OfType<SearchTrackDto>().ToList();
        }
        catch
        {
            return [];
        }
    }

    private async Task<string> FetchSearchJsonAsync(string query, string source, int limit)
    {
        var url =
            $"{_proxyBase}/search?q={Uri.EscapeDataString(query)}&source={Uri.EscapeDataString(source)}&limit={limit}";
        try
        {
            return await _httpClient.GetStringAsync(url);
        }
        catch (HttpRequestException ex)
        {
            throw new InvalidOperationException(
                "Music proxy is not running. Start it with: cd metly-proxy && node server.mjs (listens on port 3000).",
                ex);
        }
    }

    private static bool IsLatinHeavyQuery(string query)
    {
        var cjk = 0;
        var latin = 0;
        foreach (var c in query)
        {
            if (c >= '\u4E00' && c <= '\u9FFF') cjk++;
            else if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) latin++;
        }
        return latin >= cjk;
    }

    private static List<SearchTrackDto> MergePreferLatinOriginals(List<SearchTrackDto> tracks)
    {
        var best = new Dictionary<string, SearchTrackDto>(StringComparer.OrdinalIgnoreCase);
        foreach (var t in tracks)
        {
            var key = CanonicalKey(t);
            if (!best.TryGetValue(key, out var existing))
            {
                best[key] = t;
                continue;
            }

            var scoreNew = LatinScore(t.Title + " " + t.Artist);
            var scoreOld = LatinScore(existing.Title + " " + existing.Artist);
            if (scoreNew > scoreOld + 0.04)
                best[key] = t;
        }

        return best.Values
            .OrderByDescending(t => LatinScore(t.Title + " " + t.Artist))
            .ThenBy(t => t.Title, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static string CanonicalKey(SearchTrackDto t)
    {
        var firstArtist = t.Artist.Split(',')[0].Trim().ToLowerInvariant();
        return $"{t.Title.Trim().ToLowerInvariant()}|{firstArtist}";
    }

    /// <summary>Share of letters that are basic Latin (A–Z), higher → more likely international listing.</summary>
    private static double LatinScore(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return 0;
        var letters = 0;
        var latinLetters = 0;
        foreach (var c in text)
        {
            if (!char.IsLetter(c)) continue;
            letters++;
            if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) latinLetters++;
        }
        return letters == 0 ? 0 : (double)latinLetters / letters;
    }

    private static SearchTrackDto? ParseTrack(JsonElement t)
    {
        if (t.ValueKind != JsonValueKind.Object)
            return null;

        try
        {
            var id = t.GetProperty("id");
            var externalId = id.ValueKind == JsonValueKind.String ? id.GetString()! : id.GetRawText();
            var name = t.GetProperty("name").GetString() ?? "";
            var artist = FormatArtists(t.GetProperty("artist"));
            var picId = t.TryGetProperty("pic_id", out var p) ? p.GetRawText().Trim('"') : "";
            var sourceVal = t.TryGetProperty("source", out var s) ? (s.GetString() ?? s.GetRawText().Trim('"')) : "";
            var isNetease = sourceVal.Equals("netease", StringComparison.OrdinalIgnoreCase);

            return new SearchTrackDto
            {
                ExternalId = externalId,
                Title = name,
                Artist = artist,
                CoverUrl = string.IsNullOrEmpty(picId) || !isNetease
                    ? null
                    : $"https://music.163.com/api/img/blur/{picId}",
                Source = sourceVal
            };
        }
        catch
        {
            return null;
        }
    }

    private static string FormatArtists(JsonElement artist)
    {
        return artist.ValueKind switch
        {
            JsonValueKind.Array => string.Join(
                ", ",
                artist.EnumerateArray().Select(a =>
                    a.ValueKind == JsonValueKind.String ? a.GetString() ?? "" : a.GetRawText().Trim('"'))),
            JsonValueKind.String => artist.GetString() ?? "",
            _ => artist.GetRawText().Trim('"')
        };
    }

    public async Task<string?> ResolvePlayUrlAsync(string id, string source, int br = 128)
    {
        if (string.IsNullOrWhiteSpace(id)) return null;

        var url =
            $"{_proxyBase}/url?id={Uri.EscapeDataString(id)}&source={Uri.EscapeDataString(source)}&br={br}";

        string json;
        try
        {
            json = await _httpClient.GetStringAsync(url);
        }
        catch (HttpRequestException ex)
        {
            throw new InvalidOperationException(
                "Music proxy is not running. Start it with: cd metly-proxy && node server.mjs (listens on port 3000).",
                ex);
        }

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("error", out _))
            return null;

        if (root.TryGetProperty("url", out var u) && u.ValueKind == JsonValueKind.String)
            return string.IsNullOrWhiteSpace(u.GetString()) ? null : u.GetString();

        if (root.TryGetProperty("Url", out var u2) && u2.ValueKind == JsonValueKind.String)
            return string.IsNullOrWhiteSpace(u2.GetString()) ? null : u2.GetString();

        return null;
    }
}
