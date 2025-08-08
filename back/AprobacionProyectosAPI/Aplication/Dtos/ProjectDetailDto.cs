using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Aplication.Dtos
{
    public class ProjectDetailDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal EstimatedAmount { get; set; }
        public int EstimatedDuration { get; set; }
        public AreaDto Area { get; set; } = null!;
        public ProjectTypeDto Type { get; set; } = null!;
        public UserDto CreatedByUser { get; set; } = null!;
        public ApprovalStatusDto Status { get; set; } = null!;

        public List<ApprovalStepDto> Steps { get; set; } = new();
    }
}
