using Aplication.Interfaces;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Aplication.Factory
{
    public class ProjectFactory : IProjectFactory
    {
        public ProjectProposal Create(CreateProjectDto dto)
        {
            return new ProjectProposal
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                EstimatedAmount = dto.EstimatedAmount,
                EstimatedDuration = dto.EstimatedDuration,
                Area = dto.Area,
                Type = dto.Type,
                CreatedBy = dto.CreatedByUserId,
                CreateAt = DateTime.Now,
                Status = (int)ApprovalStatusEnum.Pending
            };
        }
    }
}
