using Aplication.Dtos;
using Infraestructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Aplication.Interfaces;

namespace Infraestructure.Services
{
    public class ApprovalStatusService: IApprovalStatusService
    {
        private readonly AppDbContext _context;
        public ApprovalStatusService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<List<ApprovalStatusDto>> GetAllAsync()
        {
            return await _context.ApprovalStatus
                .Select(a => new ApprovalStatusDto
                {
                    Id = a.Id,
                    Name = a.Name
                })
                .ToListAsync();
        }
    }
}