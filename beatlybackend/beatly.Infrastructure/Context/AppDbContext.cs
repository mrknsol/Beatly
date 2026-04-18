using Microsoft.EntityFrameworkCore;
using Beatly.Core.Entities;

namespace Beatly.Infrastructure.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Track> Tracks => Set<Track>();
    public DbSet<Playlist> Playlists => Set<Playlist>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Playlist>()
        .HasOne(p => p.User)
        .WithMany(u => u.MyPlaylists)
        .HasForeignKey(p => p.UserId)
        .OnDelete(DeleteBehavior.Cascade); 

        modelBuilder.Entity<Playlist>()
            .HasMany(p => p.Tracks)
            .WithMany(t => t.Playlists)
            .UsingEntity(j => j.ToTable("PlaylistTracks")); 

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}