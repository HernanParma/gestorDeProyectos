using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Aplication.Interfaces
{
    public interface IProjectApprovalStepRepository
    {
        Task AddAsync(ProjectApprovalStep step);
        Task<IEnumerable<ProjectApprovalStep>> GetStepsByProjectIdAsync(Guid projectId);
        Task<List<ProjectApprovalStep>> GetStepByProjectIdAsync(Guid projectId);
        Task SaveChangesAsync();
        Task<List<ProjectApprovalStep>> GetStepsByProjectIdWithUserAndRoleAsync(Guid projectId);
        Task<List<ProjectApprovalStep>> GetByUserIdAsync(int userId);
    }
}
