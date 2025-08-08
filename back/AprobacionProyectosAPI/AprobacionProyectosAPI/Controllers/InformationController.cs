using Aplication.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AprobacionProyectosAPI.Controllers
{
    [ApiController]
    [Route("api/")]
    public class InformationController : ControllerBase
    {
        private readonly IAreaService _areaService;
        private readonly IUserService _userService;
        private readonly IProjectTypeService _projectTypeService;
        private readonly IApproverRoleService _roleService;
        private readonly IApprovalStatusService _statusService;

        public InformationController(
            IAreaService areaService,
            IUserService userService,
            IProjectTypeService projectTypeService,
            IApproverRoleService roleService,
            IApprovalStatusService statusService)
        {
            _areaService = areaService;
            _userService = userService;
            _projectTypeService = projectTypeService;
            _roleService = roleService;
            _statusService = statusService;
        }

        /// <summary>
        /// Listado de Áreas
        /// </summary>
        [HttpGet("Area")]
        public async Task<IActionResult> GetAllAreas()
        {
            var areas = await _areaService.GetAllAsync();
            return Ok(areas);
        }

        /// <summary>
        /// Listado de Tipos de Proyectos
        /// </summary>
        [HttpGet("ProjectType")]
        public async Task<IActionResult> GetAllProjectTypes()
        {
            var types = await _projectTypeService.GetAllAsync();
            return Ok(types);
        }

        /// <summary>
        /// Listado de roles de usuario
        /// </summary>
        [HttpGet("Role")]
        public async Task<IActionResult> GetAllRoles()
        {
            var roles = await _roleService.GetAllAsync();
            return Ok(roles);
        }

        /// <summary>
        /// Listado de estados para una solicitud de proyecto y pasos de aprobacion
        /// </summary>
        [HttpGet("ApprovalStatus")]
        public async Task<IActionResult> GetAllApprovalStatuses()
        {
            var statuses = await _statusService.GetAllAsync();
            return Ok(statuses);
        }  
        /// <summary>
        /// Listado de Usuarios
        /// </summary>
        [HttpGet("User")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }
    }
}

