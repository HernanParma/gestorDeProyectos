using Aplication.Interfaces;
using Infraestructure.Repositories;
using Infraestructure.Services;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using Aplication.Interfaces;
using Aplication.Services;
using Aplication.Factory;
using Aplication.Mappers;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Debug);
// Configurar Controllers con manejo de ciclos
builder.Services.AddControllers()
    .AddJsonOptions(x =>
        x.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);
});

// CORS (una sola vez y política clara)
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTodo", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Custom services
builder.Services.AddScoped<IProjectApprovalStepRepository, ProjectApprovalStepRepository>();
builder.Services.AddScoped<IProjectApprovalRepository, ProjectApprovalRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IApprovalRuleRepository, ApprovalRuleRepository>();
builder.Services.AddScoped<IProjectProposalService, ProjectProposalService>();
builder.Services.AddScoped<IAreaService, AreaService>();
builder.Services.AddScoped<IApproverRoleService, ApproverRoleService>();
builder.Services.AddScoped<IProjectTypeService, ProjectTypeService>();
builder.Services.AddScoped<IApprovalStatusService, ApprovalStatusService>();
// Servicios internos de aplicación
builder.Services.AddScoped<IProjectFactory, ProjectFactory>();
builder.Services.AddScoped<IApprovalStepBuilder, ApprovalStepBuilder>();
builder.Services.AddScoped<IProjectMapper, ProjectMapper>();

// DB Context
var connectionString = builder.Configuration["ConnectionString"];
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("PermitirTodo"); // tiene que coincidir con AddCors

app.UseAuthorization();

app.MapControllers();

app.Run();
