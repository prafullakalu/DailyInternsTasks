using Microsoft.EntityFrameworkCore;
using CleanApiProject.Models;

namespace CleanApiProject.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Item> Items { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");

            entity.HasKey(u => u.Id);

            entity.Property(u => u.Id)
                  .UseIdentityColumn();

            entity.Property(u => u.Name)
                  .IsRequired()
                  .HasMaxLength(100);

            entity.Property(u => u.Email)
                  .IsRequired()
                  .HasMaxLength(200);

            entity.HasIndex(u => u.Email)
                  .IsUnique();

            entity.Property(u => u.Password)
                  .IsRequired()
                  .HasMaxLength(500);

            entity.Property(u => u.Role)
                  .IsRequired()
                  .HasMaxLength(50)
                  .HasDefaultValue("User");

            entity.Property(u => u.LastRoleUpdate)
                  .IsRequired()
                  .HasColumnType("datetime2")
                  .HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<Item>(entity =>
        {
            entity.ToTable("Items");

            entity.HasKey(i => i.Id);

            entity.Property(i => i.Id)
                  .UseIdentityColumn();

            entity.Property(i => i.Name)
                  .IsRequired()
                  .HasMaxLength(200);

            entity.Property(i => i.Price)
                  .IsRequired()
                  .HasColumnType("decimal(18,2)");
        });
    }
}