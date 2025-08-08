using Aplication.Dtos;
using Aplication.Interfaces;
using Domain.Entities;
using Microsoft.CodeAnalysis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infraestructure.Services
{
    public class ProjectProposalService : IProjectProposalService
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IProjectApprovalStepRepository _approvalStepRepository;
        private readonly IApprovalRuleRepository _ruleRepository;
        private readonly IUserService _userService;
        private readonly IProjectFactory _projectFactory;
        private readonly IApprovalStepBuilder _approvalStepBuilder;
        private readonly IProjectMapper _projectMapper;

        public ProjectProposalService(
            IProjectRepository projectRepository,
            IProjectApprovalStepRepository approvalStepRepository,
            IApprovalRuleRepository ruleRepository,
            IUserService userService,
            IProjectFactory projectFactory,
            IApprovalStepBuilder approvalStepBuilder,
            IProjectMapper projectMapper)
        {
            _projectRepository = projectRepository;
            _approvalStepRepository = approvalStepRepository;
            _ruleRepository = ruleRepository;
            _userService = userService;
            _projectFactory = projectFactory;
            _approvalStepBuilder = approvalStepBuilder;
            _projectMapper = projectMapper;
        }

        public async Task<Guid> CreateProjectAsync(CreateProjectDto dto)
        {
            if (dto.Area is <= 0 or > 4 || dto.Type is <= 0 or > 4 || dto.CreatedByUserId is <= 0 or > 6)
                throw new ArgumentException("Datos del proyecto inválidos");

            // Validar que no exista otro con el mismo título
            if (await _projectRepository.ExistsWithTitleAsync(dto.Title))
                throw new InvalidOperationException("Ya existe un proyecto con ese título.");

            var proyecto = _projectFactory.Create(dto);
            await _projectRepository.AddAsync(proyecto);

            var reglas = await _ruleRepository.GetApplicableRulesAsync(dto.EstimatedAmount, dto.Area, dto.Type);
            var reglasFiltradas = reglas
                .GroupBy(r => r.StepOrder)
                .Select(g =>
                    g.OrderByDescending(r => r.Area.HasValue)
                     .ThenByDescending(r => r.Type.HasValue)
                     .First()
                )
                .OrderBy(r => r.StepOrder)
                .ToList();

            if (!reglasFiltradas.Any())
                throw new Exception("No se encontraron reglas de aprobación aplicables para este proyecto.");

            var pasos = await _approvalStepBuilder.BuildStepsAsync(proyecto, reglasFiltradas);

            foreach (var paso in pasos)
            {
                await _approvalStepRepository.AddAsync(paso);
            }

            await _approvalStepRepository.SaveChangesAsync();
            return proyecto.Id;
        }

        public async Task<List<ProjectDetailDto>> GetFilteredProjectsAsync(string? title, int? status, int? applicant, int? approvalUser)
        {
            var projects = await _projectRepository.GetFilteredProjectsAsync(title, status, applicant, approvalUser);
            return projects.Select(p => _projectMapper.MapToDetail(p)).ToList();
        }

        public async Task<ProjectProposal?> GetByIdAsync(Guid id)
        {
            return await _projectRepository.GetByIdAsync(id);
        }

        public async Task<ProjectDetailDto?> GetProjectDetailByIdAsync(Guid id)
        {
            var project = await _projectRepository.GetByIdWithApprovalStepsAsync(id);
            return project == null ? null : _projectMapper.MapToDetail(project);
        }
    }
}
