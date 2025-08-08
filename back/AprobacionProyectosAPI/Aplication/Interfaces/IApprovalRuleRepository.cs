using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Aplication.Interfaces
{
    public interface IApprovalRuleRepository
    {
        Task<List<ApprovalRule>> GetApplicableRulesAsync(decimal monto, int? areaId, int? tipoId);
        Task<List<ApprovalRule>> GetAllAsync();
    }
}
