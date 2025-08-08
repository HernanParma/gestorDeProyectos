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
    public class ProjectTypeService : IProjectTypeService
    {
        private readonly AppDbContext _context;
        public ProjectTypeService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<List<ProjectTypeDto>> GetAllAsync()
        {
            return await _context.ProjectType
                .Select(a => new ProjectTypeDto
                {
                    Id = a.Id,
                    Name = a.Name
                })
                .ToListAsync();
        }
    }
}