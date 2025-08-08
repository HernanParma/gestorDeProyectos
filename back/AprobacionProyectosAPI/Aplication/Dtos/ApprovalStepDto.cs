using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Aplication.Dtos
{
    public class ApprovalStepDto
    {
        public long Id { get; set; }
        public int StepOrder { get; set; }
        public string RoleName { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? ApprovedBy { get; set; } 
        public DateTime? ApprovedAt { get; set; }
        public string? Observations { get; set; }
    }
}
