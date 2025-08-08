using Aplication.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Aplication.Interfaces
{
    public interface IApprovalStatusService
    {
        Task<List<ApprovalStatusDto>> GetAllAsync();

    }
}
