using Aplication.Interfaces;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repositories
{
    public class ProjectApprovalRepository : IProjectApprovalRepository
    {
        private readonly AppDbContext _context;
        public ProjectApprovalRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<ProjectApprovalStep> UpdateProject(ProjectApprovalStep Project)
        {
                _context.ProjectApprovalStep.Update(Project);
                await _context.SaveChangesAsync();
                return Project;
        }
    }
}