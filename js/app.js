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
    currentView: 'pacientes', // 'pacientes' | 'citas' | 'sesion' | 'plan' | 'evolucion'
    selectedPatientCode: 'PAC-842', // Paciente activo por defecto
    currentFilter: 'all',          // 'all' | 'mild' | 'moderate' | 'severe'
    searchQuery: '',
    currentAptFilter: 'todas',     // 'todas' | 'programada' | 'completada'
    
    // Estado del formulario de nueva sesión
    newSession: {
      patientCode: 'PAC-842',
      date: new Date().toISOString().split('T')[0],
      painScore: 4,
      painType: 'Sordo / Mecánico (Sobrecarga)',
      painTiming: 'Durante la carga / ejercicio',
      loadTolerance: 'adecuada',
      redFlags: 'ninguna',
      clinicalReasoning: '',
      exercises: [],
      notes: ''
    }
  };

  // Presets comunes de ejercicios fisioterapéuticos
  const EXERCISE_PRESETS = [
    { nombre: 'Isometría en pared', series: 3, repeticiones: '35 seg', carga: 'Autocarga', descanso: '60 seg', notas: 'Cadena cinética cerrada' },
    { nombre: 'Puente de glúteos', series: 3, repeticiones: '12 reps', carga: 'Autocarga', descanso: '45 seg', notas: 'Activación posterior' },
    { nombre: 'Sentadilla con apoyo', series: 3, repeticiones: '10 reps', carga: 'Mancuerna 4 kg', descanso: '60 seg', notas: 'Rango libre de dolor' },
    { nombre: 'Elevación de talones', series: 3, repeticiones: '15 reps', carga: 'Banda elástica media', descanso: '45 seg', notas: 'Fase excéntrica lenta' },
    { nombre: 'Plancha corta de core', series: 3, repeticiones: '20 seg', carga: 'Autocarga', descanso: '30 seg', notas: 'Control lumbo-pélvico' },
    { nombre: 'Movilidad activa guiada', series: 2, repeticiones: '10 reps', carga: 'Sin carga', descanso: '30 seg', notas: 'Sin rebotes' }
  ];

  // ==========================================
  // ELEMENTOS DEL DOM
  // ==========================================
  // Vistas
  const viewPacientes = document.getElementById('view-pacientes');
  const viewCitas = document.getElementById('view-citas');
  const viewSesion = document.getElementById('view-sesion');
  const viewPlan = document.getElementById('view-plan');
  const viewEvolucion = document.getElementById('view-evolucion');

  // Cabecera y Navegación
  const btnHeaderBack = document.getElementById('btn-header-back');
  const tabNavPacientes = document.getElementById('tab-nav-pacientes');
  const tabNavCitas = document.getElementById('tab-nav-citas');
  const tabNavSesion = document.getElementById('tab-nav-sesion');
  const tabNavPlan = document.getElementById('tab-nav-plan');
  const tabNavEvolucion = document.getElementById('tab-nav-evolucion');
  const navTabs = [tabNavPacientes, tabNavCitas, tabNavSesion, tabNavPlan, tabNavEvolucion];

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

    // Ocultar todas las 5 vistas
    if (viewPacientes) viewPacientes.classList.add('hidden');
    if (viewCitas) viewCitas.classList.add('hidden');
    if (viewSesion) viewSesion.classList.add('hidden');
    if (viewPlan) viewPlan.classList.add('hidden');
    if (viewEvolucion) viewEvolucion.classList.add('hidden');

    // Resetear estilos de tabs inferiores
    navTabs.forEach(tab => {
      if (!tab) return;
      tab.className = "nav-tab flex-1 flex flex-col items-center justify-center text-on-surface-variant hover:text-primary rounded-xl py-1 transition-colors active:scale-95";
      const icon = tab.querySelector('.material-symbols-outlined');
      if (icon) icon.classList.remove('icon-fill');
    });

    const activeTabClass = "nav-tab flex-1 flex flex-col items-center justify-center text-primary bg-secondary-container/40 rounded-xl py-1 transition-all active:scale-95";

    // Gestionar botón de retorno en cabecera
    if (viewName === 'pacientes') {
      btnHeaderBack.classList.add('hidden');
      if (viewPacientes) viewPacientes.classList.remove('hidden');
      if (tabNavPacientes) {
        tabNavPacientes.className = activeTabClass;
        tabNavPacientes.querySelector('.material-symbols-outlined')?.classList.add('icon-fill');
      }
      renderPatients();
    } else if (viewName === 'citas') {
      btnHeaderBack.classList.remove('hidden');
      if (viewCitas) viewCitas.classList.remove('hidden');
      if (tabNavCitas) {
        tabNavCitas.className = activeTabClass;
        tabNavCitas.querySelector('.material-symbols-outlined')?.classList.add('icon-fill');
      }
      renderAppointmentsView();
    } else if (viewName === 'sesion') {
      btnHeaderBack.classList.remove('hidden');
      if (viewSesion) viewSesion.classList.remove('hidden');
      if (tabNavSesion) {
        tabNavSesion.className = activeTabClass;
        tabNavSesion.querySelector('.material-symbols-outlined')?.classList.add('icon-fill');
      }

      if (params.patientCode) {
        state.selectedPatientCode = params.patientCode;
      }
      prepareSessionForm(state.selectedPatientCode, params.preloadedExercises);
    } else if (viewName === 'plan') {
      btnHeaderBack.classList.remove('hidden');
      if (viewPlan) viewPlan.classList.remove('hidden');
      if (tabNavPlan) {
        tabNavPlan.className = activeTabClass;
        tabNavPlan.querySelector('.material-symbols-outlined')?.classList.add('icon-fill');
      }

      if (params.patientCode) {
        state.selectedPatientCode = params.patientCode;
      }
      renderPlanView(state.selectedPatientCode);
    } else if (viewName === 'evolucion') {
      btnHeaderBack.classList.remove('hidden');
      if (viewEvolucion) viewEvolucion.classList.remove('hidden');
      if (tabNavEvolucion) {
        tabNavEvolucion.className = activeTabClass;
        tabNavEvolucion.querySelector('.material-symbols-outlined')?.classList.add('icon-fill');
      }

      if (params.patientCode) {
        state.selectedPatientCode = params.patientCode;
      }
      renderEvolutionView(state.selectedPatientCode);
    }

    // Scroll hacia arriba suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Eventos de tabs inferiores
  if (tabNavPacientes) tabNavPacientes.addEventListener('click', () => switchView('pacientes'));
  if (tabNavCitas) tabNavCitas.addEventListener('click', () => switchView('citas'));
  if (tabNavSesion) tabNavSesion.addEventListener('click', () => switchView('sesion'));
  if (tabNavPlan) tabNavPlan.addEventListener('click', () => switchView('plan'));
  if (tabNavEvolucion) tabNavEvolucion.addEventListener('click', () => switchView('evolucion'));
  if (btnHeaderBack) btnHeaderBack.addEventListener('click', () => switchView('pacientes'));

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

  const btnActionAiConsult = document.getElementById('btn-action-ai-consult');
  if (btnActionAiConsult) {
    btnActionAiConsult.addEventListener('click', () => {
      closePatientActionModal();
      openGeminiModal(state.selectedPatientCode);
    });
  }

  const btnActionScheduleApt = document.getElementById('btn-action-schedule-apt');
  if (btnActionScheduleApt) {
    btnActionScheduleApt.addEventListener('click', () => {
      closePatientActionModal();
      openAppointmentModal(state.selectedPatientCode);
    });
  }

  const btnActionViewPlan = document.getElementById('btn-action-view-plan');
  if (btnActionViewPlan) {
    btnActionViewPlan.addEventListener('click', () => {
      closePatientActionModal();
      switchView('plan', { patientCode: state.selectedPatientCode });
    });
  }

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

        <!-- Carga y Descanso entre series -->
        <div class="grid grid-cols-2 gap-2 pt-1">
          <div class="bg-surface-container-low p-2 rounded-lg border border-outline-variant/30">
            <span class="text-[10px] text-outline block">Carga / Resistencia</span>
            <input 
              type="text" 
              placeholder="Ej. Autocarga, 4 kg, Banda media..." 
              value="${escapeHtml(ex.carga || 'Autocarga')}" 
              data-idx="${idx}" 
              class="ex-load-input font-mono-code font-bold text-xs text-primary bg-transparent border-0 p-0 focus:ring-0 outline-none w-full"
            />
          </div>
          <div class="bg-surface-container-low p-2 rounded-lg border border-outline-variant/30">
            <span class="text-[10px] text-outline block">Descanso entre series</span>
            <input 
              type="text" 
              placeholder="Ej. 60 seg" 
              value="${escapeHtml(ex.descanso || '60 seg')}" 
              data-idx="${idx}" 
              class="ex-rest-input font-mono-code font-bold text-xs text-on-surface bg-transparent border-0 p-0 focus:ring-0 outline-none w-full"
            />
          </div>
        </div>

        <!-- Notas / Criterio técnico del ejercicio -->
        <div>
          <input 
            type="text" 
            placeholder="Criterio técnico (ej. Sin dolor agudo, ritmo excéntrico 3-1-1)..." 
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

    // Inputs de texto de nombre, repeticiones, carga, descanso y notas
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

    sessionExercisesList.querySelectorAll('.ex-load-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        if (state.newSession.exercises[idx]) state.newSession.exercises[idx].carga = e.target.value.trim();
      });
    });

    sessionExercisesList.querySelectorAll('.ex-rest-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        if (state.newSession.exercises[idx]) state.newSession.exercises[idx].descanso = e.target.value.trim();
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
          carga: preset.carga || 'Autocarga',
          descanso: preset.descanso || '60 seg',
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
      carga: 'Autocarga',
      descanso: '60 seg',
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
    const painTypeEl = document.getElementById('session-input-pain-type');
    const painTimingEl = document.getElementById('session-input-pain-timing');
    const loadToleranceEl = document.getElementById('session-input-load-tolerance');
    const redFlagsEl = document.getElementById('session-input-red-flags');
    const clinicalReasoningEl = document.getElementById('session-input-clinical-reasoning');

    const sessionPayload = {
      codigoPaciente: patientCode,
      fecha: sessionInputDate.value || new Date().toISOString().split('T')[0],
      nivelDolor: state.newSession.painScore,
      tipoDolor: painTypeEl ? painTypeEl.value : 'Sordo / Mecánico (Sobrecarga)',
      momentoDolor: painTimingEl ? painTimingEl.value : 'Durante la carga / ejercicio',
      toleranciaCarga: loadToleranceEl ? loadToleranceEl.value : 'adecuada',
      banderaAlerta: redFlagsEl ? redFlagsEl.value : 'ninguna',
      criterioClinicoSesion: clinicalReasoningEl ? clinicalReasoningEl.value.trim() : '',
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

    // Actualizar sección del Asistente IA para este paciente
    renderEvolutionAISection(patient, sessions);
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
  // 5. MODAL DE ESTADO Y SINCRONIZACIÓN FIREBASE
  // ========================================================
  const modalDbStatusDot = document.getElementById('modal-db-status-dot');
  const modalDbStatusText = document.getElementById('modal-db-status-text');
  const btnForceSyncFirebase = document.getElementById('btn-force-sync-firebase');

  function updateCloudStatusUI() {
    const status = window.db ? window.db.cloudStatus : { state: 'local' };
    const labelDbStatus = document.getElementById('label-db-status');

    if (status && status.state === 'connected') {
      if (modalDbStatusDot) modalDbStatusDot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500";
      if (modalDbStatusText) {
        modalDbStatusText.textContent = "Conectado y sincronizado en tiempo real";
        modalDbStatusText.className = "text-xs font-bold text-emerald-800";
      }
      if (labelDbStatus) labelDbStatus.textContent = "Firebase Conectado";
    } else if (status && status.state === 'error') {
      if (modalDbStatusDot) modalDbStatusDot.className = "w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse";
      if (modalDbStatusText) {
        modalDbStatusText.textContent = "Atención: Falta habilitar 'Reglas' en Firebase";
        modalDbStatusText.className = "text-xs font-bold text-amber-800";
      }
      if (labelDbStatus) labelDbStatus.textContent = "Reglas Firebase Pendientes";
    } else {
      if (modalDbStatusDot) modalDbStatusDot.className = "w-2.5 h-2.5 rounded-full bg-emerald-600";
      if (modalDbStatusText) {
        modalDbStatusText.textContent = "Modo Clínico Local (Offline)";
        modalDbStatusText.className = "text-xs font-bold text-primary";
      }
      if (labelDbStatus) labelDbStatus.textContent = "Modo Clínico Local";
    }
  }

  btnOpenFirebaseModal.addEventListener('click', () => {
    updateCloudStatusUI();
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

  if (btnForceSyncFirebase) {
    btnForceSyncFirebase.addEventListener('click', async () => {
      btnForceSyncFirebase.disabled = true;
      btnForceSyncFirebase.innerHTML = `
        <div class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span>Sincronizando con Firebase...</span>
      `;

      try {
        const result = await window.db.syncWithCloud(true);
        if (result.success) {
          showToast(result.message, 'success');
        } else {
          showToast(result.message, 'error');
        }
      } catch (e) {
        showToast(e.message || 'Error al sincronizar con Firebase', 'error');
      } finally {
        btnForceSyncFirebase.disabled = false;
        btnForceSyncFirebase.innerHTML = `
          <span class="material-symbols-outlined text-[18px]">sync</span>
          <span>🔄 Subir y Sincronizar Datos con Firebase Ahora</span>
        `;
        updateCloudStatusUI();
      }
    });
  }


  // ========================================================
  // 6. ASISTENTE CLÍNICO IA & GEMINI
  // ========================================================
  const btnEvolGeneratePrompts = document.getElementById('btn-evol-generate-prompts');
  const btnEvolOpenAiChat = document.getElementById('btn-evol-open-ai-chat');
  const evolPromptsContainer = document.getElementById('evol-prompts-container');
  const evolPromptsList = document.getElementById('evol-prompts-list');
  const btnToggleAiHistory = document.getElementById('btn-toggle-ai-history');
  const evolAiQueriesList = document.getElementById('evol-ai-queries-list');
  const evolAiQueriesCount = document.getElementById('evol-ai-queries-count');
  const iconToggleAiHistory = document.getElementById('icon-toggle-ai-history');
  const badgeEvolAiStatus = document.getElementById('badge-evol-ai-status');

  function renderEvolutionAISection(patient, sessions = []) {
    if (!patient) return;
    const hasKey = window.gemini && window.gemini.hasApiKey();

    if (badgeEvolAiStatus) {
      if (hasKey) {
        badgeEvolAiStatus.textContent = 'Gemini Conectado';
        badgeEvolAiStatus.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300';
      } else {
        badgeEvolAiStatus.textContent = 'API Key Pendiente';
        badgeEvolAiStatus.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300';
      }
    }

    const queries = window.db ? window.db.getAIQueries(patient.codigo) : [];
    if (evolAiQueriesCount) evolAiQueriesCount.textContent = queries.length;

    renderEvolSavedQueries(queries);
  }

  function renderEvolSavedQueries(queries) {
    if (!evolAiQueriesList) return;
    evolAiQueriesList.innerHTML = '';

    if (queries.length === 0) {
      evolAiQueriesList.innerHTML = `
        <p class="text-[11px] text-outline text-center py-2 bg-surface-container-low rounded-lg">
          Aún no hay preguntas ni respuestas guardadas para este paciente.
        </p>
      `;
      return;
    }

    queries.forEach(q => {
      const card = document.createElement('div');
      card.className = "bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 space-y-1.5 shadow-xs";
      card.innerHTML = `
        <div class="flex items-center justify-between text-[10px] text-secondary">
          <span class="font-bold flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px] text-amber-600">psychology</span>
            Pregunta al Asistente IA
          </span>
          <span class="font-mono-code">${escapeHtml(q.fecha)}</span>
        </div>
        <p class="text-xs font-semibold text-on-surface">${escapeHtml(q.pregunta)}</p>
        <div class="bg-surface-container-low p-2 rounded-lg text-[11px] text-on-surface-variant leading-relaxed">
          ${window.gemini ? window.gemini.formatMarkdown(q.respuesta) : escapeHtml(q.respuesta)}
        </div>
      `;
      evolAiQueriesList.appendChild(card);
    });
  }

  if (btnToggleAiHistory) {
    btnToggleAiHistory.addEventListener('click', () => {
      const isHidden = evolAiQueriesList.classList.contains('hidden');
      if (isHidden) {
        evolAiQueriesList.classList.remove('hidden');
        iconToggleAiHistory.textContent = 'expand_less';
      } else {
        evolAiQueriesList.classList.add('hidden');
        iconToggleAiHistory.textContent = 'expand_more';
      }
    });
  }

  if (btnEvolGeneratePrompts) {
    btnEvolGeneratePrompts.addEventListener('click', () => {
      const patient = window.db.getPatient(state.selectedPatientCode);
      const sessions = window.db.getSessionsByPatient(state.selectedPatientCode);
      const prompts = window.gemini.generatePromptsForPatient(patient, sessions);

      evolPromptsList.innerHTML = '';
      prompts.forEach((p, idx) => {
        const item = document.createElement('div');
        item.className = "bg-surface-container-lowest p-3 rounded-xl border border-emerald-300 shadow-xs space-y-2";
        item.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-primary">${escapeHtml(p.titulo)}</span>
            <span class="text-[10px] font-mono-code bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Prompt #${idx+1}</span>
          </div>
          <p class="text-xs text-on-surface leading-relaxed bg-surface-bright/70 p-2 rounded-lg border border-outline-variant/30 font-medium">
            "${escapeHtml(p.prompt)}"
          </p>
          <div class="flex gap-2 justify-end pt-1">
            <button type="button" class="btn-copy-prompt-item px-3 py-1 bg-surface-container-low hover:bg-surface-container text-primary text-xs font-bold rounded-lg flex items-center gap-1 active:scale-95 transition-all">
              <span class="material-symbols-outlined text-[15px]">content_copy</span>
              <span>Copiar</span>
            </button>
            <button type="button" class="btn-ask-prompt-item px-3 py-1 bg-primary-container text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-primary active:scale-95 transition-all shadow-xs">
              <span class="material-symbols-outlined text-[15px]">chat</span>
              <span>Consultar a Gemini</span>
            </button>
          </div>
        `;

        item.querySelector('.btn-copy-prompt-item').addEventListener('click', () => {
          navigator.clipboard.writeText(p.prompt);
          showToast('¡Prompt copiado al portapapeles!', 'success');
        });

        item.querySelector('.btn-ask-prompt-item').addEventListener('click', () => {
          openGeminiModal(state.selectedPatientCode, p.prompt, true);
        });

        evolPromptsList.appendChild(item);
      });

      evolPromptsContainer.classList.remove('hidden');
      showToast('¡3 Prompts clínicos generados para este paciente!', 'success');
    });
  }

  if (btnEvolOpenAiChat) {
    btnEvolOpenAiChat.addEventListener('click', () => {
      openGeminiModal(state.selectedPatientCode);
    });
  }

  // --- Modal Gemini Assistant ---
  const modalGeminiAssistant = document.getElementById('modal-gemini-assistant');
  const btnOpenGeminiModal = document.getElementById('btn-open-gemini-modal');
  const btnCloseGeminiModal = document.getElementById('btn-close-gemini-modal');
  const geminiApiKeyInput = document.getElementById('gemini-api-key-input');
  const btnToggleKeyVisibility = document.getElementById('btn-toggle-key-visibility');
  const btnSaveGeminiKey = document.getElementById('btn-save-gemini-key');
  const btnTestGeminiKey = document.getElementById('btn-test-gemini-key');
  const geminiKeyStatusBadge = document.getElementById('gemini-key-status-badge');
  const aiPatientSelect = document.getElementById('ai-patient-select');
  const aiPatientSummary = document.getElementById('ai-patient-summary');
  const btnAiGenerate3Prompts = document.getElementById('btn-ai-generate-3-prompts');
  const aiPromptsCardsContainer = document.getElementById('ai-prompts-cards-container');
  const aiCustomPromptInput = document.getElementById('ai-custom-prompt-input');
  const btnSendGeminiQuery = document.getElementById('btn-send-gemini-query');
  const aiQueryLoading = document.getElementById('ai-query-loading');
  const aiResponseCard = document.getElementById('ai-response-card');
  const aiResponseText = document.getElementById('ai-response-text');
  const btnCopyAiResponse = document.getElementById('btn-copy-ai-response');
  const modalAiHistoryList = document.getElementById('modal-ai-history-list');
  const modalAiHistoryCount = document.getElementById('modal-ai-history-count');

  function openGeminiModal(patientCode = null, prefilledPrompt = '', autoSend = false) {
    const allPatients = window.db.getPatients();
    const activeCode = patientCode || state.selectedPatientCode || (allPatients[0]?.codigo);

    if (aiPatientSelect) {
      aiPatientSelect.innerHTML = '';
      allPatients.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.codigo;
        opt.textContent = `${p.codigo} - ${p.diagnostico}`;
        if (p.codigo === activeCode) opt.selected = true;
        aiPatientSelect.appendChild(opt);
      });
    }

    updateAiPatientInfo(activeCode);

    const existingKey = window.gemini ? window.gemini.getApiKey() : '';
    if (geminiApiKeyInput) {
      geminiApiKeyInput.value = existingKey;
    }
    updateGeminiKeyBadge(Boolean(existingKey));

    if (prefilledPrompt && aiCustomPromptInput) {
      aiCustomPromptInput.value = prefilledPrompt;
    }

    renderModalAiHistory(activeCode);

    if (modalGeminiAssistant) {
      modalGeminiAssistant.classList.remove('hidden');
      modalGeminiAssistant.classList.add('flex');
    }

    if (autoSend && prefilledPrompt && btnSendGeminiQuery) {
      setTimeout(() => {
        btnSendGeminiQuery.click();
      }, 150);
    }
  }

  function closeGeminiModal() {
    if (modalGeminiAssistant) {
      modalGeminiAssistant.classList.add('hidden');
      modalGeminiAssistant.classList.remove('flex');
    }
  }

  if (btnOpenGeminiModal) btnOpenGeminiModal.addEventListener('click', () => openGeminiModal());
  if (btnCloseGeminiModal) btnCloseGeminiModal.addEventListener('click', closeGeminiModal);
  if (modalGeminiAssistant) {
    modalGeminiAssistant.addEventListener('click', (e) => {
      if (e.target === modalGeminiAssistant) closeGeminiModal();
    });
  }

  function updateAiPatientInfo(code) {
    const patient = window.db.getPatient(code);
    if (patient && aiPatientSummary) {
      aiPatientSummary.textContent = `${patient.codigo} • ${patient.diagnostico} (${patient.zona}) • Dolor: ${patient.ultimoDolor}/10`;
    }
  }

  if (aiPatientSelect) {
    aiPatientSelect.addEventListener('change', () => {
      updateAiPatientInfo(aiPatientSelect.value);
      renderModalAiHistory(aiPatientSelect.value);
    });
  }

  function updateGeminiKeyBadge(hasKey) {
    if (!geminiKeyStatusBadge) return;
    if (hasKey) {
      geminiKeyStatusBadge.textContent = '🟢 Clave Guardada';
      geminiKeyStatusBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300';
    } else {
      geminiKeyStatusBadge.textContent = '🟡 Sin Clave Guardada';
      geminiKeyStatusBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300';
    }
  }

  if (btnToggleKeyVisibility) {
    btnToggleKeyVisibility.addEventListener('click', () => {
      const isPassword = geminiApiKeyInput.type === 'password';
      geminiApiKeyInput.type = isPassword ? 'text' : 'password';
      btnToggleKeyVisibility.querySelector('.material-symbols-outlined').textContent = isPassword ? 'visibility_off' : 'visibility';
    });
  }

  if (btnSaveGeminiKey) {
    btnSaveGeminiKey.addEventListener('click', () => {
      const key = geminiApiKeyInput.value.trim();
      if (!key) {
        showToast('Escribe o pega tu clave de Gemini API', 'error');
        return;
      }
      window.gemini.setApiKey(key);
      updateGeminiKeyBadge(true);
      showToast('¡API Key de Gemini guardada de forma segura en tu navegador!', 'success');
    });
  }

  if (btnTestGeminiKey) {
    btnTestGeminiKey.addEventListener('click', async () => {
      const key = geminiApiKeyInput.value.trim() || window.gemini.getApiKey();
      if (!key) {
        showToast('Primero ingresa tu API Key de Gemini', 'error');
        return;
      }
      btnTestGeminiKey.disabled = true;
      btnTestGeminiKey.textContent = 'Probando...';
      const result = await window.gemini.testConnection(key);
      btnTestGeminiKey.disabled = false;
      btnTestGeminiKey.textContent = 'Probar';

      if (result.success) {
        updateGeminiKeyBadge(true);
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    });
  }

  if (btnAiGenerate3Prompts) {
    btnAiGenerate3Prompts.addEventListener('click', () => {
      const selectedCode = aiPatientSelect ? aiPatientSelect.value : state.selectedPatientCode;
      const patient = window.db.getPatient(selectedCode);
      const sessions = window.db.getSessionsByPatient(selectedCode);
      const prompts = window.gemini.generatePromptsForPatient(patient, sessions);

      aiPromptsCardsContainer.innerHTML = '';
      prompts.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = "bg-surface-container-low p-3 rounded-xl border border-outline-variant/40 space-y-2";
        card.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-primary">${escapeHtml(p.titulo)}</span>
            <span class="text-[10px] font-mono-code bg-secondary-container text-primary font-bold px-2 py-0.5 rounded-full">Sugerencia #${idx+1}</span>
          </div>
          <p class="text-xs text-on-surface leading-relaxed">
            "${escapeHtml(p.prompt)}"
          </p>
          <div class="flex gap-2 justify-end pt-1">
            <button type="button" class="btn-modal-copy-prompt px-3 py-1 bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/40 text-on-surface text-xs font-semibold rounded-lg flex items-center gap-1 active:scale-95 transition-all">
              <span class="material-symbols-outlined text-[14px]">content_copy</span>
              <span>Copiar</span>
            </button>
            <button type="button" class="btn-modal-use-prompt px-3 py-1 bg-primary-container text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-primary active:scale-95 transition-all shadow-xs">
              <span class="material-symbols-outlined text-[14px]">edit_note</span>
              <span>Cargar en Consulta</span>
            </button>
          </div>
        `;

        card.querySelector('.btn-modal-copy-prompt').addEventListener('click', () => {
          navigator.clipboard.writeText(p.prompt);
          showToast('¡Prompt copiado al portapapeles!', 'success');
        });

        card.querySelector('.btn-modal-use-prompt').addEventListener('click', () => {
          aiCustomPromptInput.value = p.prompt;
          aiCustomPromptInput.focus();
          aiCustomPromptInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        aiPromptsCardsContainer.appendChild(card);
      });

      showToast('¡3 Prompts generados y adaptados para este paciente!', 'success');
    });
  }

  if (btnSendGeminiQuery) {
    btnSendGeminiQuery.addEventListener('click', async () => {
      const promptText = aiCustomPromptInput.value.trim();
      if (!promptText) {
        showToast('Escribe una consulta o selecciona un prompt primero', 'error');
        aiCustomPromptInput.focus();
        return;
      }

      const selectedCode = aiPatientSelect ? aiPatientSelect.value : state.selectedPatientCode;
      const patient = window.db ? window.db.getPatient(selectedCode) : null;

      btnSendGeminiQuery.disabled = true;
      aiQueryLoading.classList.remove('hidden');
      aiResponseCard.classList.add('hidden');

      try {
        const responseData = await window.gemini.askGemini(promptText, patient);
        const textToDisplay = (responseData && typeof responseData === 'object' && responseData.text)
          ? responseData.text
          : (typeof responseData === 'string' ? responseData : JSON.stringify(responseData));

        aiResponseText.innerHTML = window.gemini.formatMarkdown(textToDisplay);
        aiResponseCard.classList.remove('hidden');

        const sourceLabel = (responseData && typeof responseData === 'object' && responseData.source === 'gemini')
          ? `Google Gemini (${responseData.model || 'Cloud'})`
          : 'Motor Clínico Basado en Evidencia';

        showToast(`¡Respuesta generada de inmediato por ${sourceLabel}!`, 'success');

        // Desplazamiento suave para visualizar la respuesta completa
        setTimeout(() => {
          aiResponseCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 120);

        renderModalAiHistory(selectedCode);
        if (state.currentView === 'evolucion') {
          renderEvolutionAISection(patient);
        }
      } catch (err) {
        console.error('Error al consultar Gemini:', err);
        const fallback = window.gemini.generateImmediateClinicalResponse(promptText, patient);
        aiResponseText.innerHTML = window.gemini.formatMarkdown(fallback);
        aiResponseCard.classList.remove('hidden');
        showToast('¡Respuesta generada de inmediato por el Asistente Clínico!', 'info');
      } finally {
        btnSendGeminiQuery.disabled = false;
        aiQueryLoading.classList.add('hidden');
      }
    });
  }

  if (aiCustomPromptInput) {
    aiCustomPromptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (btnSendGeminiQuery) btnSendGeminiQuery.click();
      }
    });
  }

  if (btnCopyAiResponse) {
    btnCopyAiResponse.addEventListener('click', () => {
      const textToCopy = aiResponseText.innerText || aiResponseText.textContent;
      navigator.clipboard.writeText(textToCopy);
      showToast('¡Respuesta clínica copiada al portapapeles!', 'success');
    });
  }

  function renderModalAiHistory(patientCode) {
    if (!modalAiHistoryList) return;
    const queries = window.db ? window.db.getAIQueries(patientCode) : [];
    if (modalAiHistoryCount) modalAiHistoryCount.textContent = `${queries.length} consulta${queries.length === 1 ? '' : 's'}`;

    modalAiHistoryList.innerHTML = '';
    if (queries.length === 0) {
      modalAiHistoryList.innerHTML = `
        <p class="text-[11px] text-outline text-center py-3 bg-surface-container-low rounded-lg">
          No hay preguntas guardadas para este paciente todavía.
        </p>
      `;
      return;
    }

    queries.forEach(q => {
      const item = document.createElement('div');
      item.className = "bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 space-y-1.5";
      item.innerHTML = `
        <div class="flex items-center justify-between text-[10px] text-secondary">
          <span class="font-bold flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px] text-amber-600">psychology</span>
            ${escapeHtml(q.codigoPaciente)}
          </span>
          <span class="font-mono-code">${escapeHtml(q.fecha)}</span>
        </div>
        <p class="text-xs font-semibold text-on-surface">${escapeHtml(q.pregunta)}</p>
        <div class="bg-surface-container-lowest p-2 rounded-lg text-[11px] text-on-surface-variant leading-relaxed">
          ${window.gemini ? window.gemini.formatMarkdown(q.respuesta) : escapeHtml(q.respuesta)}
        </div>
      `;
      modalAiHistoryList.appendChild(item);
    });
  }


  // ========================================================
  // 7. PANTALLA: AGENDA Y PROGRAMACIÓN DE CITAS
  // ========================================================
  const btnOpenAppointmentModal = document.getElementById('btn-open-appointment-modal');
  const btnCloseAppointmentModal = document.getElementById('btn-close-appointment-modal');
  const btnCancelAppointmentModal = document.getElementById('btn-cancel-appointment-modal');
  const modalNewAppointment = document.getElementById('modal-new-appointment');
  const formNewAppointment = document.getElementById('form-new-appointment');
  const aptPatientSelect = document.getElementById('apt-patient-select');
  const aptInputDate = document.getElementById('apt-input-date');
  const aptInputTime = document.getElementById('apt-input-time');
  const aptInputType = document.getElementById('apt-input-type');
  const aptInputModality = document.getElementById('apt-input-modality');
  const aptInputReason = document.getElementById('apt-input-reason');
  const aptInputNotes = document.getElementById('apt-input-notes');
  const appointmentsCardsContainer = document.getElementById('appointments-cards-container');
  const countAptsAll = document.getElementById('count-apts-all');
  const countAptsPending = document.getElementById('count-apts-pending');
  const countAptsDone = document.getElementById('count-apts-done');
  const aptFilterButtons = document.querySelectorAll('.btn-apt-filter');

  function renderAppointmentsView() {
    if (!appointmentsCardsContainer) return;

    const allApts = window.db ? window.db.getAppointments('todas') : [];
    const filteredApts = window.db ? window.db.getAppointments(state.currentAptFilter) : [];

    // Actualizar contadores
    if (countAptsAll) countAptsAll.textContent = allApts.length;
    if (countAptsPending) countAptsPending.textContent = allApts.filter(a => a.estado === 'programada').length;
    if (countAptsDone) countAptsDone.textContent = allApts.filter(a => a.estado === 'completada').length;

    // Actualizar estilos de los botones de filtro
    aptFilterButtons.forEach(btn => {
      const f = btn.dataset.filter;
      if (f === state.currentAptFilter) {
        btn.className = "btn-apt-filter px-3 py-1 rounded-full text-xs font-bold bg-primary-container text-white shadow-xs";
      } else {
        btn.className = "btn-apt-filter px-3 py-1 rounded-full text-xs font-medium bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant/30";
      }
    });

    appointmentsCardsContainer.innerHTML = '';

    if (filteredApts.length === 0) {
      appointmentsCardsContainer.innerHTML = `
        <div class="text-center py-10 px-4 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/40 space-y-2">
          <span class="material-symbols-outlined text-4xl text-outline">event_busy</span>
          <p class="text-xs font-semibold text-on-surface">No hay citas en este filtro (${state.currentAptFilter})</p>
          <p class="text-[11px] text-outline">Programa una nueva cita haciendo clic en "+ Programar Cita".</p>
        </div>
      `;
      return;
    }

    filteredApts.forEach(apt => {
      const patient = window.db ? window.db.getPatient(apt.codigoPaciente) : null;
      const isCompleted = apt.estado === 'completada';
      const isCancelled = apt.estado === 'cancelada';

      const statusBadge = isCompleted 
        ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Completada</span>'
        : isCancelled
          ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">✕ Cancelada</span>'
          : '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">⏱ Programada</span>';

      const card = document.createElement('article');
      card.className = "bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/40 shadow-xs space-y-3";
      card.innerHTML = `
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-md bg-[#E8F3F1] border border-[#C5E2DC] text-[#0D7A68] font-mono-code font-bold text-xs">
              ${escapeHtml(apt.codigoPaciente)}
            </span>
            <div>
              <h4 class="text-xs font-bold text-on-surface">${escapeHtml(patient?.diagnostico || 'Paciente en tratamiento')}</h4>
              <span class="text-[10px] text-outline">${escapeHtml(patient?.zona || 'Área general')}</span>
            </div>
          </div>
          ${statusBadge}
        </div>

        <div class="grid grid-cols-2 gap-2 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 text-xs">
          <div class="flex items-center gap-1.5 text-on-surface">
            <span class="material-symbols-outlined text-primary text-[16px]">calendar_today</span>
            <span class="font-bold">${escapeHtml(apt.fecha)}</span>
          </div>
          <div class="flex items-center gap-1.5 text-on-surface">
            <span class="material-symbols-outlined text-primary text-[16px]">schedule</span>
            <span class="font-mono-code font-semibold">${escapeHtml(apt.hora || '10:00 AM')}</span>
          </div>
          <div class="flex items-center gap-1.5 text-secondary">
            <span class="material-symbols-outlined text-primary text-[16px]">category</span>
            <span class="truncate">${escapeHtml(apt.tipo || 'Sesión')}</span>
          </div>
          <div class="flex items-center gap-1.5 text-secondary">
            <span class="material-symbols-outlined text-primary text-[16px]">place</span>
            <span>${escapeHtml(apt.modalidad || 'Presencial')}</span>
          </div>
        </div>

        ${apt.motivo ? `
          <p class="text-xs text-on-surface-variant font-medium">
            <strong class="text-primary text-[11px] block">Objetivo de la cita:</strong>
            ${escapeHtml(apt.motivo)}
          </p>
        ` : ''}

        ${apt.notas ? `
          <p class="text-[11px] text-outline bg-surface-bright/70 p-2 rounded-lg border border-outline-variant/20">
            <strong>Indicaciones:</strong> ${escapeHtml(apt.notas)}
          </p>
        ` : ''}

        <div class="flex items-center justify-between pt-2 border-t border-outline-variant/20">
          <div class="flex gap-1.5">
            <button type="button" class="btn-apt-toggle px-2.5 py-1 text-xs font-bold rounded-lg ${isCompleted ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'} active:scale-95 transition-all">
              ${isCompleted ? '↩ Reabrir Cita' : '✓ Marcar Completada'}
            </button>
            <button type="button" class="btn-apt-start-session px-2.5 py-1 text-xs font-bold rounded-lg bg-primary-container text-white hover:bg-primary active:scale-95 transition-all">
              ▶ Iniciar Sesión
            </button>
          </div>
          <button type="button" class="btn-apt-delete text-outline hover:text-error p-1 rounded-md" title="Eliminar cita">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      `;

      // Eventos de la tarjeta
      card.querySelector('.btn-apt-toggle').addEventListener('click', () => {
        const nextState = isCompleted ? 'programada' : 'completada';
        window.db.updateAppointment(apt.id, { estado: nextState });
        showToast(isCompleted ? 'Cita reabierta como programada' : '¡Cita marcada como completada!', 'success');
        renderAppointmentsView();
      });

      card.querySelector('.btn-apt-start-session').addEventListener('click', () => {
        switchView('sesion', { patientCode: apt.codigoPaciente });
      });

      card.querySelector('.btn-apt-delete').addEventListener('click', () => {
        if (confirm(`¿Deseas eliminar esta cita de ${apt.codigoPaciente}?`)) {
          window.db.deleteAppointment(apt.id);
          showToast('Cita eliminada', 'info');
          renderAppointmentsView();
        }
      });

      appointmentsCardsContainer.appendChild(card);
    });
  }

  function openAppointmentModal(prefilledCode = null) {
    const allPatients = window.db.getPatients();
    if (allPatients.length === 0) {
      showToast('Debes tener al menos un paciente registrado para programar citas', 'error');
      switchView('pacientes');
      return;
    }

    if (aptPatientSelect) {
      aptPatientSelect.innerHTML = '';
      allPatients.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.codigo;
        opt.textContent = `${p.codigo} - ${p.diagnostico}`;
        if (p.codigo === prefilledCode || p.codigo === state.selectedPatientCode) opt.selected = true;
        aptPatientSelect.appendChild(opt);
      });
    }

    if (aptInputDate) {
      const today = new Date().toISOString().split('T')[0];
      aptInputDate.value = today;
    }

    if (modalNewAppointment) {
      modalNewAppointment.classList.remove('hidden');
      modalNewAppointment.classList.add('flex');
    }
  }

  function closeAppointmentModal() {
    if (modalNewAppointment) {
      modalNewAppointment.classList.add('hidden');
      modalNewAppointment.classList.remove('flex');
    }
  }

  if (btnOpenAppointmentModal) btnOpenAppointmentModal.addEventListener('click', () => openAppointmentModal());
  if (btnCloseAppointmentModal) btnCloseAppointmentModal.addEventListener('click', closeAppointmentModal);
  if (btnCancelAppointmentModal) btnCancelAppointmentModal.addEventListener('click', closeAppointmentModal);
  if (modalNewAppointment) {
    modalNewAppointment.addEventListener('click', (e) => {
      if (e.target === modalNewAppointment) closeAppointmentModal();
    });
  }

  aptFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentAptFilter = btn.dataset.filter;
      renderAppointmentsView();
    });
  });

  if (formNewAppointment) {
    formNewAppointment.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = aptPatientSelect ? aptPatientSelect.value : state.selectedPatientCode;
      const date = aptInputDate ? aptInputDate.value : new Date().toISOString().split('T')[0];
      const time = aptInputTime ? aptInputTime.value.trim() : '10:00 AM';
      const type = aptInputType ? aptInputType.value : 'Sesión de Rehabilitación';
      const modality = aptInputModality ? aptInputModality.value : 'Presencial';
      const reason = aptInputReason ? aptInputReason.value.trim() : '';
      const notes = aptInputNotes ? aptInputNotes.value.trim() : '';

      try {
        window.db.addAppointment({
          codigoPaciente: code,
          fecha: date,
          hora: time,
          tipo: type,
          modalidad: modality,
          motivo: reason,
          notas: notes,
          estado: 'programada'
        });
        closeAppointmentModal();
        showToast(`¡Cita programada para ${code} el ${date} a las ${time}!`, 'success');
        if (state.currentView === 'citas') {
          renderAppointmentsView();
        }
      } catch (err) {
        showToast(err.message || 'Error al programar la cita', 'error');
      }
    });
  }


  // ========================================================
  // 8. PANTALLA: PLANIFICACIÓN DE TERAPIA Y DIAGNÓSTICO CIF
  // ========================================================
  const planPatientBadge = document.getElementById('plan-patient-code-badge');
  const planPatientTitle = document.getElementById('plan-patient-title');
  const planPatientSelect = document.getElementById('plan-patient-select');
  const btnPlanOptimizeGemini = document.getElementById('btn-plan-optimize-gemini');
  const formTherapyPlan = document.getElementById('form-therapy-plan');
  const planInputMedicalDiag = document.getElementById('plan-input-medical-diag');
  const planInputFunctionalDiag = document.getElementById('plan-input-functional-diag');
  const planInputCifStructure = document.getElementById('plan-input-cif-structure');
  const planInputCifActivity = document.getElementById('plan-input-cif-activity');
  const planInputCifParticipation = document.getElementById('plan-input-cif-participation');
  const btnAddOrthopedicTest = document.getElementById('btn-add-orthopedic-test');
  const planOrthopedicTestsList = document.getElementById('plan-orthopedic-tests-list');
  const planInputPhase = document.getElementById('plan-input-phase');
  const planInputFrequency = document.getElementById('plan-input-frequency');
  const planInputShortGoals = document.getElementById('plan-input-short-goals');
  const planInputLongGoals = document.getElementById('plan-input-long-goals');
  const planInputApproach = document.getElementById('plan-input-approach');
  const planInputClinicalCriteria = document.getElementById('plan-input-clinical-criteria');
  const planInputRedFlags = document.getElementById('plan-input-red-flags');
  const planInputYellowFlags = document.getElementById('plan-input-yellow-flags');

  let currentPlanTests = [];

  function renderPlanView(patientCode) {
    const allPatients = window.db.getPatients();
    if (allPatients.length === 0) {
      showToast('No hay pacientes registrados', 'error');
      switchView('pacientes');
      return;
    }

    if (planPatientSelect) {
      planPatientSelect.innerHTML = '';
      allPatients.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.codigo;
        opt.textContent = `${p.codigo} - ${p.diagnostico}`;
        if (p.codigo === patientCode) opt.selected = true;
        planPatientSelect.appendChild(opt);
      });
    }

    const patient = window.db.getPatient(planPatientSelect.value) || allPatients[0];
    state.selectedPatientCode = patient.codigo;

    if (planPatientBadge) planPatientBadge.textContent = `#${patient.codigo}`;
    if (planPatientTitle) planPatientTitle.textContent = `Plan Terapéutico: ${patient.diagnostico}`;

    const plan = window.db.getTherapyPlan(patient.codigo);

    if (planInputMedicalDiag) planInputMedicalDiag.value = plan.diagnosticoMedico || patient.diagnostico || '';
    if (planInputFunctionalDiag) planInputFunctionalDiag.value = plan.diagnosticoFuncionalCIF || '';
    if (planInputCifStructure) planInputCifStructure.value = plan.cifEstructura || '';
    if (planInputCifActivity) planInputCifActivity.value = plan.cifActividad || '';
    if (planInputCifParticipation) planInputCifParticipation.value = plan.cifParticipacion || '';
    if (planInputPhase) planInputPhase.value = plan.faseRehabilitacion || 'Fase 1: Control de Dolor e Inflamación';
    if (planInputFrequency) planInputFrequency.value = plan.frecuencia || '3 sesiones por semana';
    if (planInputShortGoals) planInputShortGoals.value = plan.objetivosCortoPlazo || '';
    if (planInputLongGoals) planInputLongGoals.value = plan.objetivosLargoPlazo || '';
    if (planInputApproach) planInputApproach.value = plan.enfoqueTerapeutico || '';
    if (planInputClinicalCriteria) planInputClinicalCriteria.value = plan.criterioClinico || '';
    if (planInputRedFlags) planInputRedFlags.value = plan.banderasRojas || 'Descartadas / Sin signos de alarma médica';
    if (planInputYellowFlags) planInputYellowFlags.value = plan.banderasAmarillas || 'Mínima aprensión al movimiento';

    currentPlanTests = Array.isArray(plan.pruebasOrtopedicas) && plan.pruebasOrtopedicas.length > 0 
      ? JSON.parse(JSON.stringify(plan.pruebasOrtopedicas)) 
      : [
          { nombre: 'Prueba de provocación / Palpación tendinosa', resultado: 'Positivo', hallazgos: 'Dolor punzante focal' },
          { nombre: 'Prueba de contracción isométrica resistida', resultado: 'Positivo', hallazgos: 'Debilidad subjetiva por dolor' },
          { nombre: 'Rango articular pasivo / goniometría', resultado: 'Negativo', hallazgos: 'Rango conservado y simétrico' }
        ];

    renderPlanOrthopedicTests();
  }

  function renderPlanOrthopedicTests() {
    if (!planOrthopedicTestsList) return;
    planOrthopedicTestsList.innerHTML = '';

    currentPlanTests.forEach((t, idx) => {
      const row = document.createElement('div');
      row.className = "bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 space-y-2";
      row.innerHTML = `
        <div class="flex items-center justify-between gap-2">
          <input 
            type="text" 
            value="${escapeHtml(t.nombre)}" 
            data-idx="${idx}" 
            placeholder="Nombre de la prueba ortopédica..." 
            class="test-name-input flex-1 bg-transparent font-bold text-xs text-on-surface border-b border-transparent focus:border-primary-container outline-none"
          />
          <div class="flex items-center gap-1.5">
            <select data-idx="${idx}" class="test-result-select bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-2 py-1 text-[11px] font-bold text-primary outline-none">
              <option value="Positivo" ${t.resultado === 'Positivo' ? 'selected' : ''}>Positivo (+)</option>
              <option value="Negativo" ${t.resultado === 'Negativo' ? 'selected' : ''}>Negativo (-)</option>
              <option value="Dudoso" ${t.resultado === 'Dudoso' ? 'selected' : ''}>Dudoso (?)</option>
              <option value="No Evaluado" ${t.resultado === 'No Evaluado' ? 'selected' : ''}>No Evaluado</option>
            </select>
            <button type="button" data-idx="${idx}" class="btn-remove-test text-outline hover:text-error p-1 rounded-md" title="Eliminar prueba">
              <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
        <div>
          <input 
            type="text" 
            value="${escapeHtml(t.hallazgos || '')}" 
            data-idx="${idx}" 
            placeholder="Hallazgo clínico: dolor, crepitación, tope blando, traslación..." 
            class="test-findings-input w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-2.5 py-1 text-[11px] text-on-surface-variant outline-none focus:border-primary-container"
          />
        </div>
      `;

      row.querySelector('.test-name-input').addEventListener('change', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        if (currentPlanTests[i]) currentPlanTests[i].nombre = e.target.value.trim();
      });

      row.querySelector('.test-result-select').addEventListener('change', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        if (currentPlanTests[i]) currentPlanTests[i].resultado = e.target.value;
      });

      row.querySelector('.test-findings-input').addEventListener('change', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        if (currentPlanTests[i]) currentPlanTests[i].hallazgos = e.target.value.trim();
      });

      row.querySelector('.btn-remove-test').addEventListener('click', () => {
        currentPlanTests.splice(idx, 1);
        renderPlanOrthopedicTests();
      });

      planOrthopedicTestsList.appendChild(row);
    });
  }

  if (btnAddOrthopedicTest) {
    btnAddOrthopedicTest.addEventListener('click', () => {
      currentPlanTests.push({
        nombre: 'Nuevo Test Ortopédico / Funcional',
        resultado: 'Positivo',
        hallazgos: 'Respuesta clínica evaluada'
      });
      renderPlanOrthopedicTests();
    });
  }

  if (planPatientSelect) {
    planPatientSelect.addEventListener('change', () => {
      renderPlanView(planPatientSelect.value);
    });
  }

  if (formTherapyPlan) {
    formTherapyPlan.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = planPatientSelect ? planPatientSelect.value : state.selectedPatientCode;

      const planData = {
        codigoPaciente: code,
        diagnosticoMedico: planInputMedicalDiag ? planInputMedicalDiag.value.trim() : '',
        diagnosticoFuncionalCIF: planInputFunctionalDiag ? planInputFunctionalDiag.value.trim() : '',
        cifEstructura: planInputCifStructure ? planInputCifStructure.value.trim() : '',
        cifActividad: planInputCifActivity ? planInputCifActivity.value.trim() : '',
        cifParticipacion: planInputCifParticipation ? planInputCifParticipation.value.trim() : '',
        faseRehabilitacion: planInputPhase ? planInputPhase.value : 'Fase 1',
        frecuencia: planInputFrequency ? planInputFrequency.value : '3 sesiones por semana',
        objetivosCortoPlazo: planInputShortGoals ? planInputShortGoals.value.trim() : '',
        objetivosLargoPlazo: planInputLongGoals ? planInputLongGoals.value.trim() : '',
        enfoqueTerapeutico: planInputApproach ? planInputApproach.value.trim() : '',
        criterioClinico: planInputClinicalCriteria ? planInputClinicalCriteria.value.trim() : '',
        banderasRojas: planInputRedFlags ? planInputRedFlags.value.trim() : '',
        banderasAmarillas: planInputYellowFlags ? planInputYellowFlags.value.trim() : '',
        pruebasOrtopedicas: currentPlanTests
      };

      try {
        window.db.saveTherapyPlan(planData);
        // Actualizar diagnóstico y fase del paciente si cambiaron
        window.db.updatePatient(code, {
          diagnostico: planData.diagnosticoMedico,
          fase: planData.faseRehabilitacion
        });
        showToast(`¡Plan terapéutico y diagnóstico CIF guardados para ${code}!`, 'success');
      } catch (err) {
        showToast(err.message || 'Error al guardar el plan', 'error');
      }
    });
  }

  if (btnPlanOptimizeGemini) {
    btnPlanOptimizeGemini.addEventListener('click', () => {
      const code = planPatientSelect ? planPatientSelect.value : state.selectedPatientCode;
      const patient = window.db.getPatient(code);
      const plan = window.db.getTherapyPlan(code);

      const promptOptimization = `Actúa como especialista clínico en Fisioterapia y Rehabilitación Física.
Tengo el siguiente caso clínico:
- Paciente: ${patient.codigo} (${patient.diagnostico}, ${patient.zona})
- Diagnóstico Funcional CIF: ${plan.diagnosticoFuncionalCIF || 'Por definir'}
- Fase actual: ${plan.faseRehabilitacion || 'Fase 1'}
- Objetivos propuestos: ${plan.objetivosCortoPlazo || 'Control del dolor y recuperación de rango'}
- Criterio clínico actual: ${plan.criterioClinico || 'Adaptación a cargas'}

Por favor:
1. Revisa y optimiza este plan terapéutico según las guías clínicas más recientes (JOSPT/Cochrane).
2. Sugiere dosificación exacta de ejercicios (series, repeticiones, tempo y descanso).
3. Establece 3 criterios objetivos para autorizar el avance hacia la siguiente fase de rehabilitación.`;

      openGeminiModal(code, promptOptimization, true);
    });
  }


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
    else if (state.currentView === 'citas') renderAppointmentsView();
    else if (state.currentView === 'sesion') prepareSessionForm(state.selectedPatientCode);
    else if (state.currentView === 'plan') renderPlanView(state.selectedPatientCode);
    else if (state.currentView === 'evolucion') renderEvolutionView(state.selectedPatientCode);
  });

  // Inicialización de la vista
  switchView('pacientes');
});
