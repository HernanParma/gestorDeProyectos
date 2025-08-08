document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded en editar.js');

  const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  if (!usuarioLogueado || !usuarioLogueado.id) {
      window.location.href = 'login.html';
      return;
  }

  const loggedInUserId = usuarioLogueado.id;

  const userNameDisplay = document.getElementById('userNameDisplay');
  if (userNameDisplay) {
      userNameDisplay.textContent = usuarioLogueado.name;
  }

  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
      logoutButton.addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.removeItem('usuarioLogueado');
          window.location.href = 'login.html';
      });
  }

  const headerSearchInput = document.getElementById('headerSearchInput');
  const headerSearchButton = document.getElementById('headerSearchButton');

  const performHeaderSearch = () => {
      const title = headerSearchInput.value;
      if (title) {
          window.location.href = `index.html?title=${encodeURIComponent(title)}`;
      } else {
          window.location.href = `index.html`;
      }
  };

  if (headerSearchButton) {
      headerSearchButton.onclick = performHeaderSearch;
  }
  if (headerSearchInput) {
      headerSearchInput.addEventListener('keypress', function(event) {
          if (event.key === 'Enter') {
              performHeaderSearch();
          }
      });
  }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        alert('ID de proyecto no especificado.');
        window.location.href = 'index.html';
        return;
    }

    // Cargar datos del proyecto y rellenar el formulario
    fetch(`http://localhost:7098/api/project/${id}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Proyecto no encontrado o error al cargar.');
            }
            return res.json();
        })
        .then(data => {
            console.log('loggedInUserId (tipo y valor):', typeof loggedInUserId, loggedInUserId);
            console.log('data.createdByUser.id (tipo y valor):', typeof data.createdByUser.id, data.createdByUser.id);
            // Verificar si el usuario logueado es el creador del proyecto
            if (data.createdByUser.id !== loggedInUserId) {
                mostrarMensajeError('No tienes permiso para modificar este proyecto.');
                setTimeout(() => {
                    window.location.href = 'mis_proyectos.html';
                }, 2000); // Redirigir después de 2 segundos para que el usuario pueda leer el mensaje
                return; // Detener la ejecución si no tiene permisos
            }

            document.getElementById('title').value = data.title;
            document.getElementById('description').value = data.description;
            document.getElementById('estimatedDuration').value = data.estimatedDuration;

            // Guardar el ID del proyecto en el formulario para la actualización
            document.getElementById('project-form').setAttribute('data-project-id', data.id);
        })
        .catch(error => {
            console.error('Error al cargar los detalles del proyecto:', error);
            alert('Error al cargar los detalles del proyecto: ' + error.message);
            window.location.href = 'index.html'; // Redirigir si no se puede cargar el proyecto
        });

    // Funciones para mostrar los modales de éxito y error
    const successMessageModal = document.getElementById('success-message-modal');
    const successMessageModalBg = document.getElementById('success-message-modal-bg');
    const successModalMessageText = document.getElementById('success-modal-message');
    const successModalCloseBtn = document.getElementById('success-modal-close-btn');
    const errorModal = document.getElementById('error-modal');
    const errorModalBg = document.getElementById('error-modal-bg');
    const errorMessageText = document.getElementById('error-message');
    const errorModalCloseBtn = document.getElementById('error-modal-close-btn');

    function mostrarMensajeExito(message) {
        console.log('Intentando mostrar modal de éxito con mensaje:', message);
        console.log('Elementos del modal: ', { successMessageModal, successMessageModalBg, successModalMessageText });
        if (successMessageModal && successMessageModalBg && successModalMessageText) {
            successModalMessageText.textContent = message;
            successMessageModal.style.display = 'flex';
            successMessageModalBg.style.display = 'block';
            console.log('Modal de éxito debería ser visible.');
        } else {
            console.error('Error: Uno o más elementos del modal de éxito no se encontraron.', { successMessageModal, successMessageModalBg, successModalMessageText });
        }
    }

    function mostrarMensajeError(message) {
        if (errorModal && errorModalBg && errorMessageText) {
            errorMessageText.textContent = message;
            errorModal.style.display = 'block';
            errorModalBg.style.display = 'block';
        }
    }

    // Event Listeners para cerrar los modales
    if (successModalCloseBtn) {
        successModalCloseBtn.addEventListener('click', () => {
            if (successMessageModal) successMessageModal.style.display = 'none';
            if (successMessageModalBg) successMessageModalBg.style.display = 'none';
            window.location.href = `detalle.html?id=${document.getElementById('project-form').getAttribute('data-project-id')}`;
        });
    }
    if (errorModalCloseBtn) {
        errorModalCloseBtn.addEventListener('click', () => {
            if (errorModal) errorModal.style.display = 'none';
            if (errorModalBg) errorModalBg.style.display = 'none';
        });
    }
    if (successMessageModalBg) {
        successMessageModalBg.addEventListener('click', () => {
            if (successMessageModal) successMessageModal.style.display = 'none';
            if (successMessageModalBg) successMessageModalBg.style.display = 'none';
            window.location.href = `detalle.html?id=${document.getElementById('project-form').getAttribute('data-project-id')}`;
        });
    }
    if (errorModalBg) {
        errorModalBg.addEventListener('click', () => {
            if (errorModal) errorModal.style.display = 'none';
            if (errorModalBg) errorModalBg.style.display = 'none';
        });
    }

    const form = document.getElementById('project-form');
    if (form) {
        console.log('Formulario project-form encontrado.');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Evento submit del formulario detectado.');

            const projectIdToUpdate = form.getAttribute('data-project-id');
            console.log('projectIdToUpdate obtenido:', projectIdToUpdate);
            if (!projectIdToUpdate) {
                mostrarMensajeError('Error: ID de proyecto no disponible para actualizar.');
                return;
            }

            const updatedProject = {
                id: projectIdToUpdate,
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                estimatedDuration: parseInt(document.getElementById('estimatedDuration').value)
                // No se incluyen area, type, estimatedAmount ni createdByUserId porque no son editables en este formulario
            };

            try {
                const response = await fetch(`http://localhost:7098/api/project/${projectIdToUpdate}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedProject)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
                }

                mostrarMensajeExito('Proyecto actualizado con éxito!');
                // Redirección se maneja en el event listener del modal de éxito

            } catch (error) {
                console.error('Error al actualizar el proyecto:', error);
                mostrarMensajeError('Error al actualizar el proyecto: ' + error.message);
            }
        });
    }
});