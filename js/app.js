/**
 * FisioConecta - Aplicación Principal y Enrutador SPA
 * Implementa las 4 pantallas clínicas completas:
 * 1. Directorio Clínico de Pacientes
 * 2. Registro de Nueva Sesión (Escala EVA + Prescripción de Ejercicios)
 * 3. Evolución del Paciente con Gráfica Histórica de Dolor
 * 4. Consulta de Sesión Pasada
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // ESTADO GLOBAL DE LA APLICACIÓN
  // ==========================================
  const state = {
    currentView: 'pacientes', // 'pacientes' | 'sesion' | 'evolucion'
    selectedPatientCode: 'PAC-842', // Paciente activo por defecto
    currentFilter: 'all',          // 'all' | 'mild' | 'moderate' | 'severe'
    searchQuery: '',
    
    // Estado del formulario de nueva sesión
    newSession: {
      patientCode: 'PAC-842',
      date: new Date().toISOString().split('T')[0],
      painScore: 4,
      exercises: [],
      notes: ''
    }
  };

  // Presets comunes de ejercicios fisioterapéuticos
  const EXERCISE_PRESETS = [
    { nombre: 'Isometría en pared', series: 3, repeticiones: '35 seg', notas: 'Cadena cinética cerrada' },
    { nombre: 'Puente de glúteos', series: 3, repeticiones: '12 reps', notas: 'Activación posterior' },
    { nombre: 'Sentadilla con apoyo', series: 3, repeticiones: '10 reps', notas: 'Rango libre de dolor' },
    { nombre: 'Elevación de talones', series: 3, repeticiones: '15 reps', notas: 'Fase excéntrica lenta' },
    { nombre: 'Plancha corta de core', series: 3, repeticiones: '20 seg', notas: 'Control lumbo-pélvico' },
    { nombre: 'Movilidad activa guiada', series: 2, repeticiones: '10 reps', notas: 'Sin rebotes' }
  ];

  // ==========================================
  // ELEMENTOS DEL DOM
  // ==========================================
  // Vistas
  const viewPacientes = document.getElementById('view-pacientes');
  const viewSesion = document.getElementById('view-sesion');
  const viewEvolucion = document.getElementById('view-evolucion');

  // Cabecera y Navegación
  const btnHeaderBack = document.getElementById('btn-header-back');
  const tabNavPacientes = document.getElementById('tab-nav-pacientes');
  const tabNavSesion = document.getElementById('tab-nav-sesion');
  const tabNavEvolucion = document.getElementById('tab-nav-evolucion');
  const navTabs = [tabNavPacientes, tabNavSesion, tabNavEvolucion];

  // Directorio de Pacientes
  const patientListContainer = document.getElementById('patient-list-container');
  const emptyState = document.getElementById('empty-state');
  const searchInput = document.getElementById('search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const statTotalPacientes = document.getElementById('stat-total-pacientes');
  const statAvatarStrip = document.getElementById('stat-avatar-strip');
  const filterCountBadge = document.getElementById('filter-count-badge');
  const countAll = document.getElementById('count-all');
  const filterButtons = document.querySelectorAll('.btn-filter');

  // Modal Alta Rápida de Paciente
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

  // Modal Acciones Rápidas
  const modalPatientActions = document.getElementById('modal-patient-actions');
  const btnCloseActionModal = document.getElementById('btn-close-action-modal');
  const actionPatientCode = document.getElementById('action-patient-code');
  const actionPatientCondition = document.getElementById('action-patient-condition');
  const actionPatientZone = document.getElementById('action-patient-zone');
  const btnActionNewSession = document.getElementById('btn-action-new-session');
  const btnActionViewEvolution = document.getElementById('btn-action-view-evolution');
  const btnActionDelete = document.getElementById('btn-action-delete');

  // Pantalla Registro de Sesión
  const sessionPatientSelect = document.getElementById('session-patient-select');
  const sessionInputDate = document.getElementById('session-input-date');
  const sessionCounterBadge = document.getElementById('session-counter-badge');
  const sessionPatientDiagnosis = document.getElementById('session-patient-diagnosis');
  const sessionPatientPrevPain = document.getElementById('session-patient-prev-pain');
  const sessionEvaScoreBadge = document.getElementById('session-eva-score-badge');
  const sessionEvaStatusCard = document.getElementById('session-eva-status-card');
  const sessionEvaStatusText = document.getElementById('session-eva-status-text');
  const sessionEvaStatusCircle = document.getElementById('session-eva-status-circle');
  const sessionEvaRail = document.getElementById('session-eva-rail');
  const sessionDeltaBanner = document.getElementById('session-eva-delta-banner');
  const sessionDeltaIcon = document.getElementById('session-delta-icon');
  const sessionDeltaText = document.getElementById('session-delta-text');
  const sessionDeltaPill = document.getElementById('session-delta-pill');
  const sessionExercisesList = document.getElementById('session-exercises-list');
  const sessionExerciseCountLabel = document.getElementById('session-exercise-count-label');
  const inputNewExerciseName = document.getElementById('input-new-exercise-name');
  const btnAddExercise = document.getElementById('btn-add-exercise');
  const exercisePresetsContainer = document.getElementById('exercise-presets-container');
  const sessionInputNotes = document.getElementById('session-input-notes');
  const btnSaveSession = document.getElementById('btn-save-session');

  // Pantalla Evolución y Gráfica
  const evolPatientCode = document.getElementById('evol-patient-code');
  const evolPatientDiagnosis = document.getElementById('evol-patient-diagnosis');
  const evolPatientZone = document.getElementById('evol-patient-zone');
  const evolPatientSelect = document.getElementById('evol-patient-select');
  const evolPatientStartDate = document.getElementById('evol-patient-start-date');
  const evolPatientSessionsCount = document.getElementById('evol-patient-sessions-count');
  const evolMetricInitialPain = document.getElementById('evol-metric-initial-pain');
  const evolMetricCurrentPain = document.getElementById('evol-metric-current-pain');
  const evolMetricDeltaPain = document.getElementById('evol-metric-delta-pain');
  const chartSvgContainer = document.getElementById('chart-svg-container');
  const evolHistoryCountBadge = document.getElementById('evol-history-count-badge');
  const evolSessionsHistoryList = document.getElementById('evol-sessions-history-list');
  const btnEvolNewSession = document.getElementById('btn-evol-new-session');

  // Modal Detalle de Sesión Pasada
  const modalSessionDetail = document.getElementById('modal-session-detail');
  const btnCloseSessionDetail = document.getElementById('btn-close-session-detail');
  const btnDismissSessionDetail = document.getElementById('btn-dismiss-session-detail');
  const detailSessionCode = document.getElementById('detail-session-code');
  const detailSessionDate = document.getElementById('detail-session-date');
  const detailSessionTitle = document.getElementById('detail-session-title');
  const detailSessionPainPill = document.getElementById('detail-session-pain-pill');
  const detailSessionPainScore = document.getElementById('detail-session-pain-score');
  const detailSessionGauge = document.getElementById('detail-session-gauge');
  const detailSessionExercisesList = document.getElementById('detail-session-exercises-list');
  const detailSessionNotes = document.getElementById('detail-session-notes');
  const btnRepeatSessionExercises = document.getElementById('btn-repeat-session-exercises');
  let activeInspectedSession = null;

  // Modal Firebase
  const modalFirebase = document.getElementById('modal-firebase');
  const btnOpenFirebaseModal = document.getElementById('btn-open-firebase-modal');
  const btnCloseFirebaseModal = document.getElementById('btn-close-firebase-modal');
  const btnCancelFirebase = document.getElementById('btn-cancel-firebase');
  const btnSaveFirebase = document.getElementById('btn-save-firebase');
  const firebaseConfigInput = document.getElementById('firebase-config-input');
  const badgeDbStatus = document.getElementById('badge-db-status');
  const labelDbStatus = document.getElementById('label-db-status');

  // ==========================================
  // SISTEMA DE ENRUTAMIENTO (SPA NAVIGATION)
  // ==========================================
  function switchView(viewName, params = {}) {
    state.currentView = viewName;

    // Ocultar todas las vistas
    viewPacientes.classList.add('hidden');
    viewSesion.classList.add('hidden');
    viewEvolucion.classList.add('hidden');

    // Resetear estilos de tabs inferiores
    navTabs.forEach(tab => {
      tab.className = "nav-tab flex flex-col items-center justify-center text-on-surface-variant hover:text-primary px-4 py-1.5 transition-colors active:scale-95";
      const icon = tab.querySelector('.material-symbols-outlined');
      if (icon) icon.classList.remove('icon-fill');
    });

    // Gestionar botón de retorno en cabecera
    if (viewName === 'pacientes') {
      btnHeaderBack.classList.add('hidden');
      viewPacientes.classList.remove('hidden');
      tabNavPacientes.className = "nav-tab flex flex-col items-center justify-center text-primary bg-secondary-container/40 rounded-xl px-4 py-1.5 transition-all active:scale-95";
      tabNavPacientes.querySelector('.material-symbols-outlined').classList.add('icon-fill');
      renderPatients();
    } else if (viewName === 'sesion') {
      btnHeaderBack.classList.remove('hidden');
      viewSesion.classList.remove('hidden');
      tabNavSesion.className = "nav-tab flex flex-col items-center justify-center text-primary bg-secondary-container/40 rounded-xl px-4 py-1.5 transition-all active:scale-95";
      tabNavSesion.querySelector('.material-symbols-outlined').classList.add('icon-fill');

      if (params.patientCode) {
        state.selectedPatientCode = params.patientCode;
      }
      prepareSessionForm(state.selectedPatientCode, params.preloadedExercises);
    } else if (viewName === 'evolucion') {
      btnHeaderBack.classList.remove('hidden');
      viewEvolucion.classList.remove('hidden');
      tabNavEvolucion.className = "nav-tab flex flex-col items-center justify-center text-primary bg-secondary-container/40 rounded-xl px-4 py-1.5 transition-all active:scale-95";
      tabNavEvolucion.querySelector('.material-symbols-outlined').classList.add('icon-fill');

      if (params.patientCode) {
        state.selectedPatientCode = params.patientCode;
      }
      renderEvolutionView(state.selectedPatientCode);
    }

    // Scroll hacia arriba suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Eventos de tabs inferiores
  tabNavPacientes.addEventListener('click', () => switchView('pacientes'));
  tabNavSesion.addEventListener('click', () => switchView('sesion'));
  tabNavEvolucion.addEventListener('click', () => switchView('evolucion'));
  btnHeaderBack.addEventListener('click', () => switchView('pacientes'));

  // ==========================================
  // HELPERS DE ESCALA EVA DE DOLOR (0 al 10)
  // ==========================================
  function getPainMeta(score) {
    const val = Number(score) || 0;
    if (val <= 3) {
      return {
        val,
        category: 'mild',
        label: 'Leve',
        desc: val === 0 ? 'Sin Dolor' : 'Molestia mínima tolerable',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-800',
        badgeBorder: 'border-emerald-300',
        dot: 'bg-[#10B981]',
        fillColor: '#10B981'
      };
    } else if (val <= 6) {
      return {
        val,
        category: 'moderate',
        label: 'Moderado',
        desc: 'Dolor moderado soportable',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-800',
        badgeBorder: 'border-amber-300',
        dot: 'bg-[#F59E0B]',
        fillColor: '#F59E0B'
      };
    } else {
      return {
        val,
        category: 'severe',
        label: 'Intenso',
        desc: val >= 9 ? 'Dolor máximo incapacitante' : 'Dolor agudo significativo',
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-800',
        badgeBorder: 'border-rose-300',
        dot: 'bg-[#EF4444]',
        fillColor: '#EF4444'
      };
    }
  }

  // ========================================================
  // 1. PANTALLA: DIRECTORIO DE PACIENTES
  // ========================================================
  function renderPatients() {
    const allPatients = window.db.getPatients();
    
    statTotalPacientes.textContent = allPatients.length;
    countAll.textContent = allPatients.length;
    renderAvatarStrip(allPatients);

    // Filtrar búsqueda
    let filtered = allPatients.filter(patient => {
      const q = state.searchQuery.toLowerCase();
      if (!q) return true;
      return (
        patient.codigo.toLowerCase().includes(q) ||
        (patient.diagnostico && patient.diagnostico.toLowerCase().includes(q)) ||
        (patient.zona && patient.zona.toLowerCase().includes(q))
      );
    });

    // Filtrar VAS
    if (state.currentFilter !== 'all') {
      filtered = filtered.filter(patient => {
        const meta = getPainMeta(patient.ultimoDolor);
        return meta.category === state.currentFilter;
      });
    }

    filterCountBadge.textContent = `${filtered.length} paciente${filtered.length === 1 ? '' : 's'}`;
    patientListContainer.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
      const emptyDesc = document.getElementById('empty-state-desc');
      const emptyAction = document.getElementById('empty-state-action');
      const emptyBtnText = document.getElementById('btn-empty-register-text');

      if (state.searchQuery) {
        if (emptyAction) emptyAction.classList.remove('hidden');
        if (emptyBtnText) emptyBtnText.textContent = `+ Registrar ficha "${state.searchQuery.toUpperCase()}"`;
        if (emptyDesc) emptyDesc.textContent = `El paciente "${state.searchQuery.toUpperCase()}" aún no ha sido creado. ¿Deseas darlo de alta ahora?`;
      } else {
        if (emptyAction) emptyAction.classList.add('hidden');
        if (emptyDesc) emptyDesc.textContent = 'Prueba con otro término de búsqueda o registra una nueva ficha.';
      }
    } else {
      emptyState.classList.add('hidden');

      filtered.forEach(patient => {
        const painMeta = getPainMeta(patient.ultimoDolor);
        const card = document.createElement('article');
        card.className = "bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/40 shadow-[0_2px_12px_rgba(13,122,104,0.05)] active:scale-[0.99] transition-all duration-150 cursor-pointer hover:border-primary-container/40 group";
        
        card.innerHTML = `
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2.5">
              <div class="px-2.5 py-1 rounded-md bg-[#E8F3F1] border border-[#C5E2DC] text-[#0D7A68] font-mono-code font-bold tracking-wider text-xs">
                ${escapeHtml(patient.codigo)}
              </div>
              <span class="inline-flex items-center gap-1 text-[11px] text-secondary">
                <span class="material-symbols-outlined text-[13px]">schedule</span>
                ${escapeHtml(patient.ultimaSesionFecha || 'Reciente')}
              </span>
            </div>
            
            <div class="flex items-center gap-1.5 ${painMeta.badgeBg} border ${painMeta.badgeBorder} px-2.5 py-0.5 rounded-full">
              <span class="w-2 h-2 rounded-full ${painMeta.dot}"></span>
              <span class="font-mono-code text-[12px] font-bold ${painMeta.badgeText}">${patient.ultimoDolor}/10</span>
              <span class="text-[11px] ${painMeta.badgeText} font-semibold">${painMeta.label}</span>
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

  function renderAvatarStrip(patients) {
    statAvatarStrip.innerHTML = '';
    const slice = patients.slice(0, 3);
    slice.forEach(p => {
      const bubble = document.createElement('div');
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

  // Búsqueda en tiempo real
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim();
    btnClearSearch.classList.toggle('hidden', !state.searchQuery);
    renderPatients();
  });

  btnClearSearch.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    btnClearSearch.classList.add('hidden');
    renderPatients();
    searchInput.focus();
  });

  document.getElementById('btn-quick-search-toggle').addEventListener('click', () => {
    switchView('pacientes');
    searchInput.focus();
    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Filtros VAS
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentFilter = btn.dataset.filter;
      filterButtons.forEach(b => {
        b.className = "btn-filter flex-shrink-0 px-3.5 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/40 text-on-surface hover:bg-surface-container-low text-xs font-medium active:scale-95 transition-all flex items-center gap-1.5";
      });
      btn.className = "btn-filter flex-shrink-0 px-3.5 py-1.5 rounded-full bg-primary-container text-white text-xs font-semibold active:scale-95 transition-all flex items-center gap-1.5 shadow-sm";
      renderPatients();
    });
  });

  // Modal Alta de Paciente
  function openRegisterModal(prefilledCode = null) {
    modalErrorMessage.classList.add('hidden');
    formNewPatient.reset();
    inputInitialPain.value = 5;
    updatePainSliderBadge(5);
    inputPatientCode.value = prefilledCode || window.db.generateUniqueCode();
    modalNewPatient.classList.remove('hidden');
    modalNewPatient.classList.add('flex');
    inputPatientCondition.focus();
  }

  btnOpenRegisterModal.addEventListener('click', () => openRegisterModal());

  const btnEmptyRegister = document.getElementById('btn-empty-register-code');
  if (btnEmptyRegister) {
    btnEmptyRegister.addEventListener('click', () => {
      openRegisterModal(state.searchQuery.trim().toUpperCase());
    });
  }

  function closeRegisterModal() {
    modalNewPatient.classList.add('hidden');
    modalNewPatient.classList.remove('flex');
  }

  btnCloseModal.addEventListener('click', closeRegisterModal);
  btnCancelModal.addEventListener('click', closeRegisterModal);
  modalNewPatient.addEventListener('click', (e) => {
    if (e.target === modalNewPatient) closeRegisterModal();
  });

  function updatePainSliderBadge(val) {
    const meta = getPainMeta(val);
    initialPainBadge.textContent = `${val}/10`;
    initialPainBadge.className = `font-mono-code text-xs font-bold px-2 py-0.5 rounded-full ${meta.badgeBg} ${meta.badgeText} border ${meta.badgeBorder} min-w-[50px] text-center`;
  }

  inputInitialPain.addEventListener('input', (e) => updatePainSliderBadge(e.target.value));

  btnRegenerateCode.addEventListener('click', () => {
    inputPatientCode.value = window.db.generateUniqueCode();
    inputPatientCode.focus();
  });

  formNewPatient.addEventListener('submit', (e) => {
    e.preventDefault();
    modalErrorMessage.classList.add('hidden');

    const codigo = inputPatientCode.value.trim().toUpperCase();
    const diagnostico = inputPatientCondition.value.trim();
    const zona = inputPatientZone.value.trim() || 'Zona general';
    const ultimoDolor = parseInt(inputInitialPain.value, 10);

    if (!codigo || !diagnostico) {
      modalErrorText.textContent = 'Código y Diagnóstico son obligatorios.';
      modalErrorMessage.classList.remove('hidden');
      return;
    }

    try {
      const nuevo = window.db.addPatient({ codigo, diagnostico, zona, ultimoDolor });
      closeRegisterModal();
      showToast(`¡Ficha ${nuevo.codigo} creada con éxito!`, 'success');
      state.selectedPatientCode = nuevo.codigo;
      renderPatients();
    } catch (err) {
      modalErrorText.textContent = err.message;
      modalErrorMessage.classList.remove('hidden');
    }
  });

  // Modal Acciones Rápidas de Paciente
  function openPatientActionModal(patient) {
    state.selectedPatientCode = patient.codigo;
    actionPatientCode.textContent = patient.codigo;
    actionPatientCondition.textContent = patient.diagnostico;
    actionPatientZone.textContent = `${patient.zona} • ${patient.totalSesiones || 0} sesiones`;
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

  btnActionNewSession.addEventListener('click', () => {
    closePatientActionModal();
    switchView('sesion', { patientCode: state.selectedPatientCode });
  });

  btnActionViewEvolution.addEventListener('click', () => {
    closePatientActionModal();
    switchView('evolucion', { patientCode: state.selectedPatientCode });
  });

  btnActionDelete.addEventListener('click', () => {
    if (confirm(`¿Deseas eliminar la ficha anónima ${state.selectedPatientCode}?`)) {
      const code = state.selectedPatientCode;
      window.db.deletePatient(code);
      closePatientActionModal();
      showToast(`Ficha ${code} eliminada.`, 'info');
      renderPatients();
    }
  });


  // ========================================================
  // 2. PANTALLA: REGISTRAR NUEVA SESIÓN (Función 2)
  // ========================================================
  function prepareSessionForm(patientCode, preloadedExercises = null) {
    const allPatients = window.db.getPatients();
    if (allPatients.length === 0) {
      showToast('No hay pacientes registrados. Registra uno primero.', 'error');
      switchView('pacientes');
      return;
    }

    // Poblar selector de pacientes
    sessionPatientSelect.innerHTML = '';
    allPatients.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.codigo;
      opt.textContent = `${p.codigo} - ${p.diagnostico}`;
      if (p.codigo === patientCode) opt.selected = true;
      sessionPatientSelect.appendChild(opt);
    });

    const activePatient = window.db.getPatient(sessionPatientSelect.value) || allPatients[0];
    state.newSession.patientCode = activePatient.codigo;
    state.selectedPatientCode = activePatient.codigo;

    // Fecha actual
    sessionInputDate.value = new Date().toISOString().split('T')[0];
    state.newSession.date = sessionInputDate.value;

    // Número de sesión y dolor previo
    const patientSessions = window.db.getSessionsByPatient(activePatient.codigo);
    const nextSessionNum = patientSessions.length + 1;
    sessionCounterBadge.textContent = `Sesión #${nextSessionNum}`;
    sessionPatientDiagnosis.textContent = `${activePatient.diagnostico} (${activePatient.zona})`;
    sessionPatientPrevPain.textContent = `Previo: ${activePatient.ultimoDolor}/10`;

    // Valor EVA inicial: por defecto igual al último dolor o 4
    state.newSession.painScore = typeof activePatient.ultimoDolor === 'number' ? activePatient.ultimoDolor : 4;
    renderEvaRail(state.newSession.painScore, activePatient.ultimoDolor);

    // Ejercicios: Si vienen precargados o si hay una sesión previa, usarlos como punto de partida
    if (preloadedExercises && preloadedExercises.length > 0) {
      state.newSession.exercises = JSON.parse(JSON.stringify(preloadedExercises));
    } else if (patientSessions.length > 0) {
      const lastSession = patientSessions[patientSessions.length - 1];
      state.newSession.exercises = JSON.parse(JSON.stringify(lastSession.ejercicios));
    } else {
      // Si es la primera sesión, cargar 2 presets recomendados
      state.newSession.exercises = [
        { nombre: 'Isometría de cuádriceps en pared', series: 3, repeticiones: '30 seg', notas: 'Cadena cinética cerrada' },
        { nombre: 'Puente de glúteos bilateral', series: 3, repeticiones: '12 reps', notas: 'Activación de cadena posterior' }
      ];
    }

    renderSessionExercises();
    renderExercisePresets();
    sessionInputNotes.value = '';
  }

  // Al cambiar paciente en el selector de la sesión
  sessionPatientSelect.addEventListener('change', () => {
    prepareSessionForm(sessionPatientSelect.value);
  });

  sessionInputDate.addEventListener('change', (e) => {
    state.newSession.date = e.target.value;
  });

  // Renderizar los 11 botones EVA (0 a 10)
  function renderEvaRail(selectedScore, prevScore) {
    sessionEvaRail.innerHTML = '';
    sessionEvaScoreBadge.textContent = `${selectedScore} / 10`;

    const meta = getPainMeta(selectedScore);
    sessionEvaStatusText.textContent = `${selectedScore} - ${meta.label}: ${meta.desc}`;
    sessionEvaStatusCircle.textContent = selectedScore;

    // Colorear tarjeta de estado según severidad
    if (meta.category === 'mild') {
      sessionEvaStatusCard.className = "bg-emerald-50 rounded-xl p-3 border border-emerald-200 flex items-center justify-between";
      sessionEvaStatusText.className = "text-sm font-bold text-emerald-800";
      sessionEvaStatusCircle.className = "h-10 w-10 rounded-full bg-emerald-500 text-white font-mono-code text-lg font-bold flex items-center justify-center shadow-sm";
    } else if (meta.category === 'moderate') {
      sessionEvaStatusCard.className = "bg-amber-50 rounded-xl p-3 border border-amber-200 flex items-center justify-between";
      sessionEvaStatusText.className = "text-sm font-bold text-amber-800";
      sessionEvaStatusCircle.className = "h-10 w-10 rounded-full bg-amber-500 text-white font-mono-code text-lg font-bold flex items-center justify-center shadow-sm";
    } else {
      sessionEvaStatusCard.className = "bg-rose-50 rounded-xl p-3 border border-rose-200 flex items-center justify-between";
      sessionEvaStatusText.className = "text-sm font-bold text-rose-800";
      sessionEvaStatusCircle.className = "h-10 w-10 rounded-full bg-rose-500 text-white font-mono-code text-lg font-bold flex items-center justify-center shadow-sm";
    }

    // Calcular delta respecto a la sesión anterior
    if (typeof prevScore === 'number') {
      const diff = selectedScore - prevScore;
      if (diff < 0) {
        sessionDeltaIcon.textContent = 'trending_down';
        sessionDeltaIcon.className = "material-symbols-outlined text-emerald-600 text-[18px]";
        sessionDeltaText.textContent = `Anterior: ${prevScore}/10 (Disminución de ${Math.abs(diff)} punto${Math.abs(diff) === 1 ? '' : 's'})`;
        sessionDeltaPill.className = "font-bold text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800";
        sessionDeltaPill.textContent = 'Evolución Favorable';
      } else if (diff > 0) {
        sessionDeltaIcon.textContent = 'trending_up';
        sessionDeltaIcon.className = "material-symbols-outlined text-rose-600 text-[18px]";
        sessionDeltaText.textContent = `Anterior: ${prevScore}/10 (Aumento de ${diff} punto${diff === 1 ? '' : 's'})`;
        sessionDeltaPill.className = "font-bold text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800";
        sessionDeltaPill.textContent = 'Precaución';
      } else {
        sessionDeltaIcon.textContent = 'trending_flat';
        sessionDeltaIcon.className = "material-symbols-outlined text-secondary text-[18px]";
        sessionDeltaText.textContent = `Anterior: ${prevScore}/10 (Sin variación de dolor)`;
        sessionDeltaPill.className = "font-bold text-[11px] px-2 py-0.5 rounded-full bg-secondary-container text-secondary";
        sessionDeltaPill.textContent = 'Estable';
      }
      sessionDeltaBanner.classList.remove('hidden');
    } else {
      sessionDeltaBanner.classList.add('hidden');
    }

    // Crear 11 botones
    for (let i = 0; i <= 10; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isSelected = i === selectedScore;
      const btnMeta = getPainMeta(i);

      let colorClasses = '';
      if (isSelected) {
        if (btnMeta.category === 'mild') colorClasses = 'border-2 border-emerald-500 bg-emerald-500 text-white shadow-md scale-105';
        else if (btnMeta.category === 'moderate') colorClasses = 'border-2 border-amber-500 bg-amber-500 text-white shadow-md scale-105';
        else colorClasses = 'border-2 border-rose-500 bg-rose-500 text-white shadow-md scale-105';
      } else {
        if (btnMeta.category === 'mild') colorClasses = 'border-2 border-emerald-500/30 bg-surface-container-lowest text-emerald-800 hover:bg-emerald-50';
        else if (btnMeta.category === 'moderate') colorClasses = 'border-2 border-amber-500/30 bg-surface-container-lowest text-amber-800 hover:bg-amber-50';
        else colorClasses = 'border-2 border-rose-500/30 bg-surface-container-lowest text-rose-800 hover:bg-rose-50';
      }

      btn.className = `flex-1 min-w-[28px] h-11 rounded-lg font-mono-code font-bold text-xs flex items-center justify-center transition-all active:scale-95 ${colorClasses}`;
      btn.textContent = i;
      btn.addEventListener('click', () => {
        state.newSession.painScore = i;
        renderEvaRail(i, prevScore);
      });
      sessionEvaRail.appendChild(btn);
    }
  }

  // Renderizar lista de ejercicios configurados
  function renderSessionExercises() {
    sessionExercisesList.innerHTML = '';
    const exercises = state.newSession.exercises;
    sessionExerciseCountLabel.textContent = `${exercises.length} ejercicio${exercises.length === 1 ? '' : 's'}`;

    if (exercises.length === 0) {
      sessionExercisesList.innerHTML = `
        <div class="text-center py-6 px-3 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40 text-xs text-on-surface-variant">
          No hay ejercicios agregados a esta sesión. Selecciona una sugerencia abajo o escribe el nombre del ejercicio.
        </div>
      `;
      return;
    }

    exercises.forEach((ex, idx) => {
      const card = document.createElement('article');
      card.className = "bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/40 shadow-sm space-y-2.5";
      card.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-md bg-secondary-container text-primary font-mono-code text-xs font-bold flex items-center justify-center">
              ${idx + 1}
            </span>
            <input 
              type="text" 
              value="${escapeHtml(ex.nombre)}" 
              data-idx="${idx}" 
              class="ex-name-input font-bold text-xs text-on-surface bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary-container outline-none"
            />
          </div>
          <button type="button" data-idx="${idx}" class="btn-remove-exercise text-outline hover:text-error p-1 rounded-md" title="Eliminar ejercicio">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>

        <!-- Controles de Series y Repeticiones (Steppers) -->
        <div class="grid grid-cols-2 gap-2 pt-1">
          <!-- Stepper Series -->
          <div class="bg-surface-container-low p-2 rounded-lg border border-outline-variant/30 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-outline block">Series</span>
              <span class="font-mono-code text-xs font-bold text-on-surface">${ex.series} series</span>
            </div>
            <div class="flex items-center gap-1">
              <button type="button" data-idx="${idx}" data-action="dec-series" class="btn-step w-7 h-7 rounded-md bg-surface-container-lowest border border-outline-variant/40 text-primary font-bold text-sm flex items-center justify-center active:scale-90 hover:bg-surface-container">
                -
              </button>
              <button type="button" data-idx="${idx}" data-action="inc-series" class="btn-step w-7 h-7 rounded-md bg-surface-container-lowest border border-outline-variant/40 text-primary font-bold text-sm flex items-center justify-center active:scale-90 hover:bg-surface-container">
                +
              </button>
            </div>
          </div>

          <!-- Stepper Repeticiones / Tiempo -->
          <div class="bg-surface-container-low p-2 rounded-lg border border-outline-variant/30 flex items-center justify-between">
            <div class="flex-1 mr-1">
              <span class="text-[10px] text-outline block">Dosificación / Reps</span>
              <input 
                type="text" 
                value="${escapeHtml(ex.repeticiones)}" 
                data-idx="${idx}" 
                class="ex-reps-input font-mono-code text-xs font-bold text-on-surface bg-transparent border-0 p-0 focus:ring-0 outline-none w-full"
              />
            </div>
            <div class="flex items-center gap-1">
              <button type="button" data-idx="${idx}" data-action="dec-reps" class="btn-step w-7 h-7 rounded-md bg-surface-container-lowest border border-outline-variant/40 text-primary font-bold text-sm flex items-center justify-center active:scale-90 hover:bg-surface-container">
                -
              </button>
              <button type="button" data-idx="${idx}" data-action="inc-reps" class="btn-step w-7 h-7 rounded-md bg-surface-container-lowest border border-outline-variant/40 text-primary font-bold text-sm flex items-center justify-center active:scale-90 hover:bg-surface-container">
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Notas / Criterio técnico del ejercicio -->
        <div>
          <input 
            type="text" 
            placeholder="Criterio técnico (ej. Sin dolor agudo, ritmo 3-1-1)..." 
            value="${escapeHtml(ex.notas || '')}" 
            data-idx="${idx}" 
            class="ex-notes-input w-full bg-surface-bright/70 border border-outline-variant/40 rounded-md px-2.5 py-1 text-[11px] text-on-surface-variant focus:border-primary-container outline-none"
          />
        </div>
      `;

      sessionExercisesList.appendChild(card);
    });

    // Delegación de eventos para steppers y borrado
    attachExerciseListeners();
  }

  function attachExerciseListeners() {
    // Steppers (+ / -)
    sessionExercisesList.querySelectorAll('.btn-step').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const action = btn.dataset.action;
        const ex = state.newSession.exercises[idx];
        if (!ex) return;

        if (action === 'inc-series') {
          ex.series = (ex.series || 1) + 1;
        } else if (action === 'dec-series') {
          ex.series = Math.max(1, (ex.series || 1) - 1);
        } else if (action === 'inc-reps') {
          // Intentar parsear número en repeticiones
          const num = parseInt(ex.repeticiones, 10);
          if (!isNaN(num)) {
            const unit = ex.repeticiones.replace(/[0-9]/g, '').trim() || 'reps';
            ex.repeticiones = `${num + 1} ${unit}`;
          } else {
            ex.repeticiones = '12 reps';
          }
        } else if (action === 'dec-reps') {
          const num = parseInt(ex.repeticiones, 10);
          if (!isNaN(num)) {
            const unit = ex.repeticiones.replace(/[0-9]/g, '').trim() || 'reps';
            ex.repeticiones = `${Math.max(1, num - 1)} ${unit}`;
          } else {
            ex.repeticiones = '8 reps';
          }
        }

        renderSessionExercises();
      });
    });

    // Inputs de texto de nombre, repeticiones y notas
    sessionExercisesList.querySelectorAll('.ex-name-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        if (state.newSession.exercises[idx]) state.newSession.exercises[idx].nombre = e.target.value.trim();
      });
    });

    sessionExercisesList.querySelectorAll('.ex-reps-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        if (state.newSession.exercises[idx]) state.newSession.exercises[idx].repeticiones = e.target.value.trim();
      });
    });

    sessionExercisesList.querySelectorAll('.ex-notes-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        if (state.newSession.exercises[idx]) state.newSession.exercises[idx].notas = e.target.value.trim();
      });
    });

    // Eliminar ejercicio
    sessionExercisesList.querySelectorAll('.btn-remove-exercise').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        state.newSession.exercises.splice(idx, 1);
        renderSessionExercises();
      });
    });
  }

  // Renderizar chips de presets
  function renderExercisePresets() {
    exercisePresetsContainer.innerHTML = '';
    EXERCISE_PRESETS.forEach(preset => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = "text-[11px] font-medium bg-surface-container-low hover:bg-secondary-container/60 text-primary border border-outline-variant/30 rounded-full px-2.5 py-1 active:scale-95 transition-all";
      chip.textContent = `+ ${preset.nombre}`;
      chip.addEventListener('click', () => {
        state.newSession.exercises.push({
          nombre: preset.nombre,
          series: preset.series,
          repeticiones: preset.repeticiones,
          notas: preset.notas
        });
        renderSessionExercises();
      });
      exercisePresetsContainer.appendChild(chip);
    });
  }

  // Añadir ejercicio manual
  btnAddExercise.addEventListener('click', () => {
    const name = inputNewExerciseName.value.trim();
    if (!name) {
      showToast('Escribe el nombre del ejercicio', 'error');
      inputNewExerciseName.focus();
      return;
    }

    state.newSession.exercises.push({
      nombre: name,
      series: 3,
      repeticiones: '10 reps',
      notas: 'Ejecución técnica controlada'
    });

    inputNewExerciseName.value = '';
    renderSessionExercises();
  });

  inputNewExerciseName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      btnAddExercise.click();
    }
  });

  // Guardar Sesión
  btnSaveSession.addEventListener('click', () => {
    if (state.newSession.exercises.length === 0) {
      showToast('Por favor añade al menos un ejercicio a la sesión', 'error');
      return;
    }

    const patientCode = sessionPatientSelect.value;
    const sessionPayload = {
      codigoPaciente: patientCode,
      fecha: sessionInputDate.value || new Date().toISOString().split('T')[0],
      nivelDolor: state.newSession.painScore,
      ejercicios: state.newSession.exercises,
      notas: sessionInputNotes.value.trim()
    };

    try {
      window.db.addSession(sessionPayload);
      showToast(`¡Sesión guardada para ${patientCode} exitosamente!`, 'success');
      // Redirigir directamente a la pantalla de Evolución del paciente
      switchView('evolucion', { patientCode });
    } catch (err) {
      showToast(err.message || 'Error al guardar la sesión', 'error');
    }
  });


  // ========================================================
  // 3. PANTALLA: EVOLUCIÓN HISTÓRICA Y GRÁFICA (Función 3)
  // ========================================================
  function renderEvolutionView(patientCode) {
    const allPatients = window.db.getPatients();
    if (allPatients.length === 0) {
      showToast('No hay pacientes para consultar evolución', 'info');
      switchView('pacientes');
      return;
    }

    // Poblar selector de cambio de paciente
    evolPatientSelect.innerHTML = '';
    allPatients.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.codigo;
      opt.textContent = `${p.codigo} - ${p.diagnostico}`;
      if (p.codigo === patientCode) opt.selected = true;
      evolPatientSelect.appendChild(opt);
    });

    const patient = window.db.getPatient(evolPatientSelect.value) || allPatients[0];
    state.selectedPatientCode = patient.codigo;

    // Encabezado de la ficha
    evolPatientCode.textContent = `#${patient.codigo}`;
    evolPatientDiagnosis.textContent = patient.diagnostico;
    evolPatientZone.innerHTML = `
      <span class="material-symbols-outlined text-[15px] text-primary">accessibility_new</span>
      ${escapeHtml(patient.zona)}
    `;

    // Estadísticas
    const stats = window.db.getPatientEvolutionStats(patient.codigo);
    evolPatientStartDate.textContent = patient.fechaInicio || 'Reciente';
    evolPatientSessionsCount.textContent = `${stats.total} realizada${stats.total === 1 ? '' : 's'}`;

    if (stats.total > 0) {
      evolMetricInitialPain.textContent = `${stats.dolorInicial}/10`;
      evolMetricCurrentPain.textContent = `${stats.dolorActual}/10`;
      
      const metaActual = getPainMeta(stats.dolorActual);
      evolMetricCurrentPain.className = `font-mono-code text-base font-bold ${metaActual.badgeText}`;

      if (stats.diferencia < 0) {
        evolMetricDeltaPain.textContent = `${stats.porcentajeMejora}% mejora`;
        evolMetricDeltaPain.className = "font-mono-code text-base font-bold text-emerald-600";
      } else if (stats.diferencia > 0) {
        evolMetricDeltaPain.textContent = `+${stats.diferencia} dolor`;
        evolMetricDeltaPain.className = "font-mono-code text-base font-bold text-rose-600";
      } else {
        evolMetricDeltaPain.textContent = `Estable`;
        evolMetricDeltaPain.className = "font-mono-code text-base font-bold text-secondary";
      }
    } else {
      evolMetricInitialPain.textContent = `--`;
      evolMetricCurrentPain.textContent = `--`;
      evolMetricDeltaPain.textContent = `--`;
    }

    // Dibujar la Gráfica de Evolución
    const sessions = window.db.getSessionsByPatient(patient.codigo);
    renderPainChart(sessions);

    // Listado de Historial Cronológico
    renderSessionsHistory(sessions);
  }

  evolPatientSelect.addEventListener('change', () => {
    renderEvolutionView(evolPatientSelect.value);
  });

  btnEvolNewSession.addEventListener('click', () => {
    switchView('sesion', { patientCode: state.selectedPatientCode });
  });

  // Generador de Gráfica SVG de Dolor Fisioterapéutico
  function renderPainChart(sessions) {
    chartSvgContainer.innerHTML = '';

    if (sessions.length === 0) {
      chartSvgContainer.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-outline text-xs">
          <span class="material-symbols-outlined text-3xl mb-1">show_chart</span>
          Aún no hay sesiones registradas para generar la curva de dolor.
        </div>
      `;
      return;
    }

    const width = 360;
    const height = 180;
    const paddingX = 35;
    const paddingY = 25;

    // Calcular coordenadas de cada sesión
    // Eje Y va de 10 (arriba) a 0 (abajo)
    const yMax = 10;
    const yMin = 0;

    const points = sessions.map((s, idx) => {
      const x = sessions.length === 1 
        ? width / 2 
        : paddingX + (idx / (sessions.length - 1)) * (width - paddingX * 2);
      const y = paddingY + ((yMax - s.nivelDolor) / (yMax - yMin)) * (height - paddingY * 2);
      return { x, y, score: s.nivelDolor, date: s.fecha, sessionNum: idx + 1 };
    });

    // Construir línea SVG y área sombreada
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Curva suave cúbica
      const prev = points[i - 1];
      const curr = points[i];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      pathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    let svgHtml = `
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0D7A68" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#0D7A68" stop-opacity="0.02"/>
          </linearGradient>
        </defs>

        <!-- Líneas guía horizontales (EVA 10, 5, 0) -->
        <line x1="${paddingX}" y1="${paddingY}" x2="${width - paddingX}" y2="${paddingY}" stroke="#BDC9C4" stroke-dasharray="3,3" stroke-width="0.8"/>
        <text x="10" y="${paddingY + 3}" fill="#6E7A75" font-size="9" font-family="JetBrains Mono">10</text>

        <line x1="${paddingX}" y1="${height / 2}" x2="${width - paddingX}" y2="${height / 2}" stroke="#BDC9C4" stroke-dasharray="3,3" stroke-width="0.8"/>
        <text x="10" y="${height / 2 + 3}" fill="#6E7A75" font-size="9" font-family="JetBrains Mono">5</text>

        <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="#BDC9C4" stroke-width="1"/>
        <text x="10" y="${height - paddingY + 3}" fill="#6E7A75" font-size="9" font-family="JetBrains Mono">0</text>

        <!-- Área rellena bajo la curva -->
        <path d="${areaD}" fill="url(#painGradient)"/>

        <!-- Línea principal de la curva -->
        <path d="${pathD}" fill="none" stroke="#0D7A68" stroke-width="3" stroke-linecap="round"/>

        <!-- Puntos interactivos con puntuación -->
    `;

    points.forEach((pt) => {
      const meta = getPainMeta(pt.score);
      svgHtml += `
        <g class="cursor-pointer group">
          <circle cx="${pt.x}" cy="${pt.y}" r="6" fill="${meta.fillColor}" stroke="#ffffff" stroke-width="2.5" class="transition-transform group-hover:scale-125"/>
          <!-- Etiqueta de puntuación sobre el punto -->
          <text x="${pt.x}" y="${pt.y - 10}" text-anchor="middle" font-family="JetBrains Mono" font-size="11" font-weight="bold" fill="#005F50">
            ${pt.score}
          </text>
          <!-- Etiqueta de sesión en el eje inferior -->
          <text x="${pt.x}" y="${height - 8}" text-anchor="middle" font-family="Manrope" font-size="9" font-weight="600" fill="#6E7A75">
            S${pt.sessionNum}
          </text>
        </g>
      `;
    });

    svgHtml += `</svg>`;
    chartSvgContainer.innerHTML = svgHtml;
  }

  // Renderizar listado de historial cronológico
  function renderSessionsHistory(sessions) {
    evolSessionsHistoryList.innerHTML = '';
    evolHistoryCountBadge.textContent = `${sessions.length} sesión${sessions.length === 1 ? '' : 'es'}`;

    if (sessions.length === 0) {
      evolSessionsHistoryList.innerHTML = `
        <div class="text-center py-6 px-3 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40 text-xs text-on-surface-variant">
          No hay sesiones previas registradas para este paciente.
        </div>
      `;
      return;
    }

    // Ordenar de más reciente a más antigua para lectura clínica rápida
    const reversed = [...sessions].reverse();

    reversed.forEach((ses, revIdx) => {
      const origIdx = sessions.length - revIdx;
      const meta = getPainMeta(ses.nivelDolor);
      
      const item = document.createElement('article');
      item.className = "bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/30 shadow-[0_2px_8px_rgba(13,122,104,0.03)] hover:border-primary-container/40 transition-all cursor-pointer space-y-2 group";
      
      item.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-md bg-secondary-container text-primary font-mono-code text-xs font-bold flex items-center justify-center">
              #${origIdx}
            </span>
            <span class="text-xs font-bold text-on-surface">${ses.fecha}</span>
            <span class="text-[11px] text-outline font-mono-code">${ses.hora || ''}</span>
          </div>

          <div class="flex items-center gap-1.5 ${meta.badgeBg} border ${meta.badgeBorder} px-2.5 py-0.5 rounded-full">
            <span class="w-2 h-2 rounded-full ${meta.dot}"></span>
            <span class="font-mono-code text-xs font-bold ${meta.badgeText}">${ses.nivelDolor}/10</span>
            <span class="text-[10px] ${meta.badgeText} font-semibold">${meta.label}</span>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs pt-1 border-t border-outline-variant/20">
          <div class="flex items-center gap-1.5 text-on-surface-variant">
            <span class="material-symbols-outlined text-primary text-[16px]">fitness_center</span>
            <span>${ses.ejercicios ? ses.ejercicios.length : 0} ejercicios completados</span>
          </div>
          <span class="text-xs font-bold text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            Ver detalle <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          </span>
        </div>
      `;

      item.addEventListener('click', () => openSessionDetailModal(ses, origIdx));
      evolSessionsHistoryList.appendChild(item);
    });
  }


  // ========================================================
  // 4. MODAL: CONSULTA DE SESIÓN PASADA (Screen 4)
  // ========================================================
  function openSessionDetailModal(session, sessionIndex = 1) {
    activeInspectedSession = session;
    const meta = getPainMeta(session.nivelDolor);

    detailSessionCode.textContent = session.codigoPaciente;
    detailSessionDate.textContent = session.fecha;
    detailSessionTitle.textContent = `Sesión #${sessionIndex} de Rehabilitación`;

    detailSessionPainPill.textContent = `${session.nivelDolor}/10 ${meta.label}`;
    detailSessionPainPill.className = `text-xs font-bold px-2.5 py-0.5 rounded-full ${meta.badgeBg} ${meta.badgeText} border ${meta.badgeBorder}`;
    detailSessionPainScore.textContent = session.nivelDolor;

    // Barra de 11 escalones EVA
    detailSessionGauge.innerHTML = '';
    for (let i = 0; i <= 10; i++) {
      const step = document.createElement('div');
      if (i <= session.nivelDolor) {
        step.className = `h-2 rounded-sm ${meta.dot}`;
        if (i === session.nivelDolor) step.classList.add('ring-2', 'ring-primary', 'ring-offset-1');
      } else {
        step.className = "h-2 rounded-sm bg-surface-container-high";
      }
      detailSessionGauge.appendChild(step);
    }

    // Lista de ejercicios
    detailSessionExercisesList.innerHTML = '';
    if (session.ejercicios && session.ejercicios.length > 0) {
      session.ejercicios.forEach((ex, idx) => {
        const row = document.createElement('div');
        row.className = "bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/30 space-y-1.5";
        row.innerHTML = `
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded bg-secondary-container text-primary font-mono-code text-[11px] font-bold flex items-center justify-center">
                ${idx + 1}
              </span>
              <span class="text-xs font-bold text-on-surface">${escapeHtml(ex.nombre)}</span>
            </div>
            <span class="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
          </div>

          <div class="flex flex-wrap items-center gap-1.5 text-[11px] font-mono-code pt-0.5">
            <span class="bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/30 text-on-surface">
              ${ex.series} series
            </span>
            <span class="bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/30 text-on-surface">
              ${escapeHtml(ex.repeticiones)}
            </span>
          </div>

          ${ex.notas ? `
            <p class="text-[11px] text-on-surface-variant bg-surface-bright/80 p-1.5 rounded border-l-2 border-primary-container mt-1">
              <strong class="text-primary text-[10px] uppercase block">Criterio:</strong>
              ${escapeHtml(ex.notas)}
            </p>
          ` : ''}
        `;
        detailSessionExercisesList.appendChild(row);
      });
    } else {
      detailSessionExercisesList.innerHTML = '<p class="text-xs text-outline">Sin ejercicios detallados.</p>';
    }

    // Notas clínicas
    detailSessionNotes.textContent = session.notas || 'Sin observaciones registradas por el terapeuta.';

    modalSessionDetail.classList.remove('hidden');
    modalSessionDetail.classList.add('flex');
  }

  function closeSessionDetailModal() {
    modalSessionDetail.classList.add('hidden');
    modalSessionDetail.classList.remove('flex');
  }

  btnCloseSessionDetail.addEventListener('click', closeSessionDetailModal);
  btnDismissSessionDetail.addEventListener('click', closeSessionDetailModal);
  modalSessionDetail.addEventListener('click', (e) => {
    if (e.target === modalSessionDetail) closeSessionDetailModal();
  });

  // Repetir ejercicios en una nueva sesión
  btnRepeatSessionExercises.addEventListener('click', () => {
    if (!activeInspectedSession) return;
    const patientCode = activeInspectedSession.codigoPaciente;
    const exercisesToRepeat = activeInspectedSession.ejercicios;
    closeSessionDetailModal();
    switchView('sesion', { patientCode, preloadedExercises: exercisesToRepeat });
    showToast(`Ejercicios de la sesión anterior cargados para ${patientCode}`, 'info');
  });


  // ========================================================
  // 5. MODAL DE CONFIGURACIÓN FIREBASE (FASE FINAL)
  // ========================================================
  btnOpenFirebaseModal.addEventListener('click', () => {
    const existing = window.db.getFirebaseConfig();
    if (existing) {
      firebaseConfigInput.value = JSON.stringify(existing, null, 2);
    }
    modalFirebase.classList.remove('hidden');
    modalFirebase.classList.add('flex');
  });

  function closeFirebaseModal() {
    modalFirebase.classList.add('hidden');
    modalFirebase.classList.remove('flex');
  }

  btnCloseFirebaseModal.addEventListener('click', closeFirebaseModal);
  btnCancelFirebase.addEventListener('click', closeFirebaseModal);
  modalFirebase.addEventListener('click', (e) => {
    if (e.target === modalFirebase) closeFirebaseModal();
  });

  btnSaveFirebase.addEventListener('click', () => {
    const raw = firebaseConfigInput.value.trim();
    if (!raw) {
      showToast('Por favor introduce la configuración JSON de Firebase', 'error');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      window.db.saveFirebaseConfig(parsed);
      labelDbStatus.textContent = 'Conectado a Firebase';
      closeFirebaseModal();
      showToast('¡Configuración de Firebase guardada exitosamente!', 'success');
    } catch (e) {
      showToast('El formato ingresado no es un JSON válido', 'error');
    }
  });


  // ========================================================
  // UTILIDADES GLOBALES (TOAST & ESCAPE HTML)
  // ========================================================
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
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Reactividad ante cambios de datos
  window.addEventListener('fisioconecta:data-change', () => {
    if (state.currentView === 'pacientes') renderPatients();
    else if (state.currentView === 'evolucion') renderEvolutionView(state.selectedPatientCode);
  });

  // Inicialización de la vista
  switchView('pacientes');
});
