using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Onconet.Web.Models;

public class ApplicationDbContext : IdentityDbContext<DbUser, DbRole, int>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<DbArticle> Articles { get; set; } = null!;
    public DbSet<DbPageSEO> SeoSettings { get; set; } = null!;
    public DbSet<DbMessage> Messages { get; set; } = null!;
    public DbSet<DbUserProfile> PatientProfiles { get; set; } = null!;
    public DbSet<DbPatientLog> PatientLogs { get; set; } = null!;
    public DbSet<DbActionPermission> ActionPermissions { get; set; } = null!;
    public DbSet<DbRoleActionPermission> RoleActionPermissions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<DbUser>().Property(x => x.PhoneNumber).IsRequired();
        modelBuilder.Entity<DbUser>().HasIndex(x => x.PhoneNumber).IsUnique();
        modelBuilder.Entity<DbRole>().HasIndex(x => x.Name).IsUnique();
        modelBuilder.Entity<DbActionPermission>().HasIndex(x => x.ActionKey).IsUnique();
        modelBuilder.Entity<DbPageSEO>().HasIndex(x => x.PageId).IsUnique();
        modelBuilder.Entity<DbUserProfile>().HasIndex(x => x.Mobile).IsUnique();

        modelBuilder.Entity<DbRoleActionPermission>()
            .HasIndex(x => new { x.RoleId, x.ActionPermissionId })
            .IsUnique();

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var foreignKey in entityType.GetForeignKeys())
            {
                foreignKey.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }

        modelBuilder.Entity<DbPageSEO>().HasData(
            new DbPageSEO
            {
                Id = 1,
                PageId = "home",
                PageName = "صفحه اصلی پورتال صورتی",
                MetaTitle = "سلامت پستان صورتی | مرجع ملی آگاهی سرطان پستان ایران",
                MetaDescription = "پورتال تخصصی و مرجع ملی سرطان پستان بنیاد صورتی با غربالگری هوشمند، وبینارهای آموزشی دوره‌ای و مجمع علمی پزشکان کشور.",
                FocusKeywords = "سرطان پستان, پیشگیری سرطان, غربالگری سرطان پستان رایگان, ماموگرافی تهران",
                CanonicalUrl = "https://pinkbreast.ir",
                OgTitle = "بنیاد ملی آگاهی و سلامت پستان ایران (صورتی)",
                OgDescription = "مرجع ملی آگاهی سرطان پستان، آموزش خودارزیابی و غربالگری دوره ای.",
                SiteMapPriority = "1.0"
            }
        );
    }
}
