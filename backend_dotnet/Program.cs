using System.Text;
using System.Linq;
using System.Text.Json;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Onconet.Web.Models;
using Onconet.Web.Services;
using Onconet.Web.Filters;
using Onconet.Web.Middleware;

var builder = WebApplication.CreateBuilder(args);

// 1. اضافه کردن تنظیمات پایگاه داده MySQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connStr = builder.Configuration.GetConnectionString("DefaultConnection")
                  ?? "server=localhost;port=3306;database=pink_breast_health;user=root;password=my-secret-pw;";
    options.UseMySql(connStr, ServerVersion.AutoDetect(connStr));
});

// 2. ساخت خدمات کش Redis برای توکن‌های OTP
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("RedisConnection") ?? "localhost:6379";
    options.InstanceName = "pinkbreast:";
});

// 3. تزریق وابستگی‌های سرویس‌های متمرکز
builder.Services.AddScoped<ISmsService, KavenegarSmsService>();
builder.Services.AddScoped<ISmsSender, FakeSmsSender>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<ICacheService, RedisCacheService>();
builder.Services.AddScoped<IPanelAuthorizationService, PanelAuthorizationService>();

// AI SEO Service - switch between FakeAiSeoService and OpenRouterAiSeoService
builder.Services.AddHttpClient<IAiSeoService, OpenRouterAiSeoService>();
// Alternative: builder.Services.AddScoped<IAiSeoService, FakeAiSeoService>();
builder.Services.AddMemoryCache();
builder.Services
    .AddIdentityCore<DbUser>(options =>
    {
        options.Password.RequireDigit = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 4;
    })
    .AddRoles<DbRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager();

// 4. پیکربندی احراز هویت با استفاده از JWT Bearer
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Secret"] ?? "PinkBreastSecretKeyVeryLongNeedString32Bytes!");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(secretKey),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "onconet",
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"] ?? "PortalClients",
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("PanelUser", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireClaim("user_type", "panel");
       
    });

    options.AddPolicy("SiteUser", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireClaim("user_type", "site");
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;

    // Global chained limiter: Concurrency(50) + FixedWindow(200/min) for all endpoints
    var globalConcurrency = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetConcurrencyLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new ConcurrencyLimiterOptions { PermitLimit = 50, QueueLimit = 10 }));
    var globalFixedWindow = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = 200, Window = TimeSpan.FromMinutes(1), QueueLimit = 20 }));
    options.GlobalLimiter = PartitionedRateLimiter.CreateChained(globalConcurrency, globalFixedWindow);

    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        var response = JsonSerializer.Serialize(
            ApiResponseHelpers.Fail("تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً مدتی صبر کنید."),
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        await context.HttpContext.Response.WriteAsync(response, cancellationToken);
    };

    // Public read endpoints: FixedWindow 30/min
    options.AddFixedWindowLimiter("Public", opt =>
    {
        opt.PermitLimit = 30;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 5;
    });

    // Public form submit: SlidingWindow 5/30s
    options.AddSlidingWindowLimiter("SubmitLimit", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromSeconds(30);
        opt.SegmentsPerWindow = 3;
        opt.QueueLimit = 2;
    });

    // Auth: SlidingWindow(5/min, 4 segments) — combined with GlobalLimiter (Concurrency + FixedWindow)
    options.AddSlidingWindowLimiter("Auth", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.SegmentsPerWindow = 4;
        opt.QueueLimit = 2;
    });

    // User profile/logs: TokenBucket 60 tokens, 10/sec refill
    options.AddTokenBucketLimiter("User", opt =>
    {
        opt.TokenLimit = 60;
        opt.ReplenishmentPeriod = TimeSpan.FromSeconds(10);
        opt.TokensPerPeriod = 10;
        opt.QueueLimit = 5;
    });

    // Admin CRUD: TokenBucket 120 tokens, 20/sec refill
    options.AddTokenBucketLimiter("Admin", opt =>
    {
        opt.TokenLimit = 120;
        opt.ReplenishmentPeriod = TimeSpan.FromSeconds(20);
        opt.TokensPerPeriod = 20;
        opt.QueueLimit = 10;
    });

    // Bulk/delete operations: Concurrency 1
    options.AddConcurrencyLimiter("Sensitive", opt =>
    {
        opt.PermitLimit = 1;
        opt.QueueLimit = 0;
    });
});

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ApiResponseFilter>();
});

// 5. ایجاد تنظیمات مستندسازی API با Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "پورتال ملی سلامت پستان صورتی (Pink Breast)", 
        Version = "v1",
        Description = "سرویس‌های سمت سرور مدیریت متادیتا، عضویت کادر درمان و پنل غربالگری بیماران"
    });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "لطفا توکن Bearer دوجانبه را وارد نمایید. مثال: 'Bearer [Token]'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ممانعت از ایجاد خطای CORS در برقراری ارتباط با فرانت-اند
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpankFront", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseExceptionHandling();

////// ایجاد دیتابیس در اولین اجرا
//using (var scope = app.Services.CreateScope())
//{
//    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<DbUser>>();
//    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<DbRole>>();
 

//    if (!db.ActionPermissions.Any())
//    {
//        db.ActionPermissions.AddRange(
//            new DbActionPermission { ActionKey = PanelActionKeys.All, Description = "Full access" },
//            new DbActionPermission { ActionKey = PanelActionKeys.ArticlesRead, Description = "Read articles" },
//            new DbActionPermission { ActionKey = PanelActionKeys.ArticlesWrite, Description = "Create/Update articles" },
//            new DbActionPermission { ActionKey = PanelActionKeys.ArticlesDelete, Description = "Delete articles" },
//            new DbActionPermission { ActionKey = PanelActionKeys.SeoManage, Description = "Manage SEO" },
//            new DbActionPermission { ActionKey = PanelActionKeys.MessagesRead, Description = "Read messages" },
//            new DbActionPermission { ActionKey = PanelActionKeys.MessagesDelete, Description = "Delete messages" },
//            new DbActionPermission { ActionKey = PanelActionKeys.UsersManage, Description = "Manage users" },
//            new DbActionPermission { ActionKey = PanelActionKeys.RolesManage, Description = "Manage roles" }
//        );
//        db.SaveChanges();
//    }

//    if (!db.Roles.Any())
//    {
//        await roleManager.CreateAsync(new DbRole { Name = "super_admin", DisplayName = "مدیر ارشد", UserType = "panel", IsSystem = true, NormalizedName = "SUPER_ADMIN" });
//        await roleManager.CreateAsync(new DbRole { Name = "editor", DisplayName = "ویرایشگر", UserType = "panel", IsSystem = true, NormalizedName = "EDITOR" });
//    }

//    if (!db.Users.Any())
//    {
//        var admin = new DbUser
//        {
//            UserName = "09121112233",
//            PhoneNumber = "09121112233",
//            PhoneNumberConfirmed = true,
//            FullName = "دکتر جلال علوی (رئیس هیئت امنا بنیاد)",
//            Role = "super_admin",
//            UserType = "panel",
//            Specialization = "جراح عمومی پستان"
//        };
//        var editor = new DbUser
//        {
//            UserName = "09124445566",
//            PhoneNumber = "09124445566",
//            PhoneNumberConfirmed = true,
//            FullName = "دکتر مینو رضازاده (سردبیر هیئت تحریریه)",
//            Role = "editor",
//            UserType = "panel",
//            Specialization = "نویسنده پزشکی"
//        };

//        await userManager.CreateAsync(admin, "admin");
//        await userManager.CreateAsync(editor, "editor");
//        await userManager.AddToRoleAsync(admin, "super_admin");
//        await userManager.AddToRoleAsync(editor, "editor");
//    }

//    var adminRole = db.Roles.First(x => x.Name == "super_admin");
//    var editorRole = db.Roles.First(x => x.Name == "editor");
//    var allAction = db.ActionPermissions.First(x => x.ActionKey == PanelActionKeys.All);

//    if (!db.RoleActionPermissions.Any(x => x.RoleId == adminRole.Id && x.ActionPermissionId == allAction.Id))
//    {
//        db.RoleActionPermissions.Add(new DbRoleActionPermission
//        {
//            RoleId = adminRole.Id,
//            ActionPermissionId = allAction.Id
//        });
//        db.SaveChanges();
//    }

//    var editorReadActions = db.ActionPermissions
//        .Where(x => x.ActionKey == PanelActionKeys.ArticlesRead || x.ActionKey == PanelActionKeys.ArticlesWrite || x.ActionKey == PanelActionKeys.MessagesRead)
//        .ToList();

//    foreach (var action in editorReadActions)
//    {
//        if (!db.RoleActionPermissions.Any(x => x.RoleId == editorRole.Id && x.ActionPermissionId == action.Id))
//        {
//            db.RoleActionPermissions.Add(new DbRoleActionPermission
//            {
//                RoleId = editorRole.Id,
//                ActionPermissionId = action.Id
//            });
//        }
//    }
//    db.SaveChanges();

//    var adminUser = db.Users.First(x => x.PhoneNumber == "09121112233");
//    var editorUser = db.Users.First(x => x.PhoneNumber == "09124445566");

//    if (adminUser.UserType != "panel")
//    {
//        adminUser.UserType = "panel";
//    }
//    if (editorUser.UserType != "panel")
//    {
//        editorUser.UserType = "panel";
//    }
//    db.SaveChanges();

//    if (!await userManager.IsInRoleAsync(adminUser, "super_admin"))
//    {
//        await userManager.AddToRoleAsync(adminUser, "super_admin");
//    }
//    if (!await userManager.IsInRoleAsync(editorUser, "editor"))
//    {
//        await userManager.AddToRoleAsync(editorUser, "editor");
//    }
//}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "پورتال صورتی API v1");
        c.RoutePrefix = "swagger"; // باز شدن مستقیم داک از طریق http://localhost:[Port]/swagger
    });
}

app.UseCors("AllowSpankFront");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
