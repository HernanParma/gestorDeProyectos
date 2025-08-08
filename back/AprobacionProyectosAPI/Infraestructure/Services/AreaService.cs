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
    public class AreaService : IAreaService
    {
        private readonly AppDbContext _context;
        public AreaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<AreaDto>> GetAllAsync()
        {
            return await _context.Area
                .Select(a => new AreaDto
                {
                    Id = a.Id,
                    Name = a.Name
                })
                .ToListAsync();
        }
    }
}
