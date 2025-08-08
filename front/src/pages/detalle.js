document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

  const userNameDisplay = document.getElementById('userNameDisplay');
  if (userNameDisplay && usuarioLogueado && usuarioLogueado.name) {
    userNameDisplay.textContent = usuarioLogueado.name;
    console.log('DEBUG: Nombre de usuario en header actualizado a:', usuarioLogueado.name);
  } else {
    console.log('DEBUG: No se pudo actualizar el nombre de usuario en el header. usuarioLogueado:', usuarioLogueado, 'userNameDisplay existe:', !!userNameDisplay);
  }

  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('usuarioLogueado');
      window.location.href = 'login.html';
    });
  }

  const usuarioLogueadoId = usuarioLogueado.id;

  if (!usuarioLogueado || !usuarioLogueado.id) {
      window.location.href = 'login.html';
      return;
  }

  if (!id) {
    document.getElementById("detalle").textContent = "ID de proyecto no especificado.";
    return;
  }

  const successMsgModal = document.getElementById('success-message-modal');
  const successMsgModalBg = document.getElementById('success-message-modal-bg');
  const successMsgModalText = document.getElementById('success-modal-message');
  const successMsgModalCloseBtn = document.getElementById('success-modal-close-btn');
  const successModalCloseCross = document.getElementById('success-modal-close-cross');

  fetch(`https://localhost:7098/api/project/${id}`)
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById("detalle");
      const projectData = data; // Guardar los datos del proyecto

      // Detectar si el estado del proyecto es Pending (robusto)
      let estado = data.status?.name || data.statusName || data.status || '';
      if (typeof estado === 'number') estado = String(estado);
      const isProjectPending = estado.trim().toLowerCase() === 'pending' || estado.trim() === '1';

      contenedor.innerHTML = `
        <div class="card shadow-lg p-4 mb-4" style="border-radius: 18px; background: #fff; border: none;">
          <div style="background: linear-gradient(90deg, #1976D2 0%, #42a5f5 100%); padding: 20px 25px; border-radius: 15px; margin-bottom: 30px; text-align: center; box-shadow: 0 6px 20px rgba(25,118,210,0.25);">
            <h3 class="fw-bold" style="color: #fff; margin-bottom: 0; font-size: 2.5rem; letter-spacing: 1.5px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-shadow: 1px 1px 3px rgba(0,0,0,0.2);">${data.title}</h3>
          </div>
          
          <div class="row g-4 mb-4">
            <div class="col-12">
              <div class="p-3 h-100" style="background: #f8faff; border-radius: 12px; border: 1px solid #e3eafc; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <p class="mb-1" style="color: #1976D2; font-weight: bold;">Descripción:</p>
                <p style="color: #444;">${data.description}</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="p-3 h-100" style="background: #f8faff; border-radius: 12px; border: 1px solid #e3eafc; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <p class="mb-1" style="color: #1976D2; font-weight: bold;">Área:</p>
                <p style="color: #444;">${data.area?.name ?? data.areaName ?? 'N/A'}</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="p-3 h-100" style="background: #f8faff; border-radius: 12px; border: 1px solid #e3eafc; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <p class="mb-1" style="color: #1976D2; font-weight: bold;">Tipo:</p>
                <p style="color: #444;">${data.type?.name ?? data.typeName ?? 'N/A'}</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="p-3 h-100" style="background: #f8faff; border-radius: 12px; border: 1px solid #e3eafc; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <p class="mb-1" style="color: #1976D2; font-weight: bold;">Monto estimado:</p>
                <p style="color: #444;">$${data.estimatedAmount}</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="p-3 h-100" style="background: #f8faff; border-radius: 12px; border: 1px solid #e3eafc; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <p class="mb-1" style="color: #1976D2; font-weight: bold;">Duración estimada:</p>
                <p style="color: #444;">${data.estimatedDuration} días</p>
              </div>
            </div>
            <div class="col-12">
              <div class="p-3 h-100" style="background: #f8faff; border-radius: 12px; border: 1px solid #e3eafc; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <p class="mb-1" style="color: #1976D2; font-weight: bold;">Creador:</p>
                <p style="color: #444;">${data.createdByUser?.name ?? data.createdByUserName ?? data.createdByUserId}</p>
              </div>
            </div>
          </div>

          <div class="text-center mt-3">
            <button class="btn btn-primary btn-lg" onclick="window.location.href='editar.html?id=${data.id}'" style="border-radius: 12px; font-weight: bold; padding: 12px 24px;">Editar Proyecto</button>
          </div>
        </div>
      `;

      if (data.steps && data.steps.length > 0) {
        const tableContainer = document.createElement("div");
        tableContainer.className = "card shadow-lg p-4 mb-4"; // Contenedor para la tabla
        tableContainer.style.cssText = "border-radius: 18px; background: #fff; border: none; overflow-x: auto;";

        const tableTitle = document.createElement("h4");
        tableTitle.className = "fw-bold text-primary mb-4 text-center";
        tableTitle.style.cssText = "letter-spacing: 1px;";
        tableTitle.textContent = "Pasos de Aprobación";
        tableContainer.appendChild(tableTitle);

        const tabla = document.createElement("table");
        tabla.className = "table table-hover table-striped table-bordered text-center";
        tabla.style.cssText = "border-radius: 12px; overflow: hidden; margin-bottom: 0;"

        tabla.innerHTML = `
          <thead class="table-primary">
            <tr>
              <th scope="col" class="text-center" style="width: 10%;">Orden</th>
              <th scope="col" class="text-center" style="width: 25%;">Rol Aprobador</th>
              <th scope="col" class="text-center" style="width: 25%;">Usuario Asignado</th>
              <th scope="col" class="text-center" style="width: 15%;">Estado</th>
              <th scope="col" class="text-center" style="width: 25%;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${data.steps.map(step => {
              const isStepPending = (step.status?.name || step.status || '').toLowerCase() === 'pending' || step.status === 1;
              
              // Depuración
              console.log('--- DEBUG Paso Actual ---');
              console.log('ID Proyecto:', data.id);
              console.log('ID Paso:', step.id);
              console.log('Estado del paso (isStepPending):', isStepPending);
              console.log('Usuario logueado ID:', usuarioLogueadoId);
              console.log('Usuario asignado al paso (ID o valor):', step.approvalUser?.id || step.approvalUser);
              console.log('Rol del paso:', step.roleName);

              const assignedUserIdFromStep = String(step.approvalUser?.id || step.approvalUser || '').trim();
              const loggedInUserIdString = String(usuarioLogueadoId).trim();
              // DEBUG: Verificación del rol del usuario logueado:
              // console.log('DEBUG: Rol del usuario logueado:', usuarioLogueado.roleName);
              // console.log('DEBUG: Objeto usuarioLogueado completo:', usuarioLogueado);

              let canUserApprove = false;

              if (isStepPending) {
                  if (assignedUserIdFromStep && assignedUserIdFromStep !== 'n/a' && assignedUserIdFromStep !== 'null' && assignedUserIdFromStep !== 'undefined' && assignedUserIdFromStep === loggedInUserIdString) {
                      canUserApprove = true; // Asignado a este usuario
                  } else if ((!assignedUserIdFromStep || assignedUserIdFromStep === 'n/a' || assignedUserIdFromStep === 'null' || assignedUserIdFromStep === 'undefined') && (usuarioLogueado.roleName === step.roleName)) {
                      // Si no hay usuario asignado y el rol del usuario logueado coincide con el rol del paso, puede aprobar.
                      canUserApprove = true;
                      console.warn('ADVERTENCIA: Habilitando botón para rol ' + usuarioLogueado.roleName + ' sin usuario asignado explícito.');
                  }
              }

              const disabled = !canUserApprove ? 'disabled' : '';
              const userAssignedName = step.approvalUser?.name || step.approvalUser || 'N/A';
              
              let statusBadgeClass = '';
              let statusText = step.status?.name || step.status || 'N/A';

              switch(statusText.toLowerCase()) {
                case 'pending':
                case '1':
                  statusBadgeClass = 'bg-warning text-dark'; // Amarillo para pendiente
                  statusText = 'Pendiente';
                  break;
                case 'approved':
                case '2':
                  statusBadgeClass = 'bg-success'; // Verde para aprobado
                  statusText = 'Aprobado';
                  break;
                case 'rejected':
                case '3':
                  statusBadgeClass = 'bg-danger'; // Rojo para rechazado
                  statusText = 'Rechazado';
                  break;
                case 'observed':
                case '4':
                  statusBadgeClass = 'bg-info'; // Azul claro para observado
                  statusText = 'Observado';
                  break;
                default:
                  statusBadgeClass = 'bg-secondary';
                  statusText = 'Desconocido';
                  break;
              }

              return `
              <tr>
                <td>${step.stepOrder}</td>
                <td>${step.roleName}</td>
                <td>${userAssignedName}</td>
                <td><span class="badge ${statusBadgeClass}">${statusText}</span></td>
                <td>
                  <button class="btn btn-success btn-sm me-1 ${!canUserApprove ? 'btn-disabled' : ''}" ${disabled} onclick="tomarDecision('${data.id}', '${step.id}', 2, '${step.approvalUser?.id || step.approvalUser || ''}', '${step.roleName}')">Aprobar</button>
                  <button class="btn btn-danger btn-sm me-1 ${!canUserApprove ? 'btn-disabled' : ''}" ${disabled} onclick="tomarDecision('${data.id}', '${step.id}', 3, '${step.approvalUser?.id || step.approvalUser || ''}', '${step.roleName}')">Rechazar</button>
                  <button class="btn btn-warning btn-sm ${!canUserApprove ? 'btn-disabled' : ''}" ${disabled} onclick="tomarDecision('${data.id}', '${step.id}', 4, '${step.approvalUser?.id || step.approvalUser || ''}', '${step.roleName}')">Observar</button>
                </td>
              </tr>
              `;
            }).join('')}
          </tbody>
        `;
        tableContainer.appendChild(tabla);
        contenedor.appendChild(tableContainer);

      } else {
        const aviso = document.createElement("p");
        aviso.textContent = "Este proyecto no tiene pasos de aprobación definidos.";
        contenedor.appendChild(aviso);
      }
    })
    .catch(err => {
      document.getElementById("detalle").textContent = "Error al cargar proyecto: " + err.message;
      console.error('Error al cargar el proyecto:', err);
    });

  // 👇 Función para tomar decisiones
  window.tomarDecision = function(idProyecto, idPaso, status, expectedApprovalUserId, stepRoleName) {
    console.log('DEBUG: tomarDecision llamado con:', { idProyecto, idPaso, status, expectedApprovalUserId, stepRoleName });
    console.log('DEBUG: usuarioLogueadoId (desde localStorage): ', usuarioLogueadoId);
    console.log('DEBUG: Rol del usuario logueado:', usuarioLogueado.roleName);

    const isAssigned = expectedApprovalUserId && expectedApprovalUserId !== 'n/a' && expectedApprovalUserId !== 'null' && expectedApprovalUserId !== 'undefined';
    const isUserAssignedAndMatches = isAssigned && String(usuarioLogueadoId) === String(expectedApprovalUserId);
    const isRoleBasedApproval = (!isAssigned) && (usuarioLogueado.roleName === stepRoleName);

    if (!isUserAssignedAndMatches && !isRoleBasedApproval) {
        mostrarMensajeError("Usuario sin permiso. Esta acción solo puede ser realizada por el usuario asignado al paso o por un usuario con el rol de " + stepRoleName + ".");
        return;
    }

    // Si el usuario tiene permiso, mostrar el modal de decisión
    mostrarModalDecision(idProyecto, idPaso, status, usuarioLogueadoId);
  };

  function mostrarModalDecision(idProyecto, idPaso, status, usuarioQueAprobaraId) {
    console.log('DEBUG: mostrarModalDecision llamado con:', { idProyecto, idPaso, status, usuarioQueAprobaraId });

    const modalBg = document.getElementById('custom-modal-bg');
    const modal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalObs = document.getElementById('modal-observacion'); // Este es el elemento que era null
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');
    const modalError = document.getElementById('modal-error');

    let accion = 'Aprobar';
    if (status == 3) accion = 'Rechazar';
    if (status == 4) accion = 'Observar';
    modalTitle.textContent = `${accion} Proyecto`;
    
    // Asegurarse de que modalObs no sea null antes de intentar setear su valor
    if (modalObs) {
      modalObs.value = '';
    } else {
      console.error('ERROR: El elemento modal-observacion no fue encontrado en el DOM.');
      mostrarMensajeError('Error interno: El campo de observación no está disponible.');
      return;
    }
    
    modalError.style.display = 'none';
    modalError.textContent = '';
    modalBg.style.display = 'block';
    modal.style.display = 'block';
    modalObs.focus();

    modalConfirm.onclick = function() {
      const obs = modalObs.value.trim();
      // La observación es obligatoria para Rechazar u Observar
      if ((status === 3 || status === 4) && obs === '') {
        modalError.textContent = 'La observación es obligatoria para esta acción.';
        modalError.style.display = 'block';
        modalObs.focus();
        return;
      }

      modalError.style.display = 'none';
      modalBg.style.display = 'none';
      modal.style.display = 'none';

      const botones = document.querySelectorAll('button');
      botones.forEach(b => b.disabled = true);

      console.log('DEBUG: Enviando decisión:', {
        id: idPaso,
        user: usuarioQueAprobaraId,
        status: status,
        observation: obs
      });

      fetch(`https://localhost:7098/api/project/${idProyecto}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: idPaso,
          user: usuarioQueAprobaraId,
          status: status,
          observation: obs
        })
      })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => { throw new Error(text); });
        }
        return res.text();
      })
      .then(msg => {
        console.log('DEBUG: Decisión procesada exitosamente:', msg);
        mostrarMensajeExito(msg);
      })
      .catch(err => {
        console.error('ERROR: Error al procesar decisión:', err);
        botones.forEach(b => b.disabled = false);
        let mensaje = err.message.replace('Error al procesar decisión: ','');
        if (mensaje.includes('El paso anterior aún no ha sido aprobado ni observado.')) {
          mensaje = 'Paso no habilitado.';
        }
        modalError.textContent = mensaje;
        modalError.style.display = 'block';
        modalBg.style.display = 'block';
        modal.style.display = 'block';
      });
    };

    modalCancel.onclick = function() {
      modalBg.style.display = 'none';
      modal.style.display = 'none';
    };

    modalBg.onclick = function() {
      modalBg.style.display = 'none';
      modal.style.display = 'none';
    };
  }

  function mostrarMensajeExito(message) {
    const successMsgModal = document.getElementById('success-message-modal');
    const successMsgModalText = document.getElementById('success-modal-message');

    if (successMsgModal && successMsgModalText) {
      successMsgModalText.textContent = message;
      successMsgModal.style.display = 'block';
      
      const successMsgModalBg = document.getElementById('success-message-modal-bg');
      if (successMsgModalBg) successMsgModalBg.style.display = 'block';
    } else {
      console.error('ERROR: No se pudo encontrar el modal de éxito o su texto.');
    }
  }

  function mostrarMensajeError(message) {
    const errorModal = document.getElementById('error-modal');
    const errorModalBg = document.getElementById('error-modal-bg');
    const errorMessage = document.getElementById('error-message');
    const errorModalCloseCross = document.getElementById('error-modal-close'); // The 'x' icon
    const errorModalCloseBtn = document.getElementById('error-modal-close-btn'); // The 'Cerrar' button

    errorMessage.textContent = message;
    errorModal.style.display = 'block';
    errorModalBg.style.display = 'block';

    const closeErrorModal = () => {
      errorModal.style.display = 'none';
      errorModalBg.style.display = 'none';
    };

    errorModalCloseCross.onclick = closeErrorModal;
    errorModalCloseBtn.onclick = closeErrorModal;
    errorModalBg.onclick = closeErrorModal;
  }
});
