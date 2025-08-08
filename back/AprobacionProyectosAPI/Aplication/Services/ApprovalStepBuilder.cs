using Aplication.Interfaces;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Aplication.Services
{
    public class ApprovalStepBuilder : IApprovalStepBuilder
    {
        public Task<List<ProjectApprovalStep>> BuildStepsAsync(ProjectProposal proposal, List<ApprovalRule> rules)
        {
            var filteredRules = rules
                .GroupBy(r => r.StepOrder)
                .Select(g =>
                    g.OrderByDescending(r => r.Area.HasValue)
                     .ThenByDescending(r => r.Type.HasValue)
                     .First())
                .OrderBy(r => r.StepOrder)
                .ToList();

            var steps = filteredRules.Select(rule => new ProjectApprovalStep
            {
                ProjectProposalId = proposal.Id,
                StepOrder = rule.StepOrder,
                ApproverRoleId = rule.ApproverRoleId,
                ApproverUserId = null, 
                Status = (int)ApprovalStatusEnum.Pending
            }).ToList();

            return Task.FromResult(steps);
        }
    }
}
