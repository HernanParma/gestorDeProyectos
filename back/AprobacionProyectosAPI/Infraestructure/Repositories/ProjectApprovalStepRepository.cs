using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Infraestructure.Persistence;
using Aplication.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repositories
{
        public class ProjectApprovalStepRepository : IProjectApprovalStepRepository
        {
            private readonly AppDbContext _context;
        public ProjectApprovalStepRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<List<ProjectApprovalStep>> GetStepByProjectIdAsync(Guid projectId)
        {
            return await _context.ProjectApprovalStep
                .Include(p => p.User)
                .Include(p => p.ApproverRole)
                .Where(p => p.ProjectProposalId == projectId)
                .ToListAsync();
        }
        public async Task<IEnumerable<ProjectApprovalStep>> GetStepsByProjectIdAsync(Guid projectId)
        {
            return await _context.ProjectApprovalStep
                .Include(p => p.ProjectProposal)  
                .Include(p => p.ApproverRole)
                .Where(p => p.ProjectProposalId == projectId)
                .ToListAsync();
        }
        public async Task<List<ProjectApprovalStep>> GetByUserIdAsync(int userId)
        {
            return await _context.ProjectApprovalStep
                .Include(p => p.ProjectProposal)  
                .Include(p => p.ApproverRole)     
                .Include(p => p.User)             
                .Where(p => p.User.Id == userId)
                .ToListAsync();
        }
        public async Task<List<ProjectApprovalStep>> GetStepsByProjectIdWithUserAndRoleAsync(Guid projectId)
        {
            return await _context.ProjectApprovalStep
                .Include(p => p.User)
                .Include(p => p.ApproverRole)
                .Where(p => p.ProjectProposalId == projectId)
                .ToListAsync();
        }
        public async Task AddAsync(ProjectApprovalStep step)
        {
                await _context.ProjectApprovalStep.AddAsync(step);
        }
        public async Task SaveChangesAsync()
        {
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Capturás el mensaje de la excepción interna, que suele tener el detalle real del error
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                // Podés lanzar una excepción con ese mensaje para que llegue al controlador o para debug
                throw new Exception("Error al guardar cambios en la base de datos: " + innerMessage);
            }
        }

    }
}