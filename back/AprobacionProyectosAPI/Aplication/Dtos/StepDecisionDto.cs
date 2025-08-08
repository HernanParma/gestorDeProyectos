using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Aplication.Dtos
{
    public class StepDecisionDto
    {
        public int Id { get; set; } // StepOrder
        public int User { get; set; }
        public int Status { get; set; }
        public string? Observation { get; set; }
    }

}
