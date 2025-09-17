// Función global para cargar todos los proyectos (fallback)
window.loadAllProjectsAsFallback = async function() {
    try {
        console.log('Cargando todos los proyectos como fallback...');
        const response = await fetch('https://localhost:7098/api/project');
        if (response.ok) {
            const allProjects = await response.json();
            console.log('Mostrando todos los proyectos como fallback:', allProjects);
            
            // Obtener referencias a los elementos
            const projectListContainer = document.getElementById('my-project-list');
            const noProjectsMessage = document.getElementById('no-projects-message');
            
            if (projectListContainer && noProjectsMessage) {
                renderProyectos(allProjects, projectListContainer, noProjectsMessage);
            }
        } else {
            console.error('Error al cargar todos los proyectos como fallback:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error en fallback:', error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const projectListContainer = document.getElementById('my-project-list');
    const noProjectsMessage = document.getElementById('no-projects-message');

    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
    
    console.log('=== INICIO MIS PROYECTOS ===');
    console.log('Datos del localStorage:', localStorage.getItem('usuarioLogueado'));
    console.log('Usuario parseado:', usuarioLogueado);
    
    // Función para actualizar el nombre del usuario en la barra de navegación
    function updateUserDisplay() {
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay && usuarioLogueado.name) {
            userNameDisplay.textContent = usuarioLogueado.name;
            console.log('Nombre del usuario actualizado en mis_proyectos:', usuarioLogueado.name);
        } else {
            console.error('No se pudo actualizar el nombre del usuario en mis_proyectos');
        }
    }
    
    // Ejecutar inmediatamente y también después de un pequeño delay
    updateUserDisplay();
    setTimeout(updateUserDisplay, 100);

    // Referencias a los nuevos modales
    const confirmDeleteModalBg = document.getElementById('confirm-delete-modal-bg');
    const confirmDeleteModal = document.getElementById('confirm-delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const successDeleteModalBg = document.getElementById('success-delete-modal-bg');
    const successDeleteModal = document.getElementById('success-delete-modal');
    const successDeleteMessage = document.getElementById('success-delete-message');
    const successDeleteCloseBtn = document.getElementById('success-delete-close-btn');
    const successDeleteCloseCross = document.getElementById('success-delete-close-cross');

    let currentProjectIdToDelete = null;

    if (!usuarioLogueado || !usuarioLogueado.id) {
        console.error('Usuario no logueado o sin ID:', usuarioLogueado);
        window.location.href = 'login.html';
        return;
    }
    
    console.log('Usuario válido, continuando...');

    // Funciones para mostrar/ocultar modales
    function showConfirmDeleteModal(projectId) {
        console.log('showConfirmDeleteModal llamada con projectId:', projectId);
        currentProjectIdToDelete = projectId;
        confirmDeleteModalBg.style.display = 'block';
        confirmDeleteModal.style.display = 'block';
    }

    function hideConfirmDeleteModal() {
        confirmDeleteModalBg.style.display = 'none';
        confirmDeleteModal.style.display = 'none';
        currentProjectIdToDelete = null;
    }

    function showSuccessDeleteModal(message) {
        successDeleteMessage.textContent = message;
        successDeleteModalBg.style.display = 'block';
        successDeleteModal.style.display = 'block';
    }

    function hideSuccessDeleteModal() {
        successDeleteModalBg.style.display = 'none';
        successDeleteModal.style.display = 'none';
        loadUserProjects(); // Recargar la lista de proyectos después de cerrar el modal de éxito
    }

    // Manejadores de eventos para los botones y fondos de los modales
    confirmDeleteBtn.onclick = () => {
        if (currentProjectIdToDelete) {
            hideConfirmDeleteModal();
            deleteProject(currentProjectIdToDelete);
        } else {
            showSuccessDeleteModal('Error: No se pudo obtener el ID del proyecto para confirmar la eliminación.');
        }
    };

    cancelDeleteBtn.onclick = hideConfirmDeleteModal;
    confirmDeleteModalBg.onclick = hideConfirmDeleteModal;

    successDeleteCloseBtn.onclick = hideSuccessDeleteModal;
    successDeleteCloseCross.onclick = hideSuccessDeleteModal;
    successDeleteModalBg.onclick = hideSuccessDeleteModal;

    // Función para renderizar proyectos
    function renderProyectos(proyectos, container = projectListContainer, noProjectsMsg = noProjectsMessage) {
        container.innerHTML = '';
        if (proyectos.length === 0) {
            noProjectsMsg.style.display = 'block';
            return;
        }
        noProjectsMsg.style.display = 'none';

        proyectos.forEach(p => {
            let overallStatusCalculated = 'pending'; 
            let badgeColor = '#FFEB3B'; 
            let badgeText = 'Pendiente';

            if (p.steps && p.steps.length > 0) {
                let hasPendingStep = false;
                let hasRejectedStep = false;
                let hasObservedStep = false;
                let allApproved = true;

                for (const step of p.steps) {
                    let currentStepStatusName;
                    if (typeof step.status === 'string') {
                        currentStepStatusName = step.status;
                    } else {
                        currentStepStatusName = step.status?.name || '';
                    }
                    const stepStatusName = currentStepStatusName.toLowerCase().trim();
                    
                    if (stepStatusName === 'rejected') {
                        hasRejectedStep = true;
                        allApproved = false; 
                        break; 
                    }
                    if (stepStatusName === 'pending') {
                        hasPendingStep = true;
                        allApproved = false;
                    }
                    if (stepStatusName === 'observed') {
                        hasObservedStep = true;
                        allApproved = false;
                    }
                    if (stepStatusName !== 'approved') {
                        allApproved = false;
                    }
                }

                if (hasRejectedStep) {
                    overallStatusCalculated = 'rejected';
                } else if (hasPendingStep) {
                    overallStatusCalculated = 'pending';
                } else if (hasObservedStep) {
                    overallStatusCalculated = 'observed';
                } else if (allApproved) { 
                    overallStatusCalculated = 'approved';
                }
            } else {
                let projectStatusName = 'pending'; 
                if (p.status && p.status.name) {
                    projectStatusName = p.status.name.toLowerCase().trim();
                }
                overallStatusCalculated = projectStatusName;
            }

            switch (overallStatusCalculated) {
                case 'pending':
                    badgeColor = '#FFEB3B'; 
                    badgeText = 'Pendiente';
                    break;
                case 'approved':
                    badgeColor = '#4CAF50'; 
                    badgeText = 'Aprobado';
                    break;
                case 'rejected':
                    badgeColor = '#F44336'; 
                    badgeText = 'Rechazado';
                    break;
                case 'observed':
                    badgeColor = '#FFC107'; 
                    badgeText = 'Observado';
                    break;
                default:
                    badgeColor = '#FFEB3B'; 
                    badgeText = 'Pendiente'; 
                    break;
            }

            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-lg-4 d-flex';
            const card = document.createElement('div');
            card.className = 'card h-100 shadow-sm w-100 d-flex flex-column';
            card.style.cursor = 'pointer';
            card.onclick = () => window.location.href = `detalle.html?id=${p.id}`;
            console.log(`Rendering project with ID: ${p.id}`);
            card.innerHTML = `
              <div class="card-body d-flex flex-column align-items-center justify-content-center" style="gap: 18px; position: relative;">
                <div style="width: 100%; display: flex; justify-content: center;">
                  <div style="background: linear-gradient(90deg, #1976D2 60%, #42a5f5 100%); color: #fff; font-size: 1.5rem; font-weight: bold; border-radius: 18px; padding: 12px 24px; margin-bottom: 0; box-shadow: 0 2px 8px rgba(25,118,210,0.08); text-align: center; min-width: 70%;">
                    ${p.title}
                  </div>
                </div>
                <div class="d-flex flex-row flex-wrap justify-content-between align-items-start w-100 gap-2">
                  <div style="background: #fff; border-radius: 14px; box-shadow: 0 2px 8px rgba(25,118,210,0.07); padding: 16px 18px; flex-grow: 1; border: 1px solid #e3eafc; min-width: 0;">
                    <div class="card-text mb-1" style="color: #1976D2;"><strong>Área:</strong> ${p.area?.name || p.area}</div>
                    <div class="card-text mb-1" style="color: #1976D2;"><strong>Tipo:</strong> ${p.type?.name || p.type}</div>
                    <div class="card-text mb-1" style="color: #1976D2;"><strong>Monto:</strong> $${p.estimatedAmount}</div>
                    <div class="card-text" style="color: #1976D2;"><strong>Duración:</strong> ${p.estimatedDuration} días</div>
                  </div>
                  <div class="d-flex flex-column justify-content-center align-items-center" style="min-width: 90px; max-width: 120px; flex-shrink: 0;">
                    <div style="font-size: 0.8em; font-weight: bold; color: #555; margin-bottom: 8px;">ESTADO</div>
                    <div style="background-color: ${badgeColor}; color: ${badgeColor === '#FFEB3B' ? '#333' : '#fff'}; padding: 8px 12px; border-radius: 12px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.1); white-space: nowrap; text-align: center; width: 100%; max-width: 110px; overflow: hidden; text-overflow: ellipsis;">
                      ${badgeText}
                    </div>
                  </div>
                </div>
                <button class="btn btn-danger btn-sm delete-project-btn" data-project-id="${p.id || ''}" data-project-title="${p.title || ''}" style="position: absolute; bottom: 15px; right: 15px; border-radius: 50%; width: 35px; height: 35px; padding: 0; display: flex; align-items: center; justify-content: center; z-index: 10; box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);" title="Eliminar proyecto">
                  <i class="fas fa-trash" style="font-size: 12px;"></i>
                </button>
              </div>
            `;
            col.appendChild(card);
            projectListContainer.appendChild(col);
        });

        // Añadir event listeners después de que los elementos estén en el DOM
        document.querySelectorAll('.delete-project-btn').forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                const projectId = this.getAttribute('data-project-id');
                const projectTitle = this.getAttribute('data-project-title');
                
                console.log('Botón clickeado - ID:', projectId, 'Título:', projectTitle);
                
                if (!projectId || projectId === 'undefined' || projectId === 'null') {
                    console.error('ID del proyecto no válido:', projectId);
                    showSuccessDeleteModal('Error: No se pudo obtener el ID del proyecto');
                    return;
                }
                
                showConfirmDeleteModal(projectId);
            });
        });
    }

    // Nueva función para eliminar proyecto
    function deleteProject(projectId) {
        console.log('deleteProject llamada con projectId:', projectId);
        if (!projectId || projectId === 'null' || projectId === 'undefined') {
            showSuccessDeleteModal('Error: ID de proyecto no válido (validación en deleteProject)');
            return;
        }

        fetch(`https://localhost:7098/api/project/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || 'Error al eliminar el proyecto');
                });
            }
            return response.text();
        })
        .then(message => {
            showSuccessDeleteModal('Proyecto eliminado exitosamente');
            // Recargar la lista de proyectos después de un breve retraso
            setTimeout(() => {
                loadUserProjects();
            }, 1000);
        })
        .catch(error => {
            console.error('Error al eliminar el proyecto:', error);
            showSuccessDeleteModal('Error: ' + error.message);
        });
    }

    // Función para cargar solo los proyectos creados por el usuario
    async function loadUserProjects() {
        try {
            const userId = usuarioLogueado.id;
            console.log('=== DEBUG MIS PROYECTOS ===');
            console.log('Usuario logueado completo:', usuarioLogueado);
            console.log('ID del usuario:', userId);
            console.log('Tipo de ID:', typeof userId);

            if (!userId) {
                console.error('No se encontró ID de usuario');
                projectListContainer.innerHTML = '<p class="text-danger">Error: No se pudo identificar al usuario.</p>';
                noProjectsMessage.style.display = 'none';
                return;
            }

            // Primero cargar todos los proyectos y filtrar en el frontend
            console.log('Cargando todos los proyectos...');
            const allProjectsResponse = await fetch('https://localhost:7098/api/project');
            
            if (!allProjectsResponse.ok) {
                throw new Error(`HTTP error! status: ${allProjectsResponse.status} al cargar proyectos.`);
            }
            
            const allProjects = await allProjectsResponse.json();
            console.log('Todos los proyectos:', allProjects);
            console.log('IDs de usuarios en los proyectos:', allProjects.map(p => ({ 
                id: p.id, 
                title: p.title, 
                createdByUserId: p.createdByUser?.id,
                createdByUserName: p.createdByUser?.name
            })));

            // Filtrar proyectos creados por el usuario actual
            const userProjects = allProjects.filter(project => {
                const projectCreatorId = project.createdByUser?.id;
                console.log(`Proyecto "${project.title}": creado por ${projectCreatorId}, usuario actual: ${userId}`);
                return projectCreatorId == userId; // Usar == para comparación flexible
            });

            console.log('Proyectos filtrados para el usuario:', userProjects);
            console.log('Cantidad de proyectos del usuario:', userProjects.length);

            renderProyectos(userProjects);
        } catch (error) {
            console.error('Error al cargar proyectos:', error);
            projectListContainer.innerHTML = '<p class="text-danger">Error al cargar los proyectos: ' + error.message + '</p>';
            noProjectsMessage.style.display = 'none';
        }
    }

    // Llama a la función para cargar proyectos al inicio
    loadUserProjects();
});