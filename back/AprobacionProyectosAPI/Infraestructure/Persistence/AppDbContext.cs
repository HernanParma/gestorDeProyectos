using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infraestructure.Data;
using Microsoft.Extensions.Options;
using System.Numerics;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Infraestructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<ApprovalRule> ApprovalRule { get; set; }
        public DbSet<ApprovalStatus> ApprovalStatus { get; set; }
        public DbSet<ApproverRole> ApproverRole { get; set; }
        public DbSet<Area> Area { get; set; }
        public DbSet<ProjectApprovalStep> ProjectApprovalStep { get; set; }
        public DbSet<ProjectProposal> ProjectProposal { get; set; }
        public DbSet<ProjectType> ProjectType { get; set; }
        public DbSet<User> Users { get; set; }
        public AppDbContext() : base() { }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
                optionsBuilder.UseSqlServer(@"Server=localhost;Database=AprobacionProyectos;Trusted_Connection=True;TrustServerCertificate=true;");
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Area
            modelBuilder.Entity<Area>(entity =>
            {
                entity.ToTable("Area");
                entity.HasKey(a => a.Id);
                entity.Property(a => a.Name).HasMaxLength(25);
                // relacion uno a muchos
                entity.HasMany<ApprovalRule>(a => a.ApprovalRules).WithOne(ar => ar.Areas).HasForeignKey(ar => ar.Area);
                entity.HasMany<ProjectProposal>(a => a.ProjectProposals).WithOne(pp => pp.Areas).HasForeignKey(pp => pp.Area);
            });
            // para aplicar la carga de datos
            modelBuilder.ApplyConfiguration(new AreaData());

            //ProjectType
            modelBuilder.Entity<ProjectType>(entity =>
            {
                entity.ToTable("ProjectType");
                entity.HasKey(pt => pt.Id);
                entity.Property(pt => pt.Name).HasMaxLength(25);

                // Relaciones 1 a muchos
                entity.HasMany<ApprovalRule>(pt => pt.ApprovalRules).WithOne(ar => ar.ProjectType).HasForeignKey(ar => ar.Type);
                entity.HasMany<ProjectProposal>(pt => pt.ProjectProposals).WithOne(pp => pp.ProjectType).HasForeignKey(pp => pp.Type);
            });
            // para aplicar la carga de datos
            modelBuilder.ApplyConfiguration(new ProjectTypeData());

            //ApproverRoles
            modelBuilder.Entity<ApproverRole>(entity =>
            {
                entity.ToTable("ApproverRole");
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Name).HasMaxLength(25);
                // Relacion 1 a muchos
                entity.HasMany(ar => ar.ApprovalRules).WithOne(ar => ar.ApproverRole).HasForeignKey(ar => ar.ApproverRoleId);
                entity.HasMany(ar => ar.ProjectApprovalSteps).WithOne(pas => pas.ApproverRole).HasForeignKey(pas => pas.ApproverRoleId);
                entity.HasMany(ar => ar.users).WithOne(u => u.ApproverRole).HasForeignKey(ar => ar.Role);
            });
            // para aplicar la carga de datos
            modelBuilder.ApplyConfiguration(new ApproverRoleData());
            //ApprovalRule
            var bigIntToStringConverter = new ValueConverter<BigInteger, string>(
            v => v.ToString(),
            v => BigInteger.Parse(v));
            modelBuilder.Entity<ApprovalRule>(entity =>
            {
                entity.ToTable("ApprovalRule");
                entity.HasKey(ar => ar.Id);
                entity.Property(ar => ar.Id);
                entity.Property(ar => ar.StepOrder).IsRequired();
                entity.Property(ar => ar.MinAmount).HasConversion<decimal>();
                entity.Property(ar => ar.MaxAmount).HasConversion<decimal>();
                // Relación muchos a 1
                entity.HasOne(ar => ar.Areas).WithMany(a => a.ApprovalRules).HasForeignKey(a => a.Area);
                entity.HasOne(ar => ar.ProjectType).WithMany(pt => pt.ApprovalRules).HasForeignKey(t => t.Type);
                entity.HasOne(ar => ar.ApproverRole).WithMany(ar => ar.ApprovalRules).HasForeignKey(ar => ar.ApproverRoleId);
            });
            // para aplicar la carga de datos
            modelBuilder.ApplyConfiguration(new ApprovalRuleData());
            //ApprovalStatus
            modelBuilder.Entity<ApprovalStatus>(entity =>
            {
                entity.ToTable("ApprovalStatus");
                entity.HasKey(s => s.Id);
                entity.Property(s => s.Name).HasMaxLength(25);
                // Relación 1 a muchos
                entity.HasMany(s => s.ProjectProposals).WithOne(pp => pp.ApprovalStatus).HasForeignKey(pp => pp.Status);
                entity.HasMany(s => s.ProjectApprovalSteps).WithOne(ps => ps.ApprovalStatus).HasForeignKey(ps => ps.Status);
            });
            // para aplicar la carga de datos
            modelBuilder.ApplyConfiguration(new ApprovalStatusData());
            //User
            modelBuilder.Entity<User>((Action<Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<User>>)(entity =>
            {
                entity.ToTable("USER");
                entity.HasKey(u => u.Id);
                entity.Property((System.Linq.Expressions.Expression<Func<User, string>>)(u => u.Name)).HasMaxLength(25);
                entity.Property((System.Linq.Expressions.Expression<Func<User, string>>)(u => u.Email)).HasMaxLength(100);
                // Relacion muchos a 1
                entity.HasOne(u => u.ApproverRole).WithMany(ar => ar.users).HasForeignKey(u => u.Role);
                // Relacion 1 a muchos
                entity.HasMany(u => u.ProjectApprovalSteps).WithOne(pas => pas.User).HasForeignKey(pas => pas.ApproverUserId);
                modelBuilder.Entity<ProjectProposal>().HasOne(p => p.User).WithMany(u => u.ProjectProposals).HasForeignKey(p => p.CreatedBy).OnDelete(DeleteBehavior.Restrict);
                //entity.HasMany<ProjectProposal>(a => a.ProjectProposals).WithOne(pp => pp.User).HasForeignKey(pp => pp.User).IsRequired();
            }));
            // para aplicar la carga de datos
            modelBuilder.ApplyConfiguration(new UserData());

            //ProjectProposal
            modelBuilder.Entity<ProjectProposal>((Action<Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<ProjectProposal>>)(entity =>
            {
                entity.ToTable("ProjectProposal");
                entity.HasKey(pp => pp.Id);
                entity.Property((System.Linq.Expressions.Expression<Func<ProjectProposal, string>>)(pp => pp.Title)).HasMaxLength(255);
                entity.Property((System.Linq.Expressions.Expression<Func<ProjectProposal, string>>)(pp => pp.Description));
                entity.Property(pp => pp.EstimatedAmount);
                entity.Property(pp => pp.EstimatedDuration);
                entity.Property(pp => pp.CreateAt);
                // Relaciones muchos a uno
                entity.HasOne(pp => pp.Areas).WithMany(s => s.ProjectProposals).HasForeignKey(s => s.Area);
                entity.HasOne(pp => pp.User).WithMany(u => u.ProjectProposals).HasForeignKey(pp => pp.CreatedBy).OnDelete(DeleteBehavior.Restrict);
                //entity.HasOne<User>(pp => pp.User).WithMany(u => u.ProjectProposals).HasForeignKey((System.Linq.Expressions.Expression<Func<ProjectProposal, object?>>)(u => u.User));
                entity.HasOne(pp => pp.ApprovalStatus).WithMany(e => e.ProjectProposals).HasForeignKey(e => e.Status);
                entity.HasOne(pp => pp.ProjectType).WithMany(pt => pt.ProjectProposals).HasForeignKey(pt => pt.Type);
                // Relaciones 1 a muchos
                entity.HasMany(pp => pp.ProjectApprovalSteps).WithOne(pas => pas.ProjectProposal).HasForeignKey(pas => pas.ProjectProposalId);
            }));

            //ProjectApprovalStep
            modelBuilder.Entity<ProjectApprovalStep>(entity =>
            {
                entity.ToTable("ProjectApprovalStep");
                entity.HasKey(pas => pas.Id);
                entity.Property(pas => pas.Id);
                entity.Property(pas => pas.StepOrder);
                entity.Property(pas => pas.DecisionDate);
                entity.Property(pas => pas.Observations);
                // Relación con ProjectProposal
                entity.HasOne(pas => pas.ProjectProposal).WithMany(pp => pp.ProjectApprovalSteps).HasForeignKey(pas => pas.ProjectProposalId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(pas => pas.ApprovalStatus).WithMany(s => s.ProjectApprovalSteps).HasForeignKey(pas => pas.Status);
                entity.HasOne(pas => pas.ApproverRole).WithMany(r => r.ProjectApprovalSteps).HasForeignKey(pas => pas.ApproverRoleId);
                entity.HasOne(pas => pas.User).WithMany(u => u.ProjectApprovalSteps).HasForeignKey(pas => pas.ApproverUserId).OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}