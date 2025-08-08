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
    public class ApproverRoleService: IApproverRoleService
    {
        private readonly AppDbContext _context;

        public ApproverRoleService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<List<ApproverRoleDto>> GetAllAsync()
        {
            return await _context.ApproverRole
                .Select(a => new ApproverRoleDto
                {
                    Id = a.Id,
                    Name = a.Name
                })
                .ToListAsync();
        }
    }
}