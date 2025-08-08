using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Aplication.Dtos;

namespace Aplication.Interfaces
{
    public interface IProjectProposalService
    {
        Task<Guid> CreateProjectAsync(CreateProjectDto dto);
        Task<ProjectProposal?> GetByIdAsync(Guid id);
        Task<ProjectDetailDto?> GetProjectDetailByIdAsync(Guid id);
        Task<List<ProjectDetailDto>> GetFilteredProjectsAsync(string? title, int? status, int? applicant, int? approvalUser);
    }
}