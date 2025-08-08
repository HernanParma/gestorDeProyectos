using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Aplication.Dtos;
using Aplication.Interfaces;
using Domain.Entities;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Services
{
    public class UserService : IUserService
    {

        public readonly AppDbContext _context;
        public UserService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<User> GetUserWithRoleByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.ApproverRole)
                .FirstOrDefaultAsync(u => u.Id == id);
        }
        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            return await _context.Users
                .Include(u => u.ApproverRole) 
                .Include(u => u.ApproverRole) 
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Role = new RoleDto
                    {
                        Id = u.ApproverRole.Id,
                        Name = u.ApproverRole.Name
                    }
                })
                .ToListAsync();
        }
        public async Task<User> GetUserByRoleAsync(int roleId)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Role == roleId);
        }
        public async Task<List<User>> GetUsersByApproverRoleAsync(int approverRoleId)
        {
            return await _context.Users
                .Where(u => u.Role == approverRoleId)
                .ToListAsync();
        }
        public async Task<User> CreateUserAsync(string name, string email, int roleId)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (existingUser != null)
            {
                throw new Exception("Ya existe un usuario con ese email.");
            }            
            var role = await _context.ApproverRole.FindAsync(roleId);
            if (role == null)
            {
                throw new Exception("El rol especificado no existe.");
            }
            var newUser = new User
            {
                Name = name,
                Email = email,
                Role = roleId,
            };
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
            return newUser;
        }
    }
}