using Microsoft.AspNetCore.Mvc;
using Aplication.Interfaces;
using Aplication.Dtos;
using System;
using System.Threading.Tasks;
using Infraestructure.Repositories;
using Domain.Entities;
using Infraestructure.Services;

namespace AprobacionProyectosAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectController : ControllerBase
    {
        private readonly IProjectApprovalRepository _approvalRepository;
        private readonly IProjectApprovalStepRepository _stepRepository;
        private readonly IProjectProposalService _proposalService;
        private readonly IProjectRepository _projectRepository;
        private readonly IUserService _userService;

        public ProjectController(IProjectProposalService proposalService, IProjectRepository projectRepository, IProjectApprovalRepository approvalRepository, IProjectApprovalStepRepository stepRepository, IUserService userService)
        {
            _proposalService = proposalService;
            _projectRepository = projectRepository;
            _approvalRepository = approvalRepository;
            _stepRepository = stepRepository;
            _userService = userService;
        }
        /// <summary>
        /// Obtiene una lista de proyectos filtrados por título, estado, solicitante o aprobador.
        /// </summary>
        /// <param name="title">Filtro por título del proyecto. Ejemplo: "Sistema de Gestión".</param>
        /// <param name="status">Filtro por ID del estado del proyecto (1: Pendiente, 2: Aprobado, etc.). Ejemplo: 1.</param>
        /// <param name="applicant">Filtro por ID del solicitante. Ejemplo: 2.</param>
        /// <param name="approvalUser">Filtro por ID del usuario aprobador. Ejemplo: 1.</param>
        [HttpGet]
        public async Task<IActionResult> GetFilteredProjects(
            [FromQuery] string? title,
            [FromQuery] int? status,
            [FromQuery] int? applicant,
            [FromQuery] int? approvalUser)
        {
            if (status.HasValue && (status < 0 || status > 4))
            {
                return BadRequest(new { message = "Parámetro de consulta inválido" });
            }
            if (applicant.HasValue && (applicant < 0 || applicant > 6))
            {
                return BadRequest(new { message = "Parámetro de consulta inválido" });
            }
            if (approvalUser.HasValue && (approvalUser < 0 || approvalUser > 6))
            {
                return BadRequest(new { message = "Parámetro de consulta inválido" });
            }
            var projects = await _proposalService.GetFilteredProjectsAsync(title, status, applicant, approvalUser);
            return Ok(projects);
        }
        /// <summary>
        /// Crear solicitud de proyecto
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var id = await _proposalService.CreateProjectAsync(dto);
                var projectDetail = await _proposalService.GetProjectDetailByIdAsync(id);
                if (projectDetail == null)
                    return NotFound();

                return CreatedAtAction(nameof(GetById), new { id = id }, projectDetail);
            }
            catch (InvalidOperationException ex) 
            {
                // "Excepción lanzada si ya existe un proyecto con ese título"
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Ocurrió un error interno al crear el proyecto." });
            }
        }
        /// <summary>
        /// Realizar proceso de aprobación / observación / rechazo de un paso
        /// </summary>
        [HttpPatch("{id}/decision")]
        public async Task<IActionResult> MakeDecision(string id, [FromBody] StepDecisionDto dto)
        {
            if (!Guid.TryParse(id, out var projectId))
                return BadRequest("El id del proyecto no es válido.");

            var proyecto = await _projectRepository.GetByIdAsync(projectId);
            if (proyecto == null)
                return NotFound("Proyecto no encontrado");

            var steps = await _stepRepository.GetStepsByProjectIdAsync(projectId);
            var orderedSteps = steps.OrderBy(s => s.StepOrder).ToList();
            var currentStep = orderedSteps.FirstOrDefault(s => s.Id == dto.Id);
            if (currentStep == null)
                return NotFound("Paso de aprobación no encontrado.");

            if (currentStep.Status != (int)ApprovalStatusEnum.Pending &&
                currentStep.Status != (int)ApprovalStatusEnum.Observed)
                return BadRequest("Este paso ya fue procesado.");

            if (currentStep.ApproverUserId != null && currentStep.ApproverUserId != dto.User)
                return BadRequest("Este usuario no tiene permiso para tomar decisión sobre este paso.");

            var user = await _userService.GetUserWithRoleByIdAsync(dto.User);
            if (user == null)
                return NotFound("Usuario no encontrado.");

            if (user.ApproverRole.Id != currentStep.ApproverRoleId)
                return BadRequest("El rol del usuario no coincide con el requerido para este paso.");

            if (currentStep.StepOrder > 1)
            {
                var previousStep = orderedSteps.FirstOrDefault(p => p.StepOrder == currentStep.StepOrder - 1);
                if (previousStep != null &&
                    previousStep.Status != (int)ApprovalStatusEnum.Approved &&
                    previousStep.Status != (int)ApprovalStatusEnum.Observed)
                {
                    return BadRequest("El paso anterior aún no ha sido aprobado ni observado.");
                }
            }

            if (dto.Status < 1 || dto.Status > 4)
                return BadRequest("Datos de actualización inválidos.");
            currentStep.Status = dto.Status;
            currentStep.Observations = dto.Observation;
            currentStep.DecisionDate = DateTime.UtcNow;
            await _approvalRepository.UpdateProject(currentStep);

            // Rechazar duplicados si se aprobó este paso
            if (dto.Status == (int)ApprovalStatusEnum.Approved)
            {
                var duplicates = orderedSteps.Where(p =>
                    p.StepOrder == currentStep.StepOrder &&
                    p.Id != currentStep.Id &&
                    p.Status == (int)ApprovalStatusEnum.Pending &&
                    p.ApproverRoleId == currentStep.ApproverRoleId).ToList();

                foreach (var dup in duplicates)
                {
                    dup.Status = (int)ApprovalStatusEnum.Rejected;
                    dup.Observations = "Paso rechazado automáticamente al aprobar un duplicado.";
                    dup.DecisionDate = DateTime.UtcNow;
                    await _approvalRepository.UpdateProject(dup);
                }
            }

            return Ok("Estado actualizado correctamente.");
        }
        /// <summary>
        /// Modificar proyecto
        /// </summary>
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectProposalDto dto)
        {
            var project = await _projectRepository.GetByIdAsync(id);
            if (project == null)
            {
                return NotFound($"Proyecto con el ID: {id} no encontrado");
            }
            project.Title = dto.Title;
            project.Description = dto.Description;
            project.EstimatedDuration = dto.EstimatedDuration;
            await _projectRepository.SaveChangesAsync();
            return Ok(project);
        }
        /// <summary>
        /// Obtiene un proyecto a partir de su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var project = await _proposalService.GetProjectDetailByIdAsync(id);
            if (project == null) return NotFound();
            return Ok(project);
        }

        /// <summary>
        /// Elimina un proyecto por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(Guid id)
        {
            try
            {
                var project = await _projectRepository.GetByIdAsync(id);
                if (project == null)
                {
                    return NotFound($"Proyecto con el ID: {id} no encontrado");
                }

                // Eliminar pasos de aprobación relacionados
                var steps = await _stepRepository.GetStepsByProjectIdAsync(id);
                foreach (var step in steps)
                {
                    await _stepRepository.DeleteAsync(step.Id);
                }

                // Eliminar el proyecto
                await _projectRepository.DeleteAsync(id);
                await _projectRepository.SaveChangesAsync();

                return Ok(new { message = "Proyecto eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Ocurrió un error interno al eliminar el proyecto." });
            }
        }
    }
}