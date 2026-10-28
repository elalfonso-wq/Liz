/**
 * FisioConecta - Capa de Base de Datos y Almacenamiento en la Nube
 * Conectado en tiempo real con Google Firebase Firestore
 * Incluye respaldo local automático (localStorage) para funcionamiento offline.
 */

// Configuración oficial de Firebase del proyecto FisioConecta
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC3sajbyEs9aVMeb6xmEtNle-ADHvvg-GA",
  authDomain: "fisioconecta-e8650.firebaseapp.com",
  projectId: "fisioconecta-e8650",
  storageBucket: "fisioconecta-e8650.firebasestorage.app",
  messagingSenderId: "771323750850",
  appId: "1:771323750850:web:b6f32669f8b1448a420e5b"
};

const DB_KEYS = {
  PATIENTS: 'fisioconecta_patients_v1',
  SESSIONS: 'fisioconecta_sessions_v1'
};

// Datos clínicos de base para inicializar la nube si está vacía
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
    ultimaSesionFecha: '27 Mar, 2025'
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
    ultimaSesionFecha: '26 Mar, 2025'
  },
  {
    codigo: 'PAC-603',
    diagnostico: 'Esguince de tobillo grado II',
    zona: 'Tobillo izquierdo • Ligamento LPAA',
    fechaInicio: '2025-02-18',
    fase: 'Fase final: Propiocepción y readaptación',
    ultimoDolor: 1,
    estado: 'activo',
    totalSesiones: 4,
    ultimaSesionFecha: '24 Mar, 2025'
  }
];

const SEED_SESSIONS = [
  {
    id: 'ses-842-1',
    codigoPaciente: 'PAC-842',
    fecha: '2025-03-12',
    hora: '09:00 AM',
    duracionMin: 45,
    nivelDolor: 7,
    ejercicios: [
      { nombre: 'Isometría de cuádriceps en pared', series: 3, repeticiones: '30 seg', notas: 'Tolerancia media' },
      { nombre: 'Elevación de pierna recta', series: 3, repeticiones: '12 reps', notas: 'Sin dolor agudo' },
      { nombre: 'Movilización pasiva patelar', series: 2, repeticiones: '20 reps', notas: 'Disminuir adherencias' }
    ],
    notas: 'Primera sesión. Dolor agudo al bajar escaleras y al palpar polo inferior de la rótula.'
  },
  {
    id: 'ses-842-2',
    codigoPaciente: 'PAC-842',
    fecha: '2025-03-16',
    hora: '10:30 AM',
    duracionMin: 45,
    nivelDolor: 6,
    ejercicios: [
      { nombre: 'Isometría de cuádriceps en pared', series: 4, repeticiones: '35 seg', notas: 'Mayor estabilidad' },
      { nombre: 'Puente de glúteos bilateral', series: 3, repeticiones: '15 reps', notas: 'Activación correcta de cadena posterior' }
    ],
    notas: 'Mejora en la flexión activa de rodilla sin crepitación dolorosa.'
  },
  {
    id: 'ses-842-3',
    codigoPaciente: 'PAC-842',
    fecha: '2025-03-20',
    hora: '11:00 AM',
    duracionMin: 50,
    nivelDolor: 5,
    ejercicios: [
      { nombre: 'Sentadilla con fitball en pared', series: 3, repeticiones: '10 reps', notas: 'Ángulo máximo a 60°' },
      { nombre: 'Puente de glúteo unipodal', series: 3, repeticiones: '8 reps', notas: 'Por pierna' }
    ],
    notas: 'Menor inflamación tras caminata prolongada. Tolera mejor la carga axial.'
  },
  {
    id: 'ses-842-4',
    codigoPaciente: 'PAC-842',
    fecha: '2025-03-24',
    hora: '09:30 AM',
    duracionMin: 45,
    nivelDolor: 4,
    ejercicios: [
      { nombre: 'Sentadilla búlgara con apoyo', series: 3, repeticiones: '10 reps', notas: 'Carga corporal controlada' },
      { nombre: 'Step down excéntrico', series: 3, repeticiones: '8 reps', notas: 'Escalón de 15cm' }
    ],
    notas: 'Buena respuesta a carga excéntrica. Se inicia trabajo en escalón.'
  },
  {
    id: 'ses-842-5',
    codigoPaciente: 'PAC-842',
    fecha: '2025-03-27',
    hora: '10:30 AM',
    duracionMin: 45,
    nivelDolor: 3,
    ejercicios: [
      { nombre: 'Sentadilla isométrica en pared', series: 3, repeticiones: '45 seg', notas: 'Criterio técnico: Mantener 90 grados y rodilla alineada con 2do metatarsiano' },
      { nombre: 'Goblet squat con mancuerna', series: 3, repeticiones: '10 reps', notas: 'Mancuerna de 6kg con ritmo 3-1-1' },
      { nombre: 'Saltos bipodales controlados', series: 3, repeticiones: '12 reps', notas: 'Aterrizaje suave amortiguado' }
    ],
    notas: 'Evolución muy favorable. Dolor leve sólo al final del esfuerzo máximo. Puede caminar 45 min sin molestias.'
  },
  {
    id: 'ses-719-1',
    codigoPaciente: 'PAC-719',
    fecha: '2025-03-05',
    hora: '08:00 AM',
    duracionMin: 40,
    nivelDolor: 8,
    ejercicios: [
      { nombre: 'Respiración diafragmática y activación transversa', series: 3, repeticiones: '10 reps', notas: 'En decúbito supino' },
      { nombre: 'Báscula pélvica suave', series: 3, repeticiones: '12 reps', notas: 'Sin forzar rango' }
    ],
    notas: 'Dolor agudo en zona lumbar que irradia levemente a glúteo.'
  },
  {
    id: 'ses-719-2',
    codigoPaciente: 'PAC-719',
    fecha: '2025-03-15',
    hora: '08:30 AM',
    duracionMin: 45,
    nivelDolor: 7,
    ejercicios: [
      { nombre: 'Bird-dog (perro de caza) alterno', series: 3, repeticiones: '8 reps', notas: 'Por lado' },
      { nombre: 'Puente de glúteos con rodillo', series: 3, repeticiones: '12 reps', notas: 'Sostener 3 seg' }
    ],
    notas: 'Disminuye la rigidez matutina.'
  },
  {
    id: 'ses-719-3',
    codigoPaciente: 'PAC-719',
    fecha: '2025-03-26',
    hora: '09:00 AM',
    duracionMin: 45,
    nivelDolor: 6,
    ejercicios: [
      { nombre: 'Plancha lateral corta de rodillas', series: 3, repeticiones: '20 seg', notas: 'Activación de oblicuos' },
      { nombre: 'Prensa pallof con banda elástica', series: 3, repeticiones: '10 reps', notas: 'Antirrotación' }
    ],
    notas: 'Mejora en tolerancia al permanecer sentado en jornada laboral.'
  },
  {
    id: 'ses-603-1',
    codigoPaciente: 'PAC-603',
    fecha: '2025-02-18',
    hora: '04:00 PM',
    duracionMin: 40,
    nivelDolor: 7,
    ejercicios: [
      { nombre: 'Bombeo de tobillo en flexo-extensión', series: 4, repeticiones: '20 reps', notas: 'Drenaje linfático' },
      { nombre: 'Alfabeto con el pie en el aire', series: 2, repeticiones: '1 vuelta', notas: 'Movilidad articular' }
    ],
    notas: 'Edema moderado en maléolo externo.'
  },
  {
    id: 'ses-603-2',
    codigoPaciente: 'PAC-603',
    fecha: '2025-03-01',
    hora: '04:30 PM',
    duracionMin: 45,
    nivelDolor: 4,
    ejercicios: [
      { nombre: 'Eversión con banda elástica', series: 3, repeticiones: '15 reps', notas: 'Fortalecimiento de peroneos' },
      { nombre: 'Equilibrio unipodal en suelo plano', series: 3, repeticiones: '30 seg', notas: 'Ojos abiertos' }
    ],
    notas: 'Edema reducido significativamente. Buena estabilidad.'
  },
  {
    id: 'ses-603-3',
    codigoPaciente: 'PAC-603',
    fecha: '2025-03-12',
    hora: '05:00 PM',
    duracionMin: 45,
    nivelDolor: 2,
    ejercicios: [
      { nombre: 'Equilibrio sobre plato de Freeman / Bosu', series: 3, repeticiones: '40 seg', notas: 'Propiocepción dinámica' },
      { nombre: 'Elevación de talones excéntrica', series: 3, repeticiones: '12 reps', notas: 'En escalón' }
    ],
    notas: 'Retoma trote suave sin molestias.'
  },
  {
    id: 'ses-603-4',
    codigoPaciente: 'PAC-603',
    fecha: '2025-03-24',
    hora: '04:00 PM',
    duracionMin: 45,
    nivelDolor: 1,
    ejercicios: [
      { nombre: 'Saltos en estrella unipodales', series: 3, repeticiones: '10 reps', notas: 'Readaptación deportiva' },
      { nombre: 'Cambios de dirección en zigzag', series: 4, repeticiones: '1 serie', notas: 'Velocidad progresiva' }
    ],
    notas: 'Fase final de alta médica. Fuerza y propiocepción simétricas respecto al tobillo sano.'
  }
];

class FisioDB {
  constructor() {
    this.firestore = null;
    this.isCloudEnabled = false;
    this.init();
  }

  init() {
    // 1. Respaldo local inmediato para render instantáneo
    if (!localStorage.getItem(DB_KEYS.PATIENTS)) {
      localStorage.setItem(DB_KEYS.PATIENTS, JSON.stringify(SEED_PATIENTS));
    }
    if (!localStorage.getItem(DB_KEYS.SESSIONS)) {
      localStorage.setItem(DB_KEYS.SESSIONS, JSON.stringify(SEED_SESSIONS));
    }

    // 2. Conectar con Firebase Firestore si el SDK está cargado
    if (typeof firebase !== 'undefined' && FIREBASE_CONFIG.apiKey) {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(FIREBASE_CONFIG);
        }
        this.firestore = firebase.firestore();
        this.isCloudEnabled = true;
        console.log('✅ Firebase Firestore conectado exitosamente.');

        // Activar sincronización en la nube y tiempo real
        this.syncWithCloud();
      } catch (err) {
        console.warn('⚠️ Error al inicializar Firebase, operando en modo local:', err);
        this.isCloudEnabled = false;
      }
    }
  }

  /**
   * Sincronización bidireccional con Firestore en la nube
   */
  async syncWithCloud() {
    if (!this.isCloudEnabled || !this.firestore) return;

    try {
      // 1. Verificar si existen pacientes en Firestore
      const patientsSnapshot = await this.firestore.collection('pacientes').get();
      if (patientsSnapshot.empty) {
        console.log('Inicializando datos en Firebase Firestore...');
        // Subir pacientes demo a la nube
        const batch = this.firestore.batch();
        SEED_PATIENTS.forEach(p => {
          const docRef = this.firestore.collection('pacientes').doc(p.codigo);
          batch.set(docRef, p);
        });
        SEED_SESSIONS.forEach(s => {
          const docRef = this.firestore.collection('sesiones').doc(s.id);
          batch.set(docRef, s);
        });
        await batch.commit();
        console.log('✅ Datos iniciales guardados en Firebase Firestore.');
      }

      // 2. Escuchar cambios en tiempo real en la colección 'pacientes'
      this.firestore.collection('pacientes').onSnapshot((snapshot) => {
        const cloudPatients = [];
        snapshot.forEach(doc => cloudPatients.push(doc.data()));
        if (cloudPatients.length > 0) {
          localStorage.setItem(DB_KEYS.PATIENTS, JSON.stringify(cloudPatients));
          this.dispatchChangeEvent('patients');
        }
      }, (error) => {
        console.warn('Lectura Firestore pacientes:', error);
      });

      // 3. Escuchar cambios en tiempo real en la colección 'sesiones'
      this.firestore.collection('sesiones').onSnapshot((snapshot) => {
        const cloudSessions = [];
        snapshot.forEach(doc => cloudSessions.push(doc.data()));
        if (cloudSessions.length > 0) {
          localStorage.setItem(DB_KEYS.SESSIONS, JSON.stringify(cloudSessions));
          this.dispatchChangeEvent('sessions');
        }
      }, (error) => {
        console.warn('Lectura Firestore sesiones:', error);
      });

    } catch (err) {
      console.warn('Error en syncWithCloud:', err);
    }
  }

  // ================= PACIENTES =================
  getPatients() {
    try {
      const data = localStorage.getItem(DB_KEYS.PATIENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  savePatientsLocal(patients) {
    localStorage.setItem(DB_KEYS.PATIENTS, JSON.stringify(patients));
    this.dispatchChangeEvent('patients');
  }

  getPatient(codigo) {
    if (!codigo) return null;
    const list = this.getPatients();
    return list.find(p => p.codigo.trim().toUpperCase() === codigo.trim().toUpperCase()) || null;
  }

  addPatient(patientData) {
    const list = this.getPatients();
    const codigoNormalizado = patientData.codigo.trim().toUpperCase();

    const existing = list.find(p => p.codigo.trim().toUpperCase() === codigoNormalizado);
    if (existing) {
      throw new Error(`Ya existe un paciente con el código ${codigoNormalizado}`);
    }

    const newPatient = {
      codigo: codigoNormalizado,
      diagnostico: patientData.diagnostico?.trim() || 'Sin diagnóstico especificado',
      zona: patientData.zona?.trim() || 'Zona no especificada',
      fase: patientData.fase?.trim() || 'Evaluación inicial',
      fechaInicio: patientData.fechaInicio || new Date().toISOString().split('T')[0],
      ultimoDolor: typeof patientData.ultimoDolor === 'number' ? patientData.ultimoDolor : 5,
      estado: 'activo',
      totalSesiones: 0,
      ultimaSesionFecha: 'Recién registrado'
    };

    // Guardar en local de inmediato
    list.unshift(newPatient);
    this.savePatientsLocal(list);

    // Guardar en Firebase Firestore
    if (this.isCloudEnabled && this.firestore) {
      this.firestore.collection('pacientes').doc(newPatient.codigo).set(newPatient)
        .catch(err => console.error('Error guardando paciente en Firestore:', err));
    }

    return newPatient;
  }

  deletePatient(codigo) {
    if (!codigo) return;
    const cod = codigo.trim().toUpperCase();

    // Local
    let list = this.getPatients();
    list = list.filter(p => p.codigo.trim().toUpperCase() !== cod);
    this.savePatientsLocal(list);

    let sessions = this.getAllSessions();
    sessions = sessions.filter(s => s.codigoPaciente.trim().toUpperCase() !== cod);
    this.saveSessionsLocal(sessions);

    // En Firestore
    if (this.isCloudEnabled && this.firestore) {
      this.firestore.collection('pacientes').doc(cod).delete()
        .catch(err => console.error('Error borrando paciente en Firestore:', err));

      // Borrar sesiones asociadas en la nube
      this.firestore.collection('sesiones').where('codigoPaciente', '==', cod).get()
        .then(snapshot => {
          const batch = this.firestore.batch();
          snapshot.forEach(doc => batch.delete(doc.ref));
          return batch.commit();
        })
        .catch(err => console.error('Error borrando sesiones asociadas en Firestore:', err));
    }
  }

  generateUniqueCode() {
    const list = this.getPatients();
    let code = '';
    let exists = true;
    while (exists) {
      const randNum = Math.floor(100 + Math.random() * 900);
      code = `PAC-${randNum}`;
      exists = list.some(p => p.codigo.toUpperCase() === code);
    }
    return code;
  }

  // ================= SESIONES =================
  getAllSessions() {
    try {
      const data = localStorage.getItem(DB_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveSessionsLocal(sessions) {
    localStorage.setItem(DB_KEYS.SESSIONS, JSON.stringify(sessions));
    this.dispatchChangeEvent('sessions');
  }

  getSessionsByPatient(codigo) {
    if (!codigo) return [];
    const all = this.getAllSessions();
    const cod = codigo.trim().toUpperCase();
    return all
      .filter(s => s.codigoPaciente.trim().toUpperCase() === cod)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }

  addSession(sessionData) {
    const all = this.getAllSessions();
    const codigoPaciente = sessionData.codigoPaciente.trim().toUpperCase();

    const newSession = {
      id: 'ses-' + Date.now(),
      codigoPaciente,
      fecha: sessionData.fecha || new Date().toISOString().split('T')[0],
      hora: sessionData.hora || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duracionMin: sessionData.duracionMin || 45,
      nivelDolor: parseInt(sessionData.nivelDolor, 10),
      ejercicios: sessionData.ejercicios || [],
      notas: sessionData.notas?.trim() || ''
    };

    all.push(newSession);
    this.saveSessionsLocal(all);

    // Actualizar ficha del paciente localmente
    const patients = this.getPatients();
    const patientIndex = patients.findIndex(p => p.codigo.toUpperCase() === codigoPaciente);
    let updatedPatientData = null;

    if (patientIndex !== -1) {
      const patientSessions = all.filter(s => s.codigoPaciente.toUpperCase() === codigoPaciente);
      patients[patientIndex].totalSesiones = patientSessions.length;
      patients[patientIndex].ultimoDolor = newSession.nivelDolor;
      
      const dateObj = new Date(newSession.fecha + 'T12:00:00');
      const formattedDate = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
      patients[patientIndex].ultimaSesionFecha = formattedDate;

      updatedPatientData = {
        totalSesiones: patientSessions.length,
        ultimoDolor: newSession.nivelDolor,
        ultimaSesionFecha: formattedDate
      };

      this.savePatientsLocal(patients);
    }

    // Guardar en Firestore
    if (this.isCloudEnabled && this.firestore) {
      this.firestore.collection('sesiones').doc(newSession.id).set(newSession)
        .catch(err => console.error('Error guardando sesión en Firestore:', err));

      if (updatedPatientData) {
        this.firestore.collection('pacientes').doc(codigoPaciente).update(updatedPatientData)
          .catch(err => console.error('Error actualizando paciente en Firestore:', err));
      }
    }

    return newSession;
  }

  // ================= ESTADÍSTICAS CLÍNICAS =================
  getPatientEvolutionStats(codigo) {
    const sessions = this.getSessionsByPatient(codigo);
    if (sessions.length === 0) {
      return {
        total: 0,
        dolorInicial: null,
        dolorActual: null,
        diferencia: 0,
        porcentajeMejora: 0,
        estado: 'Sin sesiones'
      };
    }

    const dolorInicial = sessions[0].nivelDolor;
    const dolorActual = sessions[sessions.length - 1].nivelDolor;
    const diferencia = dolorActual - dolorInicial;
    
    let porcentajeMejora = 0;
    if (dolorInicial > 0) {
      porcentajeMejora = Math.round(((dolorInicial - dolorActual) / dolorInicial) * 100);
    }

    let estado = 'Favorable';
    if (diferencia > 0) estado = 'Incremento de dolor';
    else if (diferencia === 0) estado = 'Estable';

    return {
      total: sessions.length,
      dolorInicial,
      dolorActual,
      diferencia,
      porcentajeMejora,
      estado,
      primeraSesionFecha: sessions[0].fecha,
      ultimaSesionFecha: sessions[sessions.length - 1].fecha
    };
  }

  isFirebaseConnected() {
    return this.isCloudEnabled;
  }

  dispatchChangeEvent(entity) {
    window.dispatchEvent(new CustomEvent('fisioconecta:data-change', { detail: { entity } }));
  }
}

// Instancia global
window.db = new FisioDB();
