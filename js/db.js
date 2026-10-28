/**
 * FisioConecta - Capa de Base de Datos y Almacenamiento
 * Diseñada para funcionar sin servidor en modo local (localStorage)
 * y lista para conectarse directamente a Firebase Firestore en la nube.
 */

const DB_KEYS = {
  PATIENTS: 'fisioconecta_patients_v1',
  SESSIONS: 'fisioconecta_sessions_v1',
  FIREBASE_CONFIG: 'fisioconecta_firebase_config'
};

// Datos iniciales de cortesía para que el terapeuta vea la aplicación lista para usar
const SEED_PATIENTS = [
  {
    codigo: 'PAC-842',
    diagnostico: 'Tendinopatía rotuliana',
    zona: 'Rodilla derecha • Miembro inferior',
    fechaInicio: '2025-03-12',
    fase: 'Rehab activa • Movilidad + Cargas',
    ultimoDolor: 3,
    estado: 'activo',
    totalSesiones: 5,
    ultimaSesionFecha: 'Hoy (hace 2h)'
  },
  {
    codigo: 'PAC-719',
    diagnostico: 'Lumbalgia mecánica',
    zona: 'Columna lumbar • Región axial',
    fechaInicio: '2025-03-05',
    fase: 'Control motor y fortalecimiento de core',
    ultimoDolor: 6,
    estado: 'activo',
    totalSesiones: 3,
    ultimaSesionFecha: 'Ayer'
  },
  {
    codigo: 'PAC-603',
    diagnostico: 'Esguince de tobillo grado II',
    zona: 'Tobillo izquierdo • Ligamento LPAA',
    fechaInicio: '2025-02-18',
    fase: 'Fase final: Propiocepción y readaptación',
    ultimoDolor: 1,
    estado: 'activo',
    totalSesiones: 8,
    ultimaSesionFecha: 'Hace 3 días'
  }
];

const SEED_SESSIONS = [
  {
    id: 'ses-842-1',
    codigoPaciente: 'PAC-842',
    fecha: '2025-03-12',
    nivelDolor: 7,
    ejercicios: [
      { nombre: 'Isometría de cuádriceps en pared', series: 3, repeticiones: 30, notas: '30 seg por serie' },
      { nombre: 'Elevación de pierna recta', series: 3, repeticiones: 12, notas: 'Sin dolor agudo' }
    ],
    notas: 'Inicio de tratamiento. Dolor agudo al bajar escaleras.'
  },
  {
    id: 'ses-842-2',
    codigoPaciente: 'PAC-842',
    fecha: '2025-03-16',
    nivelDolor: 6,
    ejercicios: [
      { nombre: 'Isometría de cuádriceps en pared', series: 4, repeticiones: 35, notas: 'Mayor tolerancia' },
      { nombre: 'Puente de glúteos bilateral', series: 3, repeticiones: 15, notas: 'Activación correcta' }
    ],
    notas: 'Mejora en la flexión activa de rodilla.'
  },
  {
    id: 'ses-842-3',
    codigoPaciente: 'PAC-842',
    fecha: '2025-03-20',
    nivelDolor: 5,
    ejercicios: [
      { nombre: 'Sentadilla con fitball en pared', series: 3, repeticiones: 10, notas: 'Ángulo máx 60°' },
      { nombre: 'Puente de glúteo unipodal', series: 3, repeticiones: 8, notas: 'Por pierna' }
    ],
    notas: 'Menor inflamación tras caminata prolongada.'
  },
  {
    id: 'ses-842-4',
    codigoPaciente: 'PAC-842',
    fecha: '2025-03-24',
    nivelDolor: 4,
    ejercicios: [
      { nombre: 'Sentadilla búlgara con apoyo', series: 3, repeticiones: 10, notas: 'Carga corporal' },
      { nombre: 'Step down excéntrico controlado', series: 3, repeticiones: 8, notas: 'Escalón de 15cm' }
    ],
    notas: 'Buena respuesta a carga excéntrica.'
  },
  {
    id: 'ses-842-5',
    codigoPaciente: 'PAC-842',
    fecha: '2025-03-27',
    nivelDolor: 3,
    ejercicios: [
      { nombre: 'Sentadilla goblet con mancuerna', series: 4, repeticiones: 10, notas: 'Mancuerna de 6kg' },
      { nombre: 'Saltos bipodales controlados', series: 3, repeticiones: 12, notas: 'Aterrizaje suave' }
    ],
    notas: 'Evolución muy favorable. Dolor leve sólo al final del esfuerzo máximo.'
  }
];

class FisioDB {
  constructor() {
    this.init();
  }

  init() {
    // Si no existen pacientes en el almacenamiento, inicializamos con los datos demo
    if (!localStorage.getItem(DB_KEYS.PATIENTS)) {
      this.savePatients(SEED_PATIENTS);
    }
    if (!localStorage.getItem(DB_KEYS.SESSIONS)) {
      this.saveSessions(SEED_SESSIONS);
    }
  }

  // --- PACIENTES ---
  getPatients() {
    try {
      const data = localStorage.getItem(DB_KEYS.PATIENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error al leer pacientes:', e);
      return [];
    }
  }

  savePatients(patients) {
    localStorage.setItem(DB_KEYS.PATIENTS, JSON.stringify(patients));
    this.dispatchChangeEvent('patients');
  }

  getPatient(codigo) {
    const list = this.getPatients();
    return list.find(p => p.codigo.trim().toUpperCase() === codigo.trim().toUpperCase()) || null;
  }

  addPatient(patientData) {
    const list = this.getPatients();
    const codigoNormalizado = patientData.codigo.trim().toUpperCase();

    // Validar que no exista
    const existing = list.find(p => p.codigo.trim().toUpperCase() === codigoNormalizado);
    if (existing) {
      throw new Error(`Ya existe un paciente con el código ${codigoNormalizado}`);
    }

    const newPatient = {
      codigo: codigoNormalizado,
      diagnostico: patientData.diagnostico?.trim() || 'Sin diagnóstico especificado',
      zona: patientData.zona?.trim() || 'Zona general',
      fase: patientData.fase?.trim() || 'Evaluación inicial',
      fechaInicio: patientData.fechaInicio || new Date().toISOString().split('T')[0],
      ultimoDolor: typeof patientData.ultimoDolor === 'number' ? patientData.ultimoDolor : 5,
      estado: 'activo',
      totalSesiones: 0,
      ultimaSesionFecha: 'Recién registrado'
    };

    list.unshift(newPatient); // Agregar al principio
    this.savePatients(list);
    return newPatient;
  }

  deletePatient(codigo) {
    let list = this.getPatients();
    list = list.filter(p => p.codigo.trim().toUpperCase() !== codigo.trim().toUpperCase());
    this.savePatients(list);

    // Eliminar también sus sesiones
    let sessions = this.getAllSessions();
    sessions = sessions.filter(s => s.codigoPaciente.trim().toUpperCase() !== codigo.trim().toUpperCase());
    this.saveSessions(sessions);
  }

  // Generador de código anónimo aleatorio (ej: PAC-482)
  generateUniqueCode() {
    const list = this.getPatients();
    let code = '';
    let exists = true;
    while (exists) {
      const randNum = Math.floor(100 + Math.random() * 900); // número de 3 dígitos
      code = `PAC-${randNum}`;
      exists = list.some(p => p.codigo.toUpperCase() === code);
    }
    return code;
  }

  // --- SESIONES ---
  getAllSessions() {
    try {
      const data = localStorage.getItem(DB_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error al leer sesiones:', e);
      return [];
    }
  }

  saveSessions(sessions) {
    localStorage.setItem(DB_KEYS.SESSIONS, JSON.stringify(sessions));
    this.dispatchChangeEvent('sessions');
  }

  getSessionsByPatient(codigo) {
    const all = this.getAllSessions();
    const codigoNormalizado = codigo.trim().toUpperCase();
    return all
      .filter(s => s.codigoPaciente.trim().toUpperCase() === codigoNormalizado)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // Orden cronológico
  }

  addSession(sessionData) {
    const all = this.getAllSessions();
    const newSession = {
      id: 'ses-' + Date.now(),
      codigoPaciente: sessionData.codigoPaciente.trim().toUpperCase(),
      fecha: sessionData.fecha || new Date().toISOString().split('T')[0],
      nivelDolor: parseInt(sessionData.nivelDolor, 10),
      ejercicios: sessionData.ejercicios || [],
      notas: sessionData.notas || ''
    };

    all.push(newSession);
    this.saveSessions(all);

    // Actualizar datos del paciente
    const patients = this.getPatients();
    const patientIndex = patients.findIndex(p => p.codigo.toUpperCase() === newSession.codigoPaciente);
    if (patientIndex !== -1) {
      patients[patientIndex].totalSesiones = (patients[patientIndex].totalSesiones || 0) + 1;
      patients[patientIndex].ultimoDolor = newSession.nivelDolor;
      patients[patientIndex].ultimaSesionFecha = 'Hoy';
      this.savePatients(patients);
    }

    return newSession;
  }

  // Notificador de cambios reactivo
  dispatchChangeEvent(entity) {
    window.dispatchEvent(new CustomEvent('fisioconecta:data-change', { detail: { entity } }));
  }
}

// Instancia global disponible en toda la aplicación
window.db = new FisioDB();
