using Microsoft.OpenApi.Models;
using QuickBooksIntegration.Repositories.Interfaces;
using QuickBooksIntegration.Repositories.Implementations;
using QuickBooksIntegration.Services;

var builder = WebApplication.CreateBuilder(args);

// =========================
// SERVICES
// =========================

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "QuickBooks Integration API",
        Version = "v1",
        Description = "OAuth + CRUD (Customer, Item, Invoice)"
    });

    // Optional: Add Bearer support (future use)
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your_token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
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

// Custom Services
builder.Services.AddSingleton<oAuthService>();
builder.Services.AddSingleton<quickBooksService>();
builder.Services.AddSingleton<ITokenRepository, TokenRepository>();
builder.Services.AddSingleton<IQuickBooksRepository, QuickBooksRepository>();

// =========================
// BUILD APP
// =========================

var app = builder.Build();

// =========================
// MIDDLEWARE
// =========================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "QuickBooks API v1");
        c.RoutePrefix = string.Empty; // Swagger opens at root
    });
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// =========================
// RUN
// =========================

app.Run();