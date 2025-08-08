using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Aplication.Interfaces
{
    public interface IApprovalStepBuilder
    {
        Task<List<ProjectApprovalStep>> BuildStepsAsync(ProjectProposal proposal, List<ApprovalRule> rules);
    }
}
