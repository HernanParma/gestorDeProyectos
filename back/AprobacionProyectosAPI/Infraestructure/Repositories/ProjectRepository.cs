using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Aplication.Interfaces;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly AppDbContext _context;

        public ProjectRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<ProjectProposal?> GetByIdAsync(Guid id)
        {
            return await _context.ProjectProposal
                .Include(pp => pp.ProjectType)
                .Include(pp => pp.Areas)
                .Include(pp => pp.ApprovalStatus)
                .Include(pp => pp.User)
                .FirstOrDefaultAsync(pp => pp.Id == id);
        }
        public async Task AddAsync(ProjectProposal project)
        {
            _context.ProjectProposal.Add(project);
            await _context.SaveChangesAsync();
        }
        public async Task<List<ProjectProposal>> GetByCreatorIdAsync(int userId)
        {
            return await _context.ProjectProposal
                .Where(p => p.CreatedBy == userId)
                .Include(p => p.ProjectType)
                .Include(p => p.Areas)
                .Include(p => p.ApprovalStatus)
                .Include(p => p.User)
                .Include(p => p.ProjectApprovalSteps) 
                .ThenInclude(s => s.ApprovalStatus) 
                .ToListAsync();
        }
        public async Task<bool> EliminarAsync(ProjectProposal proyecto)
        {
            // Primero eliminamos los pasos de aprobación asociados a esta propuesta
            var pasos = await _context.ProjectApprovalStep
                .Where(p => p.ProjectProposalId == proyecto.Id)
                .ToListAsync();
            _context.ProjectApprovalStep.RemoveRange(pasos); // Eliminamos los pasos
            _context.ProjectProposal.Remove(proyecto); // eliminamos la propuesta
            var cambios = await _context.SaveChangesAsync();
            return cambios > 0;
        }
        public async Task<List<Area>> GetAllSectorsAsync()
        {
            return await _context.Area.ToListAsync();
        }
        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
        public async Task<List<ProjectType>> GetAllProjectTypesAsync()
        {
            return await _context.ProjectType.ToListAsync();
        }
        public async Task<List<ProjectProposal>> GetFilteredProjectsAsync(string? title, int? status, int? applicant, int? approvalUser)
        {
            IQueryable<ProjectProposal> query = _context.ProjectProposal.AsQueryable();

            if (!string.IsNullOrWhiteSpace(title))
            {
                query = query.Where(p => p.Title.ToLower().Contains(title.ToLower()));
            }

            if (status.HasValue)
            {
                query = query.Where(p => p.ProjectApprovalSteps.Any(step => step.ApprovalStatus.Id == status.Value));
            }

            if (applicant.HasValue)
            {
                query = query.Where(p => p.CreatedBy == applicant.Value);
            }

            if (approvalUser.HasValue)
            {
                query = query.Where(p => p.ProjectApprovalSteps.Any(step => step.ApproverUserId == approvalUser.Value));
            }
            query = query
            .Include(p => p.Areas)
            .Include(p => p.ApprovalStatus)
            .Include(p => p.ProjectType)
            .Include(p => p.User).ThenInclude(u => u.ApproverRole)
            .Include(p => p.ProjectApprovalSteps)  
            .ThenInclude(s => s.ApprovalStatus)
            .Include(p => p.ProjectApprovalSteps)
            .ThenInclude(s => s.ApproverRole)
            .Include(p => p.ProjectApprovalSteps)
            .ThenInclude(s => s.User);
            return await query.ToListAsync();
        }
        public async Task<ProjectProposal?> GetByIdWithApprovalStepsAsync(Guid id)
        {
            return await _context.ProjectProposal
                .Include(p => p.User).ThenInclude(u => u.ApproverRole)
                .Include(p => p.ApprovalStatus)
                .Include(p => p.Areas)
                .Include(p => p.ProjectType)
                .Include(p => p.ProjectApprovalSteps)
                    .ThenInclude(s => s.ApproverRole)
                .Include(p => p.ProjectApprovalSteps)
                    .ThenInclude(s => s.ApprovalStatus)
                .Include(p => p.ProjectApprovalSteps)
                    .ThenInclude(s => s.User)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
        public async Task<bool> ExistsWithTitleAsync(string title)
        {
            return await _context.ProjectProposal
                .AnyAsync(p => p.Title.ToLower() == title.ToLower());
        }

    }
}