using Aplication.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Aplication.Interfaces
{
    public  interface IAreaService
    {
        Task<List<AreaDto>> GetAllAsync();
    }
}
