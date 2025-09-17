using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Aplication.Dtos;
using Domain.Entities;

namespace Aplication.Interfaces
{
    public interface IProjectRepository
    {
        Task<ProjectProposal?> GetByIdAsync(Guid id);
        Task AddAsync(ProjectProposal project);
        Task<List<ProjectProposal>> GetByCreatorIdAsync(int userId);
        Task<bool> EliminarAsync(ProjectProposal proyecto);
        Task<List<Area>> GetAllSectorsAsync();
        Task<int> SaveChangesAsync();
        Task<List<ProjectType>> GetAllProjectTypesAsync();
        Task<List<ProjectProposal>> GetFilteredProjectsAsync(string? title, int? status, int? applicant, int? approvalUser);
        Task<ProjectProposal?> GetByIdWithApprovalStepsAsync(Guid id);
        Task<bool> ExistsWithTitleAsync(string title);
        Task DeleteAsync(Guid id);

    }
}