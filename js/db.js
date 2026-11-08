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
  SESSIONS: 'fisioconecta_sessions_v1',
  AI_QUERIES: 'fisioconecta_ai_queries_v1',
  APPOINTMENTS: 'fisioconecta_appointments_v1',
  THERAPY_PLANS: 'fisioconecta_plans_v1',
  GEMINI_KEY: 'fisioconecta_gemini_api_key'
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

// Consulta de ejemplo clínica de IA inicial
const SEED_AI_QUERIES = [
  {
    id: 'ai-init-842',
    codigoPaciente: 'PAC-842',
    pregunta: 'Progresión de Carga: ¿Qué ejercicios excéntricos se recomiendan para tendinopatía rotuliana con dolor EVA 3/10?',
    respuesta: 'Para tendinopatía rotuliana en fase de readaptación funcional (EVA 3/10):\n\n1. **Sentadilla declinada en cuña (25°)**: 3 series de 10-12 repeticiones, controlando la bajada en 3 segundos.\n2. **Isometría analgésica de pre-activación**: Sostén en pared a 60° de flexión durante 45 segundos antes de las series activas.\n3. **Criterios de seguridad**: Mantener el dolor por debajo de 4/10 y verificar que ceda dentro de las 24 horas posteriores.',
    promptGenerado: 'Actúa como especialista en Fisioterapia. Paciente anónimo PAC-842 con Tendinopatía rotuliana...',
    fecha: '27 Mar, 2025, 11:30 AM',
    timestamp: 1743089400000
  }
];

// Citas clínicas programadas iniciales
const SEED_APPOINTMENTS = [
  {
    id: 'apt-842-1',
    codigoPaciente: 'PAC-842',
    fecha: '2025-03-31',
    hora: '10:00 AM',
    tipo: 'Sesión de Rehabilitación',
    modalidad: 'Presencial',
    estado: 'programada',
    motivo: 'Progresión excéntrica de sentadilla y evaluación de dolor residual.',
    notas: 'Paciente tolera sentadilla isométrica. Iniciar escalón 15 cm.'
  },
  {
    id: 'apt-719-1',
    codigoPaciente: 'PAC-719',
    fecha: '2025-04-02',
    hora: '09:00 AM',
    tipo: 'Reevaluación de Control',
    modalidad: 'Presencial',
    estado: 'programada',
    motivo: 'Control de dolor lumbar matutino y test de estabilidad lumbopélvica.',
    notas: 'Revisar cumplimiento de ejercicios de core en casa.'
  },
  {
    id: 'apt-603-1',
    codigoPaciente: 'PAC-603',
    fecha: '2025-04-04',
    hora: '04:00 PM',
    tipo: 'Test Funcional / Criterio de Alta',
    modalidad: 'Presencial',
    estado: 'programada',
    motivo: 'Test de salto unipodal y dinamometría para alta definitiva.',
    notas: 'Traer calzado deportivo habitual.'
  }
];

// Planes terapéuticos y diagnóstico fisioterapéutico funcional (CIF)
const SEED_THERAPY_PLANS = [
  {
    id: 'plan-PAC-842',
    codigoPaciente: 'PAC-842',
    diagnosticoMedico: 'Tendinopatía rotuliana rodilla derecha (Jumper\'s knee)',
    diagnosticoFuncional: 'Deficiencia en la tolerancia de carga del tendón rotuliano con dolor a la flexión profunda (>80°) e inhibición refleja del cuádriceps. Limitación moderada para saltos y bajar escaleras.',
    cifEstructura: 'Tendón rotuliano derecho con engrosamiento proximal doloroso a la palpación.',
    cifActividad: 'Dificultad moderada para bajar escaleras y cambios de dirección.',
    cifParticipacion: 'Restricción para práctica deportiva (baloncesto recreativo).',
    fase: 'Fase 3: Fortalecimiento y Carga Excéntrica',
    frecuenciaSemanal: '3 sesiones por semana',
    objetivosCortoPlazo: '1. Reducir dolor matutino a EVA ≤ 2/10.\n2. Tolera sentadilla declinada 25° con 15 reps sin dolor reactivo a 24 horas.',
    objetivosLargoPlazo: '1. Retorno al trote continuo y pliometría controlada.\n2. Alta funcional con simetría de fuerza >90% en salto monopodal.',
    pruebasOrtopedicas: [
      { test: 'Palpación polo inferior rótula', resultado: 'Positivo leve (EVA 2/10)' },
      { test: 'Sentadilla declinada monopodal 25°', resultado: 'Positivo a 60° flexión' },
      { test: 'Prueba de aprensión patelar', resultado: 'Negativo' }
    ],
    enfoqueTerapeutico: 'Isometría de alta carga (analgesia) + Progresión excéntrica lenta (Heavy Slow Resistance) + Fortalecimiento de cadera y tobillo.',
    criterioClinico: 'El tendón responde favorablemente a la carga axial progresiva sin dolor inflamatorio reactivo. Regla clínica: el dolor durante el ejercicio no debe superar EVA 4/10 y debe retornar al estado basal dentro de las 24 horas siguientes.',
    banderasRojas: 'Descartadas (sin derrame articular masivo, sin bloqueo mecánico ni antecedentes traumáticos de avulsión).',
    banderasAmarillas: 'Leve aprensión al descender escaleras. Requiere refuerzo en educación en neurociencia del dolor.',
    fechaCreacion: '2025-03-12',
    fechaReevaluacion: '2025-04-15'
  },
  {
    id: 'plan-PAC-719',
    codigoPaciente: 'PAC-719',
    diagnosticoMedico: 'Lumbalgia mecánica inespecífica / Síndrome facetario lumbar',
    diagnosticoFuncional: 'Disfunción del control motor lumbopélvico con hipertonía reactiva de paravertebrales y déficit de resistencia del transverso abdominal y glúteo medio. Limitación para sedestación prolongada.',
    cifEstructura: 'Segmento L4-S1 con rigidez articular y sensibilización miofascial.',
    cifActividad: 'Intolerancia a bipedestación estática prolongada y flexión anterior de tronco.',
    cifParticipacion: 'Dificultad en jornada laboral de oficina frente a computador.',
    fase: 'Fase 2: Control Motor y Movilidad Lumbar',
    frecuenciaSemanal: '2 sesiones por semana',
    objetivosCortoPlazo: '1. Disminuir EVA de 6/10 a ≤ 4/10 en posición sedente.\n2. Activar transverso abdominal sin compensación de recto anterior.',
    objetivosLargoPlazo: '1. Tolerar 2 horas de trabajo continuo sin dolor.\n2. Levantar cargas de 10 kg con técnica adecuada de bisagra de cadera.',
    pruebasOrtopedicas: [
      { test: 'Lasègue (SLR)', resultado: 'Negativo bilateral (sin radiculopatía)' },
      { test: 'Test de extensión lumbar en bipedestación', resultado: 'Positivo (dolor localizado L5)' },
      { test: 'Test de inestabilidad en prono', resultado: 'Positivo (alivia con activación muscular activa)' }
    ],
    enfoqueTerapeutico: 'Reeducación de control motor (Big 3 de McGill) + Terapia manual suave + Pautas ergonómicas de pausas activas.',
    criterioClinico: 'Mecanismo de dolor predominantemente nociceptivo con componente postural y desacondicionamiento de estabilizadores profundos. Pronóstico muy favorable con ejercicio activo dosificado.',
    banderasRojas: 'Descartadas (sin pérdida de sensibilidad en silla de montar, fuerza distal conservada L4-S1, reflejos simétricos).',
    banderasAmarillas: 'Creencia de que flexionar la columna es peligroso. Trabajo de desensibilización y movimiento seguro gradual.',
    fechaCreacion: '2025-03-05',
    fechaReevaluacion: '2025-04-10'
  }
];

class FisioDB {
  constructor() {
    this.firestore = null;
    this.isCloudEnabled = false;
    this.init();
  }

  init() {
    this.cloudStatus = { state: 'local', message: 'Modo local offline' };

    // 1. Respaldo local inmediato para render instantáneo
    if (!localStorage.getItem(DB_KEYS.PATIENTS)) {
      localStorage.setItem(DB_KEYS.PATIENTS, JSON.stringify(SEED_PATIENTS));
    }
    if (!localStorage.getItem(DB_KEYS.SESSIONS)) {
      localStorage.setItem(DB_KEYS.SESSIONS, JSON.stringify(SEED_SESSIONS));
    }
    const savedQueries = localStorage.getItem(DB_KEYS.AI_QUERIES);
    if (!savedQueries || JSON.parse(savedQueries).length === 0) {
      localStorage.setItem(DB_KEYS.AI_QUERIES, JSON.stringify(SEED_AI_QUERIES));
    }
    const savedAppointments = localStorage.getItem(DB_KEYS.APPOINTMENTS);
    if (!savedAppointments || JSON.parse(savedAppointments).length === 0) {
      localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(SEED_APPOINTMENTS));
    }
    const savedPlans = localStorage.getItem(DB_KEYS.THERAPY_PLANS);
    if (!savedPlans || JSON.parse(savedPlans).length === 0) {
      localStorage.setItem(DB_KEYS.THERAPY_PLANS, JSON.stringify(SEED_THERAPY_PLANS));
    }

    // 2. Conectar con Firebase Firestore si el SDK está cargado
    if (typeof firebase !== 'undefined' && FIREBASE_CONFIG.apiKey) {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(FIREBASE_CONFIG);
        }
        this.firestore = firebase.firestore();
        this.isCloudEnabled = true;
        this.cloudStatus = { state: 'connecting', message: 'Conectando con Firestore...' };
        this.dispatchChangeEvent('cloud-status');
        console.log('✅ Firebase SDK inicializado.');

        // Activar sincronización en la nube y tiempo real
        this.syncWithCloud();
      } catch (err) {
        console.warn('⚠️ Error al inicializar Firebase, operando en modo local:', err);
        this.isCloudEnabled = false;
        this.cloudStatus = { state: 'error', message: err.message };
        this.dispatchChangeEvent('cloud-status');
      }
    }
  }

  /**
   * Sincronización bidireccional con Firestore en la nube
   */
  async syncWithCloud(force = false) {
    if (!this.isCloudEnabled || !this.firestore) {
      this.cloudStatus = { state: 'local', message: 'Firebase no inicializado' };
      this.dispatchChangeEvent('cloud-status');
      return { success: false, message: 'Firebase no está inicializado' };
    }

    this.cloudStatus = { state: 'syncing', message: 'Sincronizando con Firestore...' };
    this.dispatchChangeEvent('cloud-status');

    try {
      // 1. Verificar si existen pacientes en Firestore
      const patientsSnapshot = await this.firestore.collection('pacientes').get();
      
      if (patientsSnapshot.empty || force) {
        console.log('Subiendo datos locales a Firebase Firestore...');
        const batch = this.firestore.batch();
        
        const currentPatients = this.getPatients();
        currentPatients.forEach(p => {
          const docRef = this.firestore.collection('pacientes').doc(p.codigo);
          batch.set(docRef, p);
        });

        const currentSessions = this.getAllSessions();
        currentSessions.forEach(s => {
          const docRef = this.firestore.collection('sesiones').doc(s.id);
          batch.set(docRef, s);
        });

        const currentQueries = this.getAIQueries();
        currentQueries.forEach(q => {
          const docRef = this.firestore.collection('consultas_ia').doc(q.id);
          batch.set(docRef, q);
        });

        const currentApts = this.getAppointments();
        currentApts.forEach(a => {
          const docRef = this.firestore.collection('citas').doc(a.id);
          batch.set(docRef, a);
        });

        const currentPlans = this.getAllTherapyPlans();
        currentPlans.forEach(pl => {
          const docRef = this.firestore.collection('planes_terapia').doc(pl.id || ('plan-' + pl.codigoPaciente));
          batch.set(docRef, pl);
        });

        await batch.commit();
        console.log('✅ ¡Datos sincronizados con éxito en Firebase Firestore!');
      }

      // 1.1 Si consultas_ia está vacía en Firestore, crearla con las consultas iniciales
      try {
        const queriesSnapshot = await this.firestore.collection('consultas_ia').get();
        if (queriesSnapshot.empty) {
          const currentQueries = this.getAIQueries();
          if (currentQueries.length > 0) {
            const batchQueries = this.firestore.batch();
            currentQueries.forEach(q => {
              const docRef = this.firestore.collection('consultas_ia').doc(q.id);
              batchQueries.set(docRef, q);
            });
            await batchQueries.commit();
            console.log('✅ Colección consultas_ia inicializada en Firestore');
          }
        }
      } catch (errQ) {
        console.warn('Nota sobre consultas_ia en Firestore:', errQ);
      }

      // 1.2 Si citas está vacía en Firestore, inicializarla
      try {
        const aptsSnapshot = await this.firestore.collection('citas').get();
        if (aptsSnapshot.empty) {
          const currentApts = this.getAppointments();
          if (currentApts.length > 0) {
            const batchApts = this.firestore.batch();
            currentApts.forEach(a => {
              const docRef = this.firestore.collection('citas').doc(a.id);
              batchApts.set(docRef, a);
            });
            await batchApts.commit();
            console.log('✅ Colección citas inicializada en Firestore');
          }
        }
      } catch (errA) {
        console.warn('Nota sobre citas en Firestore:', errA);
      }

      // 1.3 Si planes_terapia está vacía en Firestore, inicializarla
      try {
        const plansSnapshot = await this.firestore.collection('planes_terapia').get();
        if (plansSnapshot.empty) {
          const currentPlans = this.getAllTherapyPlans();
          if (currentPlans.length > 0) {
            const batchPlans = this.firestore.batch();
            currentPlans.forEach(pl => {
              const docRef = this.firestore.collection('planes_terapia').doc(pl.id || ('plan-' + pl.codigoPaciente));
              batchPlans.set(docRef, pl);
            });
            await batchPlans.commit();
            console.log('✅ Colección planes_terapia inicializada en Firestore');
          }
        }
      } catch (errP) {
        console.warn('Nota sobre planes_terapia en Firestore:', errP);
      }

      this.cloudStatus = { state: 'connected', message: 'Firebase Conectado en Tiempo Real' };
      this.dispatchChangeEvent('cloud-status');

      // 2. Escuchar cambios en tiempo real en la colección 'pacientes'
      this.firestore.collection('pacientes').onSnapshot((snapshot) => {
        const cloudPatients = [];
        snapshot.forEach(doc => cloudPatients.push(doc.data()));
        if (cloudPatients.length > 0) {
          localStorage.setItem(DB_KEYS.PATIENTS, JSON.stringify(cloudPatients));
          this.dispatchChangeEvent('patients');
        }
      }, (error) => {
        console.warn('Error en listener de pacientes:', error);
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
        console.warn('Error en listener de sesiones:', error);
      });

      // 4. Escuchar cambios en tiempo real en 'consultas_ia'
      this.firestore.collection('consultas_ia').onSnapshot((snapshot) => {
        const cloudQueries = [];
        snapshot.forEach(doc => cloudQueries.push(doc.data()));
        if (cloudQueries.length > 0) {
          localStorage.setItem(DB_KEYS.AI_QUERIES, JSON.stringify(cloudQueries));
          this.dispatchChangeEvent('ai_queries');
        }
      }, (error) => {
        console.warn('Error en listener de consultas IA:', error);
      });

      // 5. Escuchar cambios en tiempo real en 'citas'
      this.firestore.collection('citas').onSnapshot((snapshot) => {
        const cloudApts = [];
        snapshot.forEach(doc => cloudApts.push(doc.data()));
        if (cloudApts.length > 0) {
          localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(cloudApts));
          this.dispatchChangeEvent('appointments');
        }
      }, (error) => {
        console.warn('Error en listener de citas:', error);
      });

      // 6. Escuchar cambios en tiempo real en 'planes_terapia'
      this.firestore.collection('planes_terapia').onSnapshot((snapshot) => {
        const cloudPlans = [];
        snapshot.forEach(doc => cloudPlans.push(doc.data()));
        if (cloudPlans.length > 0) {
          localStorage.setItem(DB_KEYS.THERAPY_PLANS, JSON.stringify(cloudPlans));
          this.dispatchChangeEvent('therapy_plans');
        }
      }, (error) => {
        console.warn('Error en listener de planes_terapia:', error);
      });

      return { success: true, message: '¡Sincronización exitosa con Firebase Firestore!' };

    } catch (err) {
      console.warn('⚠️ Error en syncWithCloud:', err);
      let userFriendlyMessage = err.message;
      if (err.code === 'permission-denied' || (err.message && err.message.includes('permission'))) {
        userFriendlyMessage = 'Permiso denegado por las Reglas de Seguridad de Firestore. Habilita "allow read, write: if true;" en la pestaña Reglas de Firebase.';
      }
      this.cloudStatus = { state: 'error', code: err.code || 'permission-denied', message: userFriendlyMessage };
      this.dispatchChangeEvent('cloud-status');
      return { success: false, message: userFriendlyMessage, code: err.code };
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
      tipoDolor: sessionData.tipoDolor || 'Sordo / Mecánico',
      momentoDolor: sessionData.momentoDolor || 'Durante la carga',
      criterioClinicoSesion: sessionData.criterioClinicoSesion?.trim() || '',
      toleranciaCarga: sessionData.toleranciaCarga || 'adecuada',
      banderaAlerta: sessionData.banderaAlerta || 'ninguna',
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

  // ================= ASISTENTE IA & GEMINI =================
  getGeminiApiKey() {
    return localStorage.getItem(DB_KEYS.GEMINI_KEY) || '';
  }

  saveGeminiApiKey(key) {
    if (key && key.trim()) {
      localStorage.setItem(DB_KEYS.GEMINI_KEY, key.trim());
    } else {
      localStorage.removeItem(DB_KEYS.GEMINI_KEY);
    }
    this.dispatchChangeEvent('gemini-key');
  }

  getAIQueries(codigoPaciente = null) {
    try {
      const data = localStorage.getItem(DB_KEYS.AI_QUERIES);
      const list = data ? JSON.parse(data) : [];
      if (!codigoPaciente) return list;
      const cod = codigoPaciente.trim().toUpperCase();
      return list.filter(q => q.codigoPaciente?.trim().toUpperCase() === cod);
    } catch (e) {
      return [];
    }
  }

  saveAIQuery(queryData) {
    const list = this.getAIQueries();
    const newQuery = {
      id: 'ai-' + Date.now(),
      codigoPaciente: queryData.codigoPaciente ? queryData.codigoPaciente.trim().toUpperCase() : 'GENERAL',
      pregunta: queryData.pregunta || '',
      respuesta: queryData.respuesta || '',
      promptGenerado: queryData.promptGenerado || '',
      fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };

    list.unshift(newQuery);
    localStorage.setItem(DB_KEYS.AI_QUERIES, JSON.stringify(list));
    this.dispatchChangeEvent('ai_queries');

    // Sincronizar con Firestore si está conectado
    if (this.isCloudEnabled && this.firestore) {
      this.firestore.collection('consultas_ia').doc(newQuery.id).set(newQuery)
        .catch(err => console.error('Error guardando consulta IA en Firestore:', err));
    }

    return newQuery;
  }

  // ================= CITAS / AGENDA CLÍNICA =================
  getAppointments(codigoPaciente = null) {
    try {
      const data = localStorage.getItem(DB_KEYS.APPOINTMENTS);
      let list = data ? JSON.parse(data) : [];
      if (codigoPaciente) {
        const cod = codigoPaciente.trim().toUpperCase();
        list = list.filter(a => a.codigoPaciente?.trim().toUpperCase() === cod);
      }
      return list.sort((a, b) => new Date(`${a.fecha}T${a.hora || '00:00'}`) - new Date(`${b.fecha}T${b.hora || '00:00'}`));
    } catch (e) {
      return [];
    }
  }

  saveAppointmentsLocal(apts) {
    localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(apts));
    this.dispatchChangeEvent('appointments');
  }

  addAppointment(aptData) {
    const list = this.getAppointments();
    const codigoPaciente = aptData.codigoPaciente ? aptData.codigoPaciente.trim().toUpperCase() : 'GENERAL';

    const newApt = {
      id: 'apt-' + Date.now(),
      codigoPaciente,
      fecha: aptData.fecha || new Date().toISOString().split('T')[0],
      hora: aptData.hora || '10:00 AM',
      tipo: aptData.tipo || 'Sesión de Rehabilitación',
      modalidad: aptData.modalidad || 'Presencial',
      estado: aptData.estado || 'programada',
      motivo: aptData.motivo?.trim() || 'Sesión clínica de tratamiento fisioterapéutico',
      notas: aptData.notas?.trim() || ''
    };

    list.unshift(newApt);
    this.saveAppointmentsLocal(list);

    if (this.isCloudEnabled && this.firestore) {
      this.firestore.collection('citas').doc(newApt.id).set(newApt)
        .catch(err => console.error('Error guardando cita en Firestore:', err));
    }

    return newApt;
  }

  updateAppointment(id, updates) {
    let list = this.getAppointments();
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.saveAppointmentsLocal(list);

      if (this.isCloudEnabled && this.firestore) {
        this.firestore.collection('citas').doc(id).update(updates)
          .catch(err => console.error('Error actualizando cita en Firestore:', err));
      }
      return list[idx];
    }
    return null;
  }

  deleteAppointment(id) {
    let list = this.getAppointments();
    list = list.filter(a => a.id !== id);
    this.saveAppointmentsLocal(list);

    if (this.isCloudEnabled && this.firestore) {
      this.firestore.collection('citas').doc(id).delete()
        .catch(err => console.error('Error eliminando cita en Firestore:', err));
    }
  }

  // ================= PLANES DE TERAPIA Y DIAGNÓSTICO (CIF) =================
  getAllTherapyPlans() {
    try {
      const data = localStorage.getItem(DB_KEYS.THERAPY_PLANS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getTherapyPlan(codigoPaciente) {
    if (!codigoPaciente) return null;
    const cod = codigoPaciente.trim().toUpperCase();
    const list = this.getAllTherapyPlans();
    const existing = list.find(p => p.codigoPaciente?.trim().toUpperCase() === cod);
    if (existing) return existing;

    // Plan base por defecto si aún no ha sido redactado
    const patient = this.getPatient(cod);
    return {
      id: 'plan-' + cod,
      codigoPaciente: cod,
      diagnosticoMedico: patient?.diagnostico || 'Lesión en evaluación',
      diagnosticoFuncional: 'Deficiencia en fuerza y movilidad funcional. Limitación leve a moderada en actividades de la vida diaria.',
      cifEstructura: `${patient?.zona || 'Región corporal'} con alteración biomecánica y sobrecarga tisular.`,
      cifActividad: 'Dificultad en movimientos repetitivos y soporte de peso corporal.',
      cifParticipacion: 'Restricción laboral o deportiva según nivel de dolor.',
      fase: patient?.fase || 'Fase 2: Movilidad y Carga Isométrica',
      frecuenciaSemanal: '2 a 3 sesiones por semana',
      objetivosCortoPlazo: '1. Reducir dolor EVA a ≤ 3/10 en reposo y carga leve.\n2. Recuperar arcos de movilidad sin dolor punzante.',
      objetivosLargoPlazo: '1. Retorno seguro y simétrico a actividades cotidianas y deportivas.\n2. Autonomía en pautas de automanejo domiciliario.',
      pruebasOrtopedicas: [
        { test: 'Evaluación de rangos articulares activos/pasivos', resultado: 'Limitación en arcos finales' },
        { test: 'Palpación tisular y provocación de dolor', resultado: 'Sensibilidad localizada' }
      ],
      enfoqueTerapeutico: 'Ejercicio terapéutico progresivo + Terapia manual ortopédica + Educación en neurobiología del dolor.',
      criterioClinico: 'El paciente presenta buena capacidad de respuesta biológica al estímulo de carga controlada. Se prioriza el respeto del umbral analgésico.',
      banderasRojas: 'Descartadas tras valoración inicial.',
      banderasAmarillas: 'Manejo de kinesiofobia y reaseguramiento de seguridad motora.',
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaReevaluacion: ''
    };
  }

  saveTherapyPlan(planData) {
    const list = this.getAllTherapyPlans();
    const cod = planData.codigoPaciente.trim().toUpperCase();
    const planId = planData.id || ('plan-' + cod);

    const fullPlan = {
      ...planData,
      id: planId,
      codigoPaciente: cod,
      fechaActualizacion: new Date().toISOString().split('T')[0]
    };

    const idx = list.findIndex(p => p.codigoPaciente?.trim().toUpperCase() === cod);
    if (idx !== -1) {
      list[idx] = fullPlan;
    } else {
      list.push(fullPlan);
    }

    localStorage.setItem(DB_KEYS.THERAPY_PLANS, JSON.stringify(list));
    this.dispatchChangeEvent('therapy_plans');

    if (this.isCloudEnabled && this.firestore) {
      this.firestore.collection('planes_terapia').doc(planId).set(fullPlan)
        .catch(err => console.error('Error guardando plan terapéutico en Firestore:', err));
    }

    return fullPlan;
  }

  isFirebaseConnected() {
    return this.isCloudEnabled && this.cloudStatus?.state === 'connected';
  }

  dispatchChangeEvent(entity) {
    window.dispatchEvent(new CustomEvent('fisioconecta:data-change', { detail: { entity } }));
  }
}

// Instancia global
window.db = new FisioDB();
