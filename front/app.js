let proyectosOriginales = [];
let proyectosFiltrados = [];
const projectsPerPage = 9;
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
  // Lógica de carga de proyectos y filtros inicial
  fetch('https://localhost:7098/api/project')
    .then(res => res.json())
    .then(data => {
      proyectosOriginales = data;
      proyectosFiltrados = data;
      renderProyectos(proyectosFiltrados, currentPage);
      setupPagination(proyectosFiltrados);
    })
    .catch(err => console.error('Error al cargar proyectos:', err));

  document.getElementById('search').addEventListener('input', (e) => {
    const filtro = e.target.value.toLowerCase();
    proyectosFiltrados = proyectosOriginales.filter(p => p.title.toLowerCase().includes(filtro));
    currentPage = 1; 
    renderProyectos(proyectosFiltrados, currentPage);
    setupPagination(proyectosFiltrados);
  });

  const estadoSelect = document.getElementById('estadoSelect');
  if (estadoSelect) {
    estadoSelect.addEventListener('change', aplicarFiltros);
  }
  const creadorSelect = document.getElementById('creadorSelect');
  if (creadorSelect) {
    creadorSelect.addEventListener('change', aplicarFiltros);
  }
  const aprobadorSelect = document.getElementById('aprobadorSelect');
  if (aprobadorSelect) {
    aprobadorSelect.addEventListener('change', aplicarFiltros);
  }
  const btnFiltrar = document.getElementById('btnFiltrar');
  if (btnFiltrar) {
    btnFiltrar.addEventListener('click', aplicarFiltros);
  }

  // Lógica para el manejo de usuario logueado en el encabezado
  const userNameDisplay = document.getElementById('userNameDisplay');
  const logoutButton = document.getElementById('logoutButton');

  let usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');

  if (!usuarioLogueado || !usuarioLogueado.id) {
      // Si no hay usuario logueado, redirigir a la página de login
  } else {
      if (userNameDisplay) {
          userNameDisplay.textContent = usuarioLogueado.name; 
      }
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('usuarioLogueado'); 
        window.location.href = 'login.html'; 
    });
  }

  const headerSearchInput = document.getElementById('headerSearchInput');
  const headerSearchButton = document.getElementById('headerSearchButton');

  if (headerSearchInput) {
    headerSearchInput.addEventListener('input', (e) => {
      const filtro = e.target.value.toLowerCase();
      document.getElementById('search').value = filtro; 
      aplicarFiltros();
    });
  }
  if (headerSearchButton) {
    headerSearchButton.addEventListener('click', () => {
      const filtro = headerSearchInput.value.toLowerCase();
      document.getElementById('search').value = filtro; 
      aplicarFiltros();
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  if (searchQuery) {
      if (headerSearchInput) {
          headerSearchInput.value = searchQuery;
          document.getElementById('search').value = searchQuery; 
          aplicarFiltros(); 
      }
  }

  const scrollToTopBtn = document.getElementById('scrollToTopBtn');

  window.onscroll = function() {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
      if (scrollToTopBtn) {
        scrollToTopBtn.style.display = "block";
      }
    } else {
      if (scrollToTopBtn) {
        scrollToTopBtn.style.display = "none";
      }
    }
  };

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  async function loadUsers() {
    try {
      console.log('Intentando cargar usuarios...'); 
      const response = await fetch('https://localhost:7098/api/user');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }
      const users = await response.json();
      console.log('Usuarios recibidos de la API:', users); 
      console.log('Número de usuarios recibidos:', users.length); 

      const creadorSelect = document.getElementById('creadorSelect');
      const aprobadorSelect = document.getElementById('aprobadorSelect');

      creadorSelect.innerHTML = '<option value="">Todos</option>';
      aprobadorSelect.innerHTML = '<option value="">Todos</option>';

      users.forEach(user => {
        const creadorOption = document.createElement('option');
        creadorOption.value = user.id;
        creadorOption.textContent = user.name;
        creadorSelect.appendChild(creadorOption);

        const aprobadorOption = document.createElement('option');
        aprobadorOption.value = user.id;
        aprobadorOption.textContent = user.name;
        aprobadorSelect.appendChild(aprobadorOption);
      });
      console.log('Selectores de usuarios poblados.'); 

    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }

  loadUsers();
});

function renderDashboardEstadisticas(proyectos) {
  const dashboard = document.getElementById('dashboard-estadisticas');
  if (!dashboard) return;

  const total = proyectos.length;
  let aprobados = 0, pendientes = 0, rechazados = 0, observados = 0, montoTotal = 0;
  proyectos.forEach(p => {
    let status = 'pending';
    if (p.steps && p.steps.length > 0) {
      let hasRejected = false, hasPending = false, hasObserved = false, allApproved = true;
      for (const step of p.steps) {
        let s = typeof step.status === 'string' ? step.status : (step.status?.name || '');
        s = s.toLowerCase().trim();
        if (s === 'rejected') { hasRejected = true; allApproved = false; break; }
        if (s === 'pending') { hasPending = true; allApproved = false; }
        if (s === 'observed') { hasObserved = true; allApproved = false; }
        if (s !== 'approved') { allApproved = false; }
      }
      if (hasRejected) status = 'rejected';
      else if (hasObserved) status = 'observed';
      else if (hasPending) status = 'pending';
      else if (allApproved) status = 'approved';
    } else {
      let s = (p.status && p.status.name) ? p.status.name.toLowerCase().trim() : 'pending';
      status = s;
    }
    if (status === 'approved') aprobados++;
    else if (status === 'pending') pendientes++;
    else if (status === 'rejected') rechazados++;
    else if (status === 'observed') observados++;
    montoTotal += Number(p.estimatedAmount) || 0;
  });

  dashboard.innerHTML = `
    <div class="row g-2 d-flex flex-wrap align-items-stretch justify-content-center h-100">
      <div class="col-6 mb-2 d-flex align-items-stretch">
        <div class="card text-center shadow-sm p-2 flex-fill h-100 d-flex flex-column justify-content-center dashboard-filter-card" data-status="approved" style="border-radius: 14px; background: #e8f5e9; min-width: 0; cursor:pointer;">
          <div style="font-size: 1.5em;">✅</div>
          <div style="font-weight: bold; color: #388e3c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Aprobados</div>
          <div style="font-size: 1.1em;">${aprobados}</div>
        </div>
      </div>
      <div class="col-6 mb-2 d-flex align-items-stretch">
        <div class="card text-center shadow-sm p-2 flex-fill h-100 d-flex flex-column justify-content-center dashboard-filter-card" data-status="rejected" style="border-radius: 14px; background: #ffebee; min-width: 0; cursor:pointer;">
          <div style="font-size: 1.5em;">❌</div>
          <div style="font-weight: bold; color: #d32f2f; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Rechazados</div>
          <div style="font-size: 1.1em;">${rechazados}</div>
        </div>
      </div>
      <div class="col-6 mb-2 d-flex align-items-stretch">
        <div class="card text-center shadow-sm p-2 flex-fill h-100 d-flex flex-column justify-content-center dashboard-filter-card" data-status="pending" style="border-radius: 14px; background: #fffde7; min-width: 0; cursor:pointer;">
          <div style="font-size: 1.5em;">⏳</div>
          <div style="font-weight: bold; color: #fbc02d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Pendientes</div>
          <div style="font-size: 1.1em;">${pendientes}</div>
        </div>
      </div>
      <div class="col-6 mb-2 d-flex align-items-stretch">
        <div class="card text-center shadow-sm p-2 flex-fill h-100 d-flex flex-column justify-content-center dashboard-filter-card" data-status="observed" style="border-radius: 14px; background: #ffc1071a; min-width: 0; cursor:pointer;">
          <div style="font-size: 1.5em;">👁️</div>
          <div style="font-weight: bold; color: #ffc107; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Observados</div>
          <div style="font-size: 1.1em;">${observados}</div>
        </div>
      </div>
      <div class="col-12 mt-2 d-flex align-items-stretch">
        <div class="card text-center shadow-sm p-2 flex-fill h-100 d-flex flex-column justify-content-center" style="border-radius: 14px; background: #f8faff; min-width: 0;">
          <div style="font-size: 2em;">🔢</div>
          <div style="font-weight: bold; color: #1976D2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Total de Proyectos</div>
          <div style="font-size: 1.3em;">${total}</div>
        </div>
      </div>
      <div class="col-12 mt-2 d-flex align-items-stretch">
        <div class="card text-center shadow-sm p-2 flex-fill h-100 d-flex flex-column justify-content-center" style="border-radius: 14px; background: #e3eafc; min-width: 0;">
          <div style="font-size: 1.5em;">📊</div>
          <div style="font-weight: bold; color: #1976D2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Monto total solicitado</div>
          <div style="font-size: 1.1em;">$${montoTotal.toLocaleString('es-AR')}</div>
        </div>
      </div>
    </div>\n  `;

  setTimeout(() => {
    document.querySelectorAll('.dashboard-filter-card').forEach(card => {
      card.addEventListener('click', function() {
        const status = this.getAttribute('data-status');
        filtrarPorEstadoDashboard(status);
      });
    });
  }, 0);
}

function aplicarFiltros() {
  let tempProyectos = [...proyectosOriginales]; 

  const searchText = document.getElementById('search').value.toLowerCase();
  if (searchText) {
    tempProyectos = tempProyectos.filter(p => p.title.toLowerCase().includes(searchText));
  }

  const estadoFiltro = document.getElementById('estadoSelect')?.value;
  if (estadoFiltro) {
    tempProyectos = tempProyectos.filter(p => {
      let overallStatusCalculated = 'pending';
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
      return overallStatusCalculated === estadoSelect.options[estadoSelect.selectedIndex].text.toLowerCase();
    });
  }

  const creadorFiltro = document.getElementById('creadorSelect')?.value;
  if (creadorFiltro) {
    tempProyectos = tempProyectos.filter(p => p.createdByUserId == creadorFiltro);
  }

  const aprobadorFiltro = document.getElementById('aprobadorSelect')?.value;
  if (aprobadorFiltro) {
    tempProyectos = tempProyectos.filter(p => p.steps && p.steps.some(s => s.approvalUser?.id == aprobadorFiltro));
  }

  proyectosFiltrados = tempProyectos;
  currentPage = 1;
  renderProyectos(proyectosFiltrados, currentPage);
  setupPagination(proyectosFiltrados);
  renderDashboardEstadisticas(proyectosFiltrados);
}

function renderProyectos(proyectos, page) {
  const projectsListContainer = document.getElementById('project-list'); 
  projectsListContainer.innerHTML = '';

  const startIndex = (page - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const projectsToRender = proyectos.slice(startIndex, endIndex);

  if (projectsToRender.length === 0 && proyectos.length > 0 && page > 1) {
    currentPage = page - 1;
    renderProyectos(proyectos, currentPage);
    setupPagination(proyectos);
    return;
  }
  
  if (projectsToRender.length === 0) {
    projectsListContainer.innerHTML = '<p class="text-center text-muted">No se encontraron proyectos.</p>';
    return;
  }

  renderDashboardEstadisticas(proyectos);

  projectsToRender.forEach(p => {
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
    card.innerHTML = `
      <div class="card-body d-flex flex-column align-items-center justify-content-center" style="gap: 18px;">
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
      </div>
    `;
    col.appendChild(card);
    projectsListContainer.appendChild(col);
  });
}

function setupPagination(proyectos) {
  const paginationControls = document.getElementById('pagination-controls');
  paginationControls.innerHTML = '';

  const pageCount = Math.ceil(proyectos.length / projectsPerPage);

  if (pageCount <= 1) {
    return; 
  }

  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
  prevLi.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderProyectos(proyectos, currentPage);
      setupPagination(proyectos);
    }
  });
  paginationControls.appendChild(prevLi);

  for (let i = 1; i <= pageCount; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = i;
      renderProyectos(proyectos, currentPage);
      setupPagination(proyectos);
    });
    paginationControls.appendChild(li);
  }

  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${currentPage === pageCount ? 'disabled' : ''}`;
  nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
  nextLi.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage < pageCount) {
      currentPage++;
      renderProyectos(proyectos, currentPage);
      setupPagination(proyectos);
    }
  });
  paginationControls.appendChild(nextLi);
}

function tomarDecision(idProyecto, idPaso, idUsuario, status, observacion = '') {
  fetch(`https://localhost:7098/api/project/${idProyecto}/decision`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: idPaso,
      user: idUsuario,
      status: status,
      observation: observacion
    })
  })
  .then(res => {
    if (res.ok) return res.text();
    return res.text().then(text => { throw new Error(text); });
  })
  .then(msg => alert('Decisión procesada: ' + msg))
  .catch(err => alert('Error al procesar decisión: ' + err.message));
}

function filtrarPorEstadoDashboard(status) {
  let tempProyectos = [...proyectosOriginales];
  tempProyectos = tempProyectos.filter(p => {
    let overallStatusCalculated = 'pending';
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
      if (hasRejectedStep) overallStatusCalculated = 'rejected';
      else if (hasObservedStep) overallStatusCalculated = 'observed';
      else if (hasPendingStep) overallStatusCalculated = 'pending';
      else if (allApproved) overallStatusCalculated = 'approved';
    } else {
      let projectStatusName = 'pending';
      if (p.status && p.status.name) {
        projectStatusName = p.status.name.toLowerCase().trim();
      }
      overallStatusCalculated = projectStatusName;
    }
    return overallStatusCalculated === status;
  });
  proyectosFiltrados = tempProyectos;
  currentPage = 1;
  renderProyectos(proyectosFiltrados, currentPage);
  setupPagination(proyectosFiltrados);
  renderDashboardEstadisticas(proyectosFiltrados);
}
