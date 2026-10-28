/**
 * FisioConecta - Lógica de Interfaz y Directorio Clínico (app.js)
 * Función 1: Registro y Directorio de Pacientes
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado global de la vista
  const state = {
    currentFilter: 'all', // 'all' | 'mild' | 'moderate' | 'severe'
    searchQuery: '',
    selectedPatientCode: null
  };

  // Elementos DOM principales
  const patientListContainer = document.getElementById('patient-list-container');
  const emptyState = document.getElementById('empty-state');
  const searchInput = document.getElementById('search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const statTotalPacientes = document.getElementById('stat-total-pacientes');
  const statAvatarStrip = document.getElementById('stat-avatar-strip');
  const filterCountBadge = document.getElementById('filter-count-badge');
  const countAll = document.getElementById('count-all');

  // Elementos del Modal de Registro
  const modalNewPatient = document.getElementById('modal-new-patient');
  const btnOpenRegisterModal = document.getElementById('btn-open-register-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const btnRegenerateCode = document.getElementById('btn-regenerate-code');
  const formNewPatient = document.getElementById('form-new-patient');
  const inputPatientCode = document.getElementById('input-patient-code');
  const inputPatientCondition = document.getElementById('input-patient-condition');
  const inputPatientZone = document.getElementById('input-patient-zone');
  const inputInitialPain = document.getElementById('input-initial-pain');
  const initialPainBadge = document.getElementById('initial-pain-badge');
  const modalErrorMessage = document.getElementById('modal-error-message');
  const modalErrorText = document.getElementById('modal-error-text');

  // Elementos del Modal de Acciones
  const modalPatientActions = document.getElementById('modal-patient-actions');
  const btnCloseActionModal = document.getElementById('btn-close-action-modal');
  const actionPatientCode = document.getElementById('action-patient-code');
  const actionPatientCondition = document.getElementById('action-patient-condition');
  const actionPatientZone = document.getElementById('action-patient-zone');
  const btnActionNewSession = document.getElementById('btn-action-new-session');
  const btnActionViewEvolution = document.getElementById('btn-action-view-evolution');
  const btnActionDelete = document.getElementById('btn-action-delete');

  // Botones de filtro VAS
  const filterButtons = document.querySelectorAll('.btn-filter');

  // Elementos de navegación inferior
  const tabNavPacientes = document.getElementById('tab-nav-pacientes');
  const tabNavSesion = document.getElementById('tab-nav-sesion');
  const tabNavEvolucion = document.getElementById('tab-nav-evolucion');

  /**
   * Helper: Obtener propiedades de estilo según escala de dolor VAS (0 a 10)
   */
  function getPainMeta(score) {
    const val = Number(score) || 0;
    if (val <= 3) {
      return {
        category: 'mild',
        label: 'Leve',
        bg: 'bg-[#E6F8F3]',
        border: 'border-[#A7E8D7]',
        text: 'text-[#0D7A68]',
        dot: 'bg-[#10B981]'
      };
    } else if (val <= 6) {
      return {
        category: 'moderate',
        label: 'Moderado',
        bg: 'bg-[#FEF3C7]',
        border: 'border-[#FCD34D]',
        text: 'text-[#B45309]',
        dot: 'bg-[#F59E0B]'
      };
    } else {
      return {
        category: 'severe',
        label: 'Intenso',
        bg: 'bg-[#FEE2E2]',
        border: 'border-[#FCA5A5]',
        text: 'text-[#B91C1C]',
        dot: 'bg-[#EF4444]'
      };
    }
  }

  /**
   * Renderizado de la lista de pacientes
   */
  function renderPatients() {
    const allPatients = window.db.getPatients();
    
    // Actualizar métricas generales
    statTotalPacientes.textContent = allPatients.length;
    countAll.textContent = allPatients.length;

    // Renderizar franja de avatares con códigos
    renderAvatarStrip(allPatients);

    // Filtrar por término de búsqueda
    let filtered = allPatients.filter(patient => {
      const q = state.searchQuery.toLowerCase();
      if (!q) return true;
      return (
        patient.codigo.toLowerCase().includes(q) ||
        (patient.diagnostico && patient.diagnostico.toLowerCase().includes(q)) ||
        (patient.zona && patient.zona.toLowerCase().includes(q))
      );
    });

    // Filtrar por nivel de dolor VAS
    if (state.currentFilter !== 'all') {
      filtered = filtered.filter(patient => {
        const meta = getPainMeta(patient.ultimoDolor);
        return meta.category === state.currentFilter;
      });
    }

    // Actualizar contador del filtro
    filterCountBadge.textContent = `${filtered.length} paciente${filtered.length === 1 ? '' : 's'}`;

    // Limpiar contenedor
    patientListContainer.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');

      filtered.forEach(patient => {
        const painMeta = getPainMeta(patient.ultimoDolor);
        const card = document.createElement('article');
        card.className = "bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/40 shadow-[0_2px_12px_rgba(13,122,104,0.05)] active:scale-[0.99] transition-all duration-150 cursor-pointer hover:border-primary-container/40 group";
        
        card.innerHTML = `
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2.5">
              <!-- Código Anónimo -->
              <div class="px-2.5 py-1 rounded-md bg-[#E8F3F1] border border-[#C5E2DC] text-[#0D7A68] font-mono-code font-bold tracking-wider text-xs">
                ${escapeHtml(patient.codigo)}
              </div>
              <span class="inline-flex items-center gap-1 text-[11px] text-secondary">
                <span class="material-symbols-outlined text-[13px]">schedule</span>
                ${escapeHtml(patient.ultimaSesionFecha || 'Reciente')}
              </span>
            </div>
            
            <!-- Pastilla de Dolor VAS -->
            <div class="flex items-center gap-1.5 ${painMeta.bg} border ${painMeta.border} px-2.5 py-0.5 rounded-full">
              <span class="w-2 h-2 rounded-full ${painMeta.dot}"></span>
              <span class="font-mono-code text-[12px] font-bold ${painMeta.text}">${patient.ultimoDolor}/10</span>
              <span class="text-[11px] ${painMeta.text} font-semibold">${painMeta.label}</span>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-12 gap-2 items-center">
            <div class="col-span-8">
              <span class="text-[11px] text-outline block">Diagnóstico / Región</span>
              <h3 class="text-sm text-on-surface font-semibold tracking-tight leading-snug">
                ${escapeHtml(patient.diagnostico)}
              </h3>
              <p class="text-[11px] text-on-surface-variant mt-0.5">${escapeHtml(patient.zona)}</p>
            </div>
            <div class="col-span-4 text-right">
              <span class="text-[11px] text-outline block">Historial</span>
              <span class="text-xs font-semibold text-secondary">
                ${patient.totalSesiones || 0} sesión${(patient.totalSesiones || 0) === 1 ? '' : 'es'}
              </span>
            </div>
          </div>

          <div class="mt-3 pt-2.5 border-t border-outline-variant/20 flex items-center justify-between text-secondary">
            <div class="flex items-center gap-1 text-[11px] text-on-surface-variant">
              <span class="material-symbols-outlined text-[15px] text-primary">reorder</span>
              <span class="truncate max-w-[240px]">${escapeHtml(patient.fase || 'En tratamiento')}</span>
            </div>
            <span class="material-symbols-outlined text-[18px] text-primary transition-transform group-hover:translate-x-0.5">chevron_right</span>
          </div>
        `;

        card.addEventListener('click', () => openPatientActionModal(patient));
        patientListContainer.appendChild(card);
      });
    }
  }

  /**
   * Renderizar franja superior con códigos en burbujas
   */
  function renderAvatarStrip(patients) {
    statAvatarStrip.innerHTML = '';
    const slice = patients.slice(0, 3);
    slice.forEach(p => {
      const bubble = document.createElement('div');
      // Extrae sólo números del código (ej: PAC-842 -> 842)
      const numOnly = p.codigo.replace(/\D/g, '').slice(-3) || p.codigo.slice(-3);
      bubble.className = "w-8 h-8 rounded-full bg-secondary-container text-primary font-mono-code text-[11px] flex items-center justify-center ring-2 ring-surface-container-lowest font-bold";
      bubble.textContent = numOnly;
      statAvatarStrip.appendChild(bubble);
    });

    if (patients.length > 3) {
      const moreBubble = document.createElement('div');
      moreBubble.className = "w-8 h-8 rounded-full bg-surface-container text-primary font-mono-code text-[11px] flex items-center justify-center ring-2 ring-surface-container-lowest font-bold";
      moreBubble.textContent = `+${patients.length - 3}`;
      statAvatarStrip.appendChild(moreBubble);
    }
  }

  /**
   * Abrir modal para registrar paciente
   */
  function openRegisterModal() {
    modalErrorMessage.classList.add('hidden');
    formNewPatient.reset();
    inputInitialPain.value = 5;
    updatePainSliderBadge(5);

    // Generar código único aleatorio por defecto
    const autoCode = window.db.generateUniqueCode();
    inputPatientCode.value = autoCode;

    modalNewPatient.classList.remove('hidden');
    modalNewPatient.classList.add('flex');
    inputPatientCondition.focus();
  }

  function closeRegisterModal() {
    modalNewPatient.classList.add('hidden');
    modalNewPatient.classList.remove('flex');
  }

  /**
   * Actualizar badge interactivo del deslizador de dolor
   */
  function updatePainSliderBadge(val) {
    const meta = getPainMeta(val);
    initialPainBadge.textContent = `${val}/10`;
    initialPainBadge.className = `font-mono-code text-xs font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text} border ${meta.border} min-w-[50px] text-center`;
  }

  inputInitialPain.addEventListener('input', (e) => {
    updatePainSliderBadge(e.target.value);
  });

  /**
   * Botón regenerar código
   */
  btnRegenerateCode.addEventListener('click', () => {
    inputPatientCode.value = window.db.generateUniqueCode();
    inputPatientCode.focus();
  });

  /**
   * Enviar formulario de nuevo paciente
   */
  formNewPatient.addEventListener('submit', (e) => {
    e.preventDefault();
    modalErrorMessage.classList.add('hidden');

    const codigo = inputPatientCode.value.trim().toUpperCase();
    const diagnostico = inputPatientCondition.value.trim();
    const zona = inputPatientZone.value.trim() || 'Zona no especificada';
    const ultimoDolor = parseInt(inputInitialPain.value, 10);

    if (!codigo) {
      showModalError('El código del paciente es obligatorio.');
      return;
    }

    if (!diagnostico) {
      showModalError('El diagnóstico o motivo de consulta es obligatorio.');
      return;
    }

    try {
      const nuevo = window.db.addPatient({
        codigo,
        diagnostico,
        zona,
        ultimoDolor,
        fase: 'Evaluación y registro inicial'
      });

      closeRegisterModal();
      showToast(`¡Ficha clínica ${nuevo.codigo} creada exitosamente!`, 'success');
      renderPatients();
    } catch (err) {
      showModalError(err.message || 'Error al guardar la ficha.');
    }
  });

  function showModalError(msg) {
    modalErrorText.textContent = msg;
    modalErrorMessage.classList.remove('hidden');
  }

  /**
   * Modal de acciones al tocar una ficha
   */
  function openPatientActionModal(patient) {
    state.selectedPatientCode = patient.codigo;
    actionPatientCode.textContent = patient.codigo;
    actionPatientCondition.textContent = patient.diagnostico;
    actionPatientZone.textContent = `${patient.zona} • ${patient.totalSesiones || 0} sesiones registradas`;

    modalPatientActions.classList.remove('hidden');
    modalPatientActions.classList.add('flex');
  }

  function closePatientActionModal() {
    modalPatientActions.classList.add('hidden');
    modalPatientActions.classList.remove('flex');
  }

  btnCloseActionModal.addEventListener('click', closePatientActionModal);
  modalPatientActions.addEventListener('click', (e) => {
    if (e.target === modalPatientActions) closePatientActionModal();
  });

  // Acciones dentro del modal
  btnActionNewSession.addEventListener('click', () => {
    closePatientActionModal();
    showToast(`Preparando sesión para ${state.selectedPatientCode}... (Función 2: Siguiente paso)`, 'info');
  });

  btnActionViewEvolution.addEventListener('click', () => {
    closePatientActionModal();
    showToast(`Preparando historial y gráfica para ${state.selectedPatientCode}... (Función 3)`, 'info');
  });

  btnActionDelete.addEventListener('click', () => {
    if (confirm(`¿Estás seguro de eliminar la ficha de ${state.selectedPatientCode}? Esta acción no se puede deshacer.`)) {
      const codeToDelete = state.selectedPatientCode;
      window.db.deletePatient(codeToDelete);
      closePatientActionModal();
      showToast(`Ficha ${codeToDelete} eliminada correctamente.`, 'info');
      renderPatients();
    }
  });

  /**
   * Búsqueda en tiempo real
   */
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    if (state.searchQuery) {
      btnClearSearch.classList.remove('hidden');
    } else {
      btnClearSearch.classList.add('hidden');
    }
    renderPatients();
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    btnClearSearch.classList.add('hidden');
    renderPatients();
    searchInput.focus();
  });

  // Botón lupa en cabecera
  document.getElementById('btn-quick-search-toggle').addEventListener('click', () => {
    searchInput.focus();
    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /**
   * Filtros VAS interactivos
   */
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      state.currentFilter = filter;

      // Actualizar aspecto de los botones
      filterButtons.forEach(b => {
        b.className = "btn-filter flex-shrink-0 px-3.5 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/40 text-on-surface hover:bg-surface-container-low text-xs font-medium active:scale-95 transition-all flex items-center gap-1.5";
      });

      btn.className = "btn-filter flex-shrink-0 px-3.5 py-1.5 rounded-full bg-primary-container text-white text-xs font-semibold active:scale-95 transition-all flex items-center gap-1.5 shadow-sm";

      renderPatients();
    });
  });

  /**
   * Botones de navegación inferior
   */
  tabNavPacientes.addEventListener('click', () => {
    showToast('Ya te encuentras en el Directorio de Pacientes', 'info');
  });

  tabNavSesion.addEventListener('click', () => {
    showToast('Función 2: Registro de Nueva Sesión (se activará en el siguiente paso)', 'info');
  });

  tabNavEvolucion.addEventListener('click', () => {
    showToast('Función 3: Consulta de Evolución (se activará en el paso 3)', 'info');
  });

  /**
   * Eventos del Modal de Registro
   */
  btnOpenRegisterModal.addEventListener('click', openRegisterModal);
  btnCloseModal.addEventListener('click', closeRegisterModal);
  btnCancelModal.addEventListener('click', closeRegisterModal);

  modalNewPatient.addEventListener('click', (e) => {
    if (e.target === modalNewPatient) closeRegisterModal();
  });

  /**
   * Helper: Sistema de Toast Flotante
   */
  let toastTimeout;
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toastBody = document.getElementById('toast-body');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    clearTimeout(toastTimeout);

    toastMessage.textContent = message;
    if (type === 'success') {
      toastBody.className = "bg-primary text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-primary-container";
      toastIcon.textContent = 'check_circle';
    } else if (type === 'error') {
      toastBody.className = "bg-error text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-red-700";
      toastIcon.textContent = 'error';
    } else {
      toastBody.className = "bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-outline-variant";
      toastIcon.textContent = 'info';
    }

    container.classList.remove('opacity-0', 'pointer-events-none');
    container.classList.add('opacity-100');

    toastTimeout = setTimeout(() => {
      container.classList.remove('opacity-100');
      container.classList.add('opacity-0', 'pointer-events-none');
    }, 3200);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Reactividad al cambiar datos
  window.addEventListener('fisioconecta:data-change', () => {
    renderPatients();
  });

  // Render inicial al cargar
  renderPatients();
});
