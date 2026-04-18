using Beatly.Infrastructure.Context;
using Beatly.Application.Interfaces;
using Beatly.Application.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddHttpClient<IMusicService, MusicService>();

var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true
    };
});

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseCors("AllowAll");

// In Development, skip HTTPS redirect: mobile clients use http://host:5289/api/... and a redirect
// to https://localhost:7060 often breaks or surfaces misleading 404s.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

// Stream URL as minimal APIs — avoids MVC attribute routes that returned empty 404 on this host.
async Task<IResult> MusicStreamHandler(string? id, string? source, int? br, IMusicService music)
{
    var src = string.IsNullOrWhiteSpace(source) ? "netease" : source;
    var bitrate = br is > 0 ? br.Value : 128;
    if (string.IsNullOrWhiteSpace(id))
        return Results.BadRequest(new { error = "Query parameter id is required" });
    try
    {
        var streamUrl = await music.ResolvePlayUrlAsync(id, src, bitrate);
        if (string.IsNullOrWhiteSpace(streamUrl))
        {
            return Results.Ok(new
            {
                url = (string?)null,
                error = "No stream URL for this track. Try another song or switch search source (NetEase / Tencent / Kuwo) in the Search tab."
            });
        }
        return Results.Ok(new { url = streamUrl });
    }
    catch (InvalidOperationException ex)
    {
        return Results.Json(new { error = ex.Message }, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
}

app.MapGet("/api/Music/stream", MusicStreamHandler).AllowAnonymous();
app.MapGet("/api/Music/play-url", MusicStreamHandler).AllowAnonymous();
app.MapGet("/api/Music/url", MusicStreamHandler).AllowAnonymous();

app.MapControllers();

app.Run();