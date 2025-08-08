using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Aplication.Interfaces;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repositories
{
    public class ApprovalRuleRepository : IApprovalRuleRepository
    {
        private readonly AppDbContext _context;
        public ApprovalRuleRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<List<ApprovalRule>> GetApplicableRulesAsync(decimal monto, int? areaId, int? tipoId)
        {
            return await _context.ApprovalRule
                .Include(r => r.ApproverRole)
                .Include(r => r.Areas)
                .Include(r => r.ProjectType)
                .Where(rule =>
                    monto >= rule.MinAmount &&
                    (rule.MaxAmount == 0 || monto <= rule.MaxAmount) &&
                    (rule.Area == null || rule.Area == areaId) &&
                    (rule.Type == null || rule.Type == tipoId)
                )
                .OrderBy(r => r.StepOrder)
                .ToListAsync();
        }
        public async Task<List<ApprovalRule>> GetAllAsync()
        {
            return await _context.ApprovalRule
                .Include(r => r.ApproverRole)
                .Include(r => r.Areas)
                .Include(r => r.ProjectType)
                .OrderBy(r => r.StepOrder)
                .ToListAsync();
        }
    }
}