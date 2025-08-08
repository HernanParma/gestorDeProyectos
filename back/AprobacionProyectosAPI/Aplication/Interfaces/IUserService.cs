using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Aplication.Dtos;

namespace Aplication.Interfaces
{
    public interface IUserService
    {
        Task<List<UserDto>> GetAllUsersAsync();
        Task<List<User>> GetUsersByApproverRoleAsync(int approverRoleId);
        Task<User> GetUserWithRoleByIdAsync(int id);
        Task<User> CreateUserAsync(string name, string email, int roleId);
        Task<User> GetUserByRoleAsync(int roleId);
    }
}