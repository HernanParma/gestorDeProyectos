using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class ProjectApprovalStep
    {
        public long Id { get; set; }
        public int StepOrder { get; set; }
        public DateTime? DecisionDate { get; set; }
        public string? Observations { get; set; }
        // Relaciones foráneas
        public Guid ProjectProposalId { get; set; }
        public int? ApproverUserId { get; set; }
        public int ApproverRoleId { get; set; }
        public int Status { get; set; }

        //Relacion de tablas
        public ProjectProposal ProjectProposal { get; set; }
        public User User { get; set; }
        public ApproverRole ApproverRole { get; set; }
        public ApprovalStatus ApprovalStatus { get; set; }
    }
}
