document.addEventListener('DOMContentLoaded', () => {
    const projectListContainer = document.getElementById('my-project-list');
    const noProjectsMessage = document.getElementById('no-projects-message');

    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

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

    let currentProjectIdToDelete = null; // Variable para guardar el ID del proyecto a eliminar

    if (!usuarioLogueado || !usuarioLogueado.id) {
        // Esto no debería ocurrir si la redirección en mis_proyectos.html funciona, pero es una seguridad
        window.location.href = 'login.html';
        return;
    }

    // Funciones para mostrar/ocultar modales
    function showConfirmDeleteModal(projectId) {
        console.log('showConfirmDeleteModal llamada con projectId:', projectId);
        confirmDeleteBtn.setAttribute('data-confirm-project-id', projectId);
        confirmDeleteModalBg.style.display = 'block';
        confirmDeleteModal.style.display = 'block';
    }

    function hideConfirmDeleteModal() {
        confirmDeleteModalBg.style.display = 'none';
        confirmDeleteModal.style.display = 'none';
        confirmDeleteBtn.removeAttribute('data-confirm-project-id');
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
        const projectIdToConfirm = confirmDeleteBtn.getAttribute('data-confirm-project-id');
        console.log('confirmDeleteBtn clickeado. projectIdToConfirm:', projectIdToConfirm);
        if (projectIdToConfirm) {
            hideConfirmDeleteModal();
            deleteProject(projectIdToConfirm);
        } else {
            showSuccessDeleteModal('Error: No se pudo obtener el ID del proyecto para confirmar la eliminación.');
        }
    };

    cancelDeleteBtn.onclick = hideConfirmDeleteModal;
    confirmDeleteModalBg.onclick = hideConfirmDeleteModal;

    successDeleteCloseBtn.onclick = hideSuccessDeleteModal;
    successDeleteCloseCross.onclick = hideSuccessDeleteModal;
    successDeleteModalBg.onclick = hideSuccessDeleteModal;

    // Función para renderizar proyectos (adaptada de index.html)
    function renderProyectos(proyectos) {
        projectListContainer.innerHTML = '';
        if (proyectos.length === 0) {
            noProjectsMessage.style.display = 'block';
            return;
        }
        noProjectsMessage.style.display = 'none';

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
            col.className = 'col-12 col-md-6 col-lg-4';
            const card = document.createElement('div');
            card.className = 'card h-100 shadow-sm';
            card.style.cursor = 'pointer';
            card.onclick = () => window.location.href = `detalle.html?id=${p.id}`;
            console.log(`Rendering project with ID: ${p.id}`);
            card.innerHTML = `
              <div class="card-body d-flex flex-column align-items-center justify-content-center" style="gap: 18px;">
                <div style="width: 100%; display: flex; justify-content: center;">
                  <div style="background: linear-gradient(90deg, #1976D2 60%, #42a5f5 100%); color: #fff; font-size: 1.5rem; font-weight: bold; border-radius: 18px; padding: 12px 24px; margin-bottom: 0; box-shadow: 0 2px 8px rgba(25,118,210,0.08); text-align: center; min-width: 70%;">
                    ${p.title}
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; gap: 10px;">
                  <div style="background: #fff; border-radius: 14px; box-shadow: 0 2px 8px rgba(25,118,210,0.07); padding: 16px 18px; flex-grow: 1; border: 1px solid #e3eafc;">
                    <div class="card-text mb-1" style="color: #1976D2;"><strong>Área:</strong> ${p.area?.name || p.area}</div>
                    <div class="card-text mb-1" style="color: #1976D2;"><strong>Tipo:</strong> ${p.type?.name || p.type}</div>
                    <div class="card-text mb-1" style="color: #1976D2;"><strong>Monto:</strong> $${p.estimatedAmount}</div>
                    <div class="card-text" style="color: #1976D2;"><strong>Duración:</strong> ${p.estimatedDuration} días</div>
                  </div>
                  <div style="text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; min-width: 90px;">
                    <div style="font-size: 0.8em; font-weight: bold; color: #555; margin-bottom: 8px;">ESTADO</div>
                    <div style="background-color: ${badgeColor}; color: ${badgeColor === '#FFEB3B' ? '#333' : '#fff'}; padding: 8px 12px; border-radius: 12px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.1); white-space: nowrap;">
                      ${badgeText}
                    </div>
                  </div>
                </div>
                <button class="btn btn-danger mt-3 delete-project-btn" data-project-id="${p.id}">Eliminar Proyecto</button>
              </div>
            `;
            col.appendChild(card);
            projectListContainer.appendChild(col);
        });

        // Añadir event listeners después de que los elementos estén en el DOM
        document.querySelectorAll('.delete-project-btn').forEach(button => {
            button.addEventListener('click', function(event) {
                event.stopPropagation(); // Evita que el clic en el botón active el click de la tarjeta
                event.stopImmediatePropagation(); // Detiene cualquier otro listener en el mismo elemento
                const projectId = this.getAttribute('data-project-id');
                if (projectId) {
                    showConfirmDeleteModal(projectId);
                } else {
                    showSuccessDeleteModal('Error: No se pudo obtener el ID del proyecto desde el botón de la lista.');
                }
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

    // Función para cargar los proyectos del usuario y los proyectos en los que es aprobador
    async function loadUserProjects() {
        try {
            const userId = usuarioLogueado.id;

            // 1. Obtener proyectos creados por el usuario
            const createdProjectsResponse = await fetch(`https://localhost:7098/api/project?applicant=${userId}`);
            if (!createdProjectsResponse.ok) {
                throw new Error(`HTTP error! status: ${createdProjectsResponse.status} al cargar proyectos creados.`);
            }
            const createdProjects = await createdProjectsResponse.json();

            // 2. Obtener proyectos donde el usuario es aprobador
            const approvedProjectsResponse = await fetch(`https://localhost:7098/api/project?approvalUser=${userId}`);
            if (!approvedProjectsResponse.ok) {
                throw new Error(`HTTP error! status: ${approvedProjectsResponse.status} al cargar proyectos de aprobación.`);
            }
            const approvedProjects = await approvedProjectsResponse.json();

            // Combinar y eliminar duplicados (usando Set para IDs únicos)
            const allProjectsMap = new Map();
            createdProjects.forEach(p => allProjectsMap.set(p.id, p));
            approvedProjects.forEach(p => allProjectsMap.set(p.id, p));

            const combinedProjects = Array.from(allProjectsMap.values());

            renderProyectos(combinedProjects);
        } catch (error) {
            console.error('Error al cargar proyectos:', error);
            projectListContainer.innerHTML = '<p class="text-danger">Error al cargar los proyectos.</p>';
            noProjectsMessage.style.display = 'none';
        }
    }

    // Llama a la función para cargar proyectos al inicio
    loadUserProjects();
}); 