/**
 * FisioConecta - Módulo de Inteligencia Artificial Fisioterapéutica (Google Gemini)
 * Generador de Prompts Clínicos y Asistente Fisioterapéutico Basado en la Evidencia.
 * Garantiza respuesta inmediata: conecta con la nube de Google Gemini y cuenta con
 * motor clínico experto de contingencia para disponibilidad instantánea al 100%.
 */

class GeminiAssistant {
  constructor() {
    this.models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    this.currentModel = 'gemini-1.5-flash';
  }

  getApiKey() {
    return window.db ? window.db.getGeminiApiKey() : (localStorage.getItem('fisioconecta_gemini_api_key') || '');
  }

  setApiKey(key) {
    if (window.db) {
      window.db.saveGeminiApiKey(key);
    } else {
      if (key) localStorage.setItem('fisioconecta_gemini_api_key', key.trim());
      else localStorage.removeItem('fisioconecta_gemini_api_key');
    }
  }

  hasApiKey() {
    return Boolean(this.getApiKey());
  }

  /**
   * Prueba de conexión con la API de Gemini
   */
  async testConnection(apiKey = null) {
    const key = apiKey || this.getApiKey();
    if (!key) {
      return { success: false, message: 'No has ingresado ninguna API Key de Gemini.' };
    }

    const candidateModels = [this.currentModel, 'gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-1.5-pro'];

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const payload = {
          contents: [
            {
              parts: [{ text: "Responde únicamente con la palabra OK si la conexión está activa." }]
            }
          ]
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          this.currentModel = model;
          return { success: true, message: `¡Conexión verificada con Google Gemini (${model})!` };
        } else if (data.error && data.error.message) {
          // Si es error de credencial inválida, avisar de inmediato
          if (data.error.message.includes('API key not valid') || data.error.status === 'INVALID_ARGUMENT') {
            return { success: false, message: 'La API Key de Gemini ingresada no es válida. Verifica la clave copiada en Google AI Studio.' };
          }
        }
      } catch (err) {
        // Continuar probando siguiente modelo candidato
      }
    }

    return { success: false, message: 'No se pudo conectar con la API de Gemini. Revisa tu clave y conexión a internet.' };
  }

  /**
   * Genera 3 Prompts Clínicos específicos para el paciente analizado
   */
  generatePromptsForPatient(patient, sessions = []) {
    if (!patient) {
      return [
        {
          titulo: "Progresión de Cargas y Ejercicios",
          prompt: "¿Cuáles son las progresiones recomendadas en fisioterapia para avanzar de trabajo isométrico a concéntrico/excéntrico?",
          tipo: "progresion"
        },
        {
          titulo: "Criterios Funcionales de Alta",
          prompt: "¿Qué pruebas clínicas y test funcionales basados en evidencia se deben evaluar antes del alta definitiva?",
          tipo: "criterios_alta"
        },
        {
          titulo: "Educación y Prevención de Recaídas",
          prompt: "¿Qué pautas de automanejo y ejercicios de mantenimiento en casa son ideales para prevenir recidivas?",
          tipo: "prevencion"
        }
      ];
    }

    const diagnostico = patient.diagnostico || 'Lesión musculoesquelética';
    const zona = patient.zona || 'Región corporal en tratamiento';
    const dolorActual = typeof patient.ultimoDolor === 'number' ? patient.ultimoDolor : 5;
    const totalSesiones = sessions.length || patient.totalSesiones || 1;
    
    let ultimosEjercicios = 'Ejercicios de movilidad e isometría inicial';
    if (sessions.length > 0) {
      const lastSession = sessions[sessions.length - 1];
      if (lastSession.ejercicios && lastSession.ejercicios.length > 0) {
        ultimosEjercicios = lastSession.ejercicios.map(e => `${e.nombre} (${e.series} series x ${e.repeticiones})`).join(', ');
      }
    }

    const dolorInicial = sessions.length > 0 ? sessions[0].nivelDolor : dolorActual;

    return [
      {
        titulo: "1. Progresión Específica de Carga y Fuerza",
        prompt: `Actúa como especialista en Fisioterapia. Tengo un paciente anónimo con diagnóstico de "${diagnostico}" en ${zona}. En ${totalSesiones} sesiones su dolor EVA cambió de ${dolorInicial}/10 a ${dolorActual}/10. Actualmente tolera: ${ultimosEjercicios}. ¿Qué progresión de ejercicios con mayor demanda excéntrica o funcional recomiendas incorporar en la siguiente fase para aumentar tolerancia a la carga sin provocar inflamación reactiva?`,
        tipo: "progresion"
      },
      {
        titulo: "2. Criterios de Alta Médica y Retorno a la Actividad",
        prompt: `Para un paciente con "${diagnostico}" (${zona}) cuyo dolor actual se encuentra en ${dolorActual}/10 tras ${totalSesiones} sesiones de rehabilitación: ¿Cuáles son las pruebas ortopédicas de provocación, test funcionales (ej. hop tests, dinamometría o rangos articulares) y criterios objetivos para considerar el alta clínica y el retorno seguro a sus actividades cotidianas o deportivas?`,
        tipo: "criterios_alta"
      },
      {
        titulo: "3. Manejo de Molestias Residuales y Ejercicios en Casa",
        prompt: `Para un paciente con "${diagnostico}" en ${zona} con un nivel de dolor residual de ${dolorActual}/10: ¿Qué pautas de automanejo en casa, dosificación de pausas activas y ejercicios domiciliarios sencillos le puedo indicar para consolidar la mejoría y evitar recaídas a mediano y largo plazo?`,
        tipo: "prevencion"
      }
    ];
  }

  buildSystemInstruction() {
    return `Eres FisioIA, un asistente clínico experto en Fisioterapia, Kinesiología y Rehabilitación Física Basada en la Evidencia.
Tus respuestas deben ser claras, concisas, profesionales y directamente aplicables por el fisioterapeuta tratante:
1. Divide tu respuesta con títulos claros: Análisis Biomecánico, Dosificación de Ejercicios y Cargas, Criterios de Seguridad y Banderas Rojas.
2. Indica parámetros objetivos: series, repeticiones, tiempo bajo tensión y descansos.
3. Basa tus recomendaciones en neurociencia del dolor y adaptaciones tisulares.`;
  }

  buildFullPrompt(promptText, patientContext) {
    if (!patientContext) return promptText;
    return `[CONTEXTO CLÍNICO DEL PACIENTE]
Código anónimo: ${patientContext.codigo || 'PAC-ANON'}
Diagnóstico: ${patientContext.diagnostico || 'No especificado'}
Zona anatómica: ${patientContext.zona || 'No especificada'}
Nivel de Dolor Actual (EVA): ${patientContext.ultimoDolor || 'N/A'}/10
Total de Sesiones Realizadas: ${patientContext.totalSesiones || 0}

[CONSULTA DEL FISIOTERAPEUTA]
${promptText}`;
  }

  /**
   * Envía una consulta y devuelve la respuesta clínica estructurada de inmediato
   */
  async askGemini(promptText, patientContext = null) {
    const key = this.getApiKey();
    let answerText = null;
    let source = 'local';
    let modelUsed = 'Motor Clínico FisioIA';

    const fullPrompt = this.buildFullPrompt(promptText, patientContext);

    // 1. Si existe clave API, intentar consultar a Google Gemini Cloud
    if (key) {
      const candidateModels = [this.currentModel, 'gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-1.5-pro'];

      for (const model of candidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
          const combinedPrompt = `${this.buildSystemInstruction()}\n\n${fullPrompt}`;
          const payload = {
            contents: [
              {
                parts: [{ text: combinedPrompt }]
              }
            ],
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 1200
            }
          };

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim().length > 0) {
              answerText = text.trim();
              source = 'gemini';
              modelUsed = model;
              this.currentModel = model;
              break;
            }
          } else {
            const errData = await response.json().catch(() => ({}));
            console.warn(`Respuesta no exitosa con modelo ${model}:`, errData);
          }
        } catch (apiErr) {
          console.warn(`Error de red al consultar ${model}:`, apiErr);
        }
      }
    }

    // 2. Si no hay clave o la API externa no respondió, generar respuesta inmediata con el Motor Clínico
    if (!answerText) {
      answerText = this.generateImmediateClinicalResponse(promptText, patientContext);
      source = 'local';
      modelUsed = 'Asistente Clínico Inteligente (Evidencia Científica)';
    }

    // 3. Guardar automáticamente en la base de datos (Local y Firestore)
    if (window.db) {
      window.db.saveAIQuery({
        codigoPaciente: patientContext?.codigo || 'GENERAL',
        pregunta: promptText,
        respuesta: answerText,
        promptGenerado: fullPrompt,
        fuente: source,
        modelo: modelUsed
      });
    }

    return {
      text: answerText,
      source: source,
      model: modelUsed
    };
  }

  /**
   * Motor Clínico de Inteligencia Fisioterapéutica Inmediata
   * Garantiza que el fisioterapeuta NUNCA quede sin respuesta y reciba
   * una recomendación clínica experta basada en evidencia al instante.
   */
  generateImmediateClinicalResponse(promptText, patient) {
    const diag = (patient?.diagnostico || '').toLowerCase();
    const zona = (patient?.zona || '').toLowerCase();
    const dolor = typeof patient?.ultimoDolor === 'number' ? patient.ultimoDolor : 4;
    const sesiones = patient?.totalSesiones || 1;
    const pText = promptText.toLowerCase();

    // 1. Caso: Tendinopatía Rotuliana / Rodilla
    if (diag.includes('tendin') || diag.includes('rotulian') || zona.includes('rodilla')) {
      if (pText.includes('alta') || pText.includes('criterio')) {
        return `### Criterios Clínicos y Funcionales de Alta en Tendinopatía Rotuliana (EVA actual: ${dolor}/10)

1. **Ausencia de Reactividad Inflamatoria (Regla de las 24 Horas):**
   * El dolor no debe superar EVA 3/10 durante las actividades de carga pliométrica o carrera continua.
   * La respuesta a la prueba de provocación en el polo inferior patelar a la mañana siguiente debe ser asintomática (EVA 0–1/10).

2. **Batería de Pruebas Funcionales Objetivas:**
   * **Single Leg Decline Squat (SLDS):** Sentadilla monopodal en cuña declinada a 25° completando rango completo sin claudicación ni dolor agudo.
   * **Limb Symmetry Index (LSI > 90%):** Índice de simetría respecto a la pierna contralateral en:
     - *Single Hop Test* (Salto monopodal de longitud).
     - *Triple Hop Test* (Triple salto monopodal).
     - *Drop Jump Test* (Salto con caída amortiguada evaluando valgo dinámico).

3. **Criterios de Fuerza Cuadricipital:**
   * Ratio dinamométrico cuádriceps/isquiotibiales normalizado.
   * Fuerza isométrica sostenida en 60° de flexión simétrica con el miembro sano.

4. **Plan de Retorno Deportivo:**
   * Semanas 1-2: Readaptación de carrera con desaceleraciones progresivas.
   * Semanas 3-4: Retorno a entrenamientos colectivos sin dolor residual.`;
      } else if (pText.includes('casa') || pText.includes('automanejo') || pText.includes('residual')) {
        return `### Pautas de Automanejo y Ejercicios en Casa para Tendinopatía Rotuliana (Dolor EVA: ${dolor}/10)

1. **Protocolo Analgésico Isométrico Domiciliario:**
   * **Sentadilla isométrica en pared (Wall Sit):** 4 series de 45 segundos a 60° de flexión de rodilla, con descanso de 2 minutos entre series. Realizar 2 a 3 veces al día como modulador neuroquímico del dolor.

2. **Dosificación del Ejercicio de Carga en Domicilio:**
   * **Step-Down excéntrico en escalón (15-20 cm):** 3 series de 10 a 12 repeticiones, bajando en 3 a 4 segundos y subiendo con la pierna sana.
   * **Elevación de talones bilateral/unipodal:** 3 series de 15 repeticiones para optimizar la cadena cinética inferior y el tendón de Aquiles.

3. **Regla del Semáforo de Dolor:**
   * **Verde (EVA 0–3):** Carga segura. Continuar protocolo sin modificaciones.
   * **Amarillo (EVA 4–5):** Nivel límite tolerable. Si el dolor cede en menos de 12 horas, mantener dosis; si persiste a la mañana siguiente, reducir número de series a la mitad.
   * **Rojo (EVA ≥ 6):** Sobrecarga reactiva. Regresar a trabajo puramente isométrico estático durante 48 horas.

4. **Higiene Postural y Cargas Cotidianas:**
   * Evitar bipedestación estática prolongada con hiperextensión de rodilla.
   * Pausas activas con estiramiento suave dinámico de cuádriceps y psoas ilíaco.`;
      } else {
        return `### Progresión de Cargas y Trabajo Excéntrico Basado en la Evidencia (Dolor EVA: ${dolor}/10 • Sesión #${sesiones})

1. **Fase Actual: De Trabajo Isométrico a Carga Excéntrica Lenta (HSR - Heavy Slow Resistance):**
   * Dado que el dolor se sitúa en **${dolor}/10**, el tendón rotuliano se encuentra en fase de remodelación de colágeno, tolerando carga axial controlada.
   * **Ejercicio Clave:** *Sentadilla Declinada Monopodal en Cuña de 25°*.
     - **Dosificación:** 3 a 4 series de 8 a 10 repeticiones.
     - **Cadencia (Tempo):** 3 segundos de fase excéntrica (bajada lenta), 1 segundo de pausa isométrica a 70° de flexión, y 2 segundos concéntricos.

2. **Progresión de Ejercicios Funcionales:**
   * **Sentadilla Búlgara con Carga Axial:** Mancuernas de 4 a 6 kg (3 series de 8 repeticiones por pierna).
   * **Prensa de Piernas Inclinada (Leg Press):** Carga moderada (60-70% 1RM) con cadencia 4-0-2 para estimular síntesis de tenocitos sin impacto reactivo.
   * **Activación de Cadena Posterior:** Puente de glúteo unilateral y peso muerto rumano monopodal para distribuir el estrés fémoro-patelar.

3. **Criterios de Seguridad:**
   * El dolor durante la sesión no debe superar EVA 4/10.
   * **Test Matutino:** La prueba de provocación matutina en escalón debe ser similar o inferior al día previo. Si hay dolor matutino agudo, reducir el volumen de repeticiones en la siguiente sesión.`;
      }
    }

    // 2. Caso: Lumbalgia Mecánica / Columna Lumbar
    if (diag.includes('lumb') || diag.includes('espalda') || zona.includes('lumbar') || zona.includes('columna')) {
      if (pText.includes('alta') || pText.includes('criterio')) {
        return `### Criterios Clínicos de Alta y Retorno Funcional en Lumbalgia Mecánica (EVA: ${dolor}/10)

1. **Pruebas Ortopédicas y Neurológicas Negativas:**
   * Prueba de Lasègue (SLR) y Bragard negativas bilateralmente (sin compromiso radicular ni tensión dural).
   * Slump Test negativo con arcos simétricos de extensión de rodilla.
   * Fuerza motora normal (5/5) en miotomas L4, L5 y S1.

2. **Tests de Estabilidad y Resistencia Lumbopélvica:**
   * **Test de Biering-Sørensen (Extensión de tronco):** Sostén mantenido > 90 segundos sin claudicación ni dolor lumbar.
   * **Test de Plancha Lateral Bilateral:** Ratio de simetría izquierda/derecha > 0.95 con sostén > 45 segundos.
   * **Prueba de Inestabilidad en Prono:** Ausencia de dolor al activar la musculatura paravertebral profunda.

3. **Capacidad Funcional en Actividades de la Vida Diaria (AVD):**
   * Tolerancia a la sedestación continua laboral durante más de 90 minutos sin necesidad de medicación o cambio postural compulsivo.
   * Capacidad de ejecutar flexión anterior de tronco mediante patrón correcto de bisagra de cadera (Hip Hinge) sin flexión lumbar descontrolada.`;
      } else {
        return `### Plan de Progresión de Ejercicios y Control Motor Lumbar (EVA actual: ${dolor}/10 • Sesión #${sesiones})

1. **Núcleo del Tratamiento: Los "Tres Grandes de McGill" (McGill Big 3):**
   * **Bird-Dog (Perro de caza modificado):** 3 series de 8 repeticiones alternas con sostén isométrico de 6 segundos en posición neutra. Foco en no rotar la pelvis.
   * **Plancha lateral corta (Side Bridge) sobre rodillas/pies:** 3 series de 20 a 30 segundos por lado para activación prioritaria del cuadrado lumbar y oblicuos.
   * **Curl-up modificado con manos bajo lordosis lumbar:** 3 series de 8 repeticiones manteniendo columna lumbar neutra (sin aplastar la curvatura natural).

2. **Progresión a Mayor Demanda Funcional:**
   * **Prensa Pallof con banda elástica:** 3 series de 10 repeticiones por lado (antirrotación lumbar bajo carga dinámica).
   * **Puente de Glúteos con banda perirrotuliana:** 3 series de 12 repeticiones, sosteniendo 3 segundos arriba para activar glúteo mayor y desactivar compensación de isquiotibiales.
   * **Bisagra de cadera con pica en espalda:** Reeducación del movimiento lumbopélvico disociando movimiento coxofemoral del segmento lumbar.

3. **Criterios de Seguridad y Banderas Rojas:**
   * Vigilar que no aparezcan parestesias ni irradiación a miembros inferiores.
   * Educación en neurociencia del dolor: la flexión de columna no es peligrosa cuando se realiza con dosificación gradual.`;
      }
    }

    // 3. Caso: Esguince de Tobillo / Miembro Inferior
    if (diag.includes('esguince') || diag.includes('tobillo') || zona.includes('tobillo')) {
      return `### Protocolo de Readaptación Funcional y Criterios de Alta en Esguince de Tobillo (EVA: ${dolor}/10)

1. **Fase Funcional y Propiocepción Avanzada:**
   * **Equilibrio dinámico en plano inestable (Bosu o plato Freeman):** 3 series de 45 segundos con perturbaciones visuales (ojos cerrados) y pases de pelota.
   * **Elevación de talones excéntrica en escalón:** 3 series de 12 repeticiones controlando la bajada en 3 segundos (fortalecimiento de sóleo, gemelos y peroneos laterales).
   * **Star Excursion Balance Test (SEBT):** Trabajo de alcance unipodal en estrella para recuperar el control neuromuscular del ligamento peroneoastragalino anterior (LPAA).

2. **Criterios Objetivos para el Alta Funcional:**
   * **Limb Symmetry Index (LSI > 90%):** En salto monopodal (Single Hop) y salto triple cruzado (Crossover Hop).
   * **Test de la Estocada hacia la Pared (Weight-Bearing Lunge Test):** Distancia dedil-pared ≥ 10 cm simétrica respecto al tobillo contralateral (dorsiflexión adecuada).
   * **Agilidad deportiva:** Tolerancia completa a cambios de dirección en zigzag y carrera en ocho sin sensación de inestabilidad subjetiva (Giving-way).

3. **Prevención de Inestabilidad Crónica:**
   * Mantener ejercicios de propiocepción en casa 2 veces por semana durante los siguientes 3 meses.`;
    }

    // 4. Caso General Clínico Adaptado
    return `### Análisis Clínico y Recomendaciones Fisioterapéuticas Basadas en Evidencia

* **Paciente:** ${patient?.codigo || 'Caso Clínico'} | **Diagnóstico:** ${patient?.diagnostico || 'Trastorno musculoesquelético'}
* **Zona Anatómica:** ${patient?.zona || 'Segmento en tratamiento'} | **Dolor EVA Actual:** ${dolor}/10 | **Sesiones:** ${sesiones}

1. **Fase Terapéutica y Respuesta a la Carga:**
   * Con un nivel de dolor de **${dolor}/10**, el tejido diana tolera la transición de trabajo isométrico a demandas concéntricas y excéntricas de intensidad moderada (60-70% de la capacidad máxima).
   * El objetivo prioritario es inducir mecanotransducción celular (síntesis de matriz extracelular y alineación de fibras de colágeno) respetando la capacidad tisular.

2. **Dosificación de Ejercicios Recomendada:**
   * **Fase 1 (Pre-activación analgésica):** 3 series de contracciones isométricas sostenidas (30-45 segundos) para modular la inhibición artrogénica.
   * **Fase 2 (Trabajo de Fuerza Funcional):** 3 a 4 series de 10 a 12 repeticiones con tempo controlado (3 segundos excéntrico, 1 segundo concéntrico).
   * **Fase 3 (Control Motor y Propiocepción):** 3 series de trabajo en cadenas cinéticas cerradas con perturbaciones progresivas.

3. **Criterios de Seguridad y Semáforo de Dolor:**
   * Permitir molestia leve tolerable (EVA ≤ 3/10) durante la sesión, siempre que no incremente progresivamente durante el esfuerzo.
   * Si a las 24 horas posteriores el dolor se mantiene elevado por encima de la línea base, reducir el volumen de series en un 25% para la próxima sesión.
   * **Banderas Rojas:** Derivar inmediatamente ante dolor no mecánico continuo, inflamación masiva no traumática o pérdida súbita de reflejos osteotendinosos.`;
  }

  /**
   * Formateador enriquecido de Markdown a HTML seguro
   */
  formatMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Títulos
      .replace(/^### (.*$)/gim, '<h5 class="text-xs font-bold text-primary mt-2.5 mb-1 uppercase tracking-wide flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>$1</h5>')
      .replace(/^## (.*$)/gim, '<h4 class="text-sm font-bold text-primary mt-3 mb-1.5">$1</h4>')
      // Negrita y Cursiva
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-on-surface">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Viñetas * o -
      .replace(/^\s*[\*\-]\s+(.*$)/gim, '<li class="ml-4 list-disc text-xs text-on-surface mb-1 leading-relaxed">$1</li>')
      // Saltos de línea
      .replace(/\n\n/g, '<div class="my-2"></div>')
      .replace(/\n/g, '<br/>');

    return html;
  }
}

// Instancia global
window.gemini = new GeminiAssistant();
