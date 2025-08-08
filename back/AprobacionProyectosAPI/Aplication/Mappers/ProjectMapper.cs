using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Aplication.Interfaces;
using Domain.Entities;
using Aplication.Dtos;

namespace Aplication.Mappers
{
    public class ProjectMapper : IProjectMapper
    {
        public ProjectDetailDto MapToDetail(ProjectProposal project)
        {
            return new ProjectDetailDto
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                EstimatedAmount = project.EstimatedAmount,
                EstimatedDuration = project.EstimatedDuration,
                Area = new AreaDto
                {
                    Id = project.Areas.Id,
                    Name = project.Areas.Name
                },
                Type = new ProjectTypeDto
                {
                    Id = project.ProjectType.Id,
                    Name = project.ProjectType.Name
                },
                CreatedByUser = new UserDto
                {
                    Id = project.User.Id,
                    Name = project.User.Name,
                    Email = project.User.Email,
                    Role = new RoleDto
                    {
                        Id = project.User.ApproverRole.Id,
                        Name = project.User.ApproverRole.Name
                    }
                },
                Status = new ApprovalStatusDto
                {
                    Id = project.ApprovalStatus.Id,
                    Name = project.ApprovalStatus.Name
                },
                Steps = project.ProjectApprovalSteps.Select(s => new ApprovalStepDto
                {
                    Id = s.Id,
                    StepOrder = s.StepOrder,
                    RoleName = s.ApproverRole?.Name ?? "Sin rol",
                    Status = s.ApprovalStatus?.Name ?? "Sin estado",
                    ApprovedBy = s.User?.Name,
                    ApprovedAt = s.DecisionDate,
                    Observations = s.Observations
                }).ToList()
            };
        }
    }
}