using Domain.Entities;

namespace Aplication.Interfaces
{
    public interface IProjectApprovalRepository
    {
        Task<ProjectApprovalStep> UpdateProject(ProjectApprovalStep Project);
    }
}
