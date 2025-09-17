document.addEventListener('DOMContentLoaded', () => {
  const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
  if (!usuarioLogueado || !usuarioLogueado.id) {
      window.location.href = 'login.html';
      return;
  }

  // Función para actualizar el nombre del usuario
  function updateUserDisplay() {
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay && usuarioLogueado.name) {
        userNameDisplay.textContent = usuarioLogueado.name;
        console.log('Nombre del usuario actualizado en crear:', usuarioLogueado.name);
    } else {
        console.error('No se pudo actualizar el nombre del usuario en crear');
    }
  }
  
  // Ejecutar inmediatamente y también después de un pequeño delay
  updateUserDisplay();
  setTimeout(updateUserDisplay, 100);

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

  const form = document.getElementById('project-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const proyecto = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      area: parseInt(document.getElementById('area').value),
      type: parseInt(document.getElementById('type').value),
      estimatedAmount: parseFloat(document.getElementById('estimatedAmount').value),
      estimatedDuration: parseInt(document.getElementById('estimatedDuration').value),
      createdByUserId: usuarioLogueado.id
    };

    const response = await fetch('https://localhost:7098/api/project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(proyecto)
    });

    if (response.ok) {
      const result = await response.json();
      const successMessage = document.getElementById('success-message');
      const successModal = document.getElementById('success-modal');
      const successModalBg = document.getElementById('success-modal-bg');
      const successModalClose = document.getElementById('success-modal-close');

      successMessage.textContent = '';
      successModal.style.display = 'block';
      successModalBg.style.display = 'block';

      const closeModal = () => {
        successModal.style.display = 'none';
        successModalBg.style.display = 'none';
        form.reset();
      };

      successModalClose.onclick = closeModal;
      successModalBg.onclick = closeModal;

    } else {
      const errorText = await response.text();
      const errorModal = document.getElementById('error-modal');
      const errorModalBg = document.getElementById('error-modal-bg');
      const errorMessage = document.getElementById('error-message');
      const errorModalClose = document.getElementById('error-modal-close');

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage.textContent = errorJson.error || 'Ocurrió un error desconocido.';
      } catch (e) {
        errorMessage.textContent = 'Error: ' + errorText;
      }

      errorModal.style.display = 'block';
      errorModalBg.style.display = 'block';

      const closeErrorModal = () => {
        errorModal.style.display = 'none';
        errorModalBg.style.display = 'none';
      };

      errorModalClose.onclick = closeErrorModal;
      errorModalBg.onclick = closeErrorModal;
    }
  });

  // Cargar áreas
  fetch('https://localhost:7098/api/Area')
    .then(res => {
      if (!res.ok) throw new Error('Error HTTP: ' + res.status);
      return res.json();
    })
    .then(data => {
      const areaSelect = document.getElementById('area');
      data.forEach(area => {
        const option = document.createElement('option');
        option.value = area.id;
        option.textContent = area.name;
        areaSelect.appendChild(option);
      });
    })
    .catch(err => {
      const areaSelect = document.getElementById('area');
      areaSelect.innerHTML = '';
      const errorOption = document.createElement('option');
      errorOption.value = '';
      errorOption.textContent = 'Error al cargar áreas: ' + err.message;
      areaSelect.appendChild(errorOption);
      areaSelect.disabled = true;
      console.error('Error al obtener áreas:', err);
    });

  // Cargar tipos de proyecto
  fetch('https://localhost:7098/api/ProjectType')
    .then(res => {
      if (!res.ok) throw new Error('Error HTTP: ' + res.status);
      return res.json();
    })
    .then(data => {
      const typeSelect = document.getElementById('type');
      data.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        typeSelect.appendChild(option);
      });
    })
    .catch(err => {
      const typeSelect = document.getElementById('type');
      typeSelect.innerHTML = '';
      const errorOption = document.createElement('option');
      errorOption.value = '';
      errorOption.textContent = 'Error al cargar tipos: ' + err.message;
      typeSelect.appendChild(errorOption);
      typeSelect.disabled = true;
      console.error('Error al obtener tipos de proyecto:', err);
    });
});