/**
 * FisioConecta - Módulo de Inteligencia Artificial (Google Gemini)
 * Generador de Prompts Clínicos y Asistente Fisioterapéutico Basado en Evidencia.
 * La API Key se almacena localmente de forma segura y nunca se expone en GitHub.
 */

class GeminiAssistant {
  constructor() {
    this.models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.currentModel}:generateContent?key=${key}`;
    const payload = {
      contents: [
        {
          parts: [{ text: "Responde únicamente con la palabra OK si la conexión está activa." }]
        }
      ]
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error?.message || 'Error de autenticación con la API de Gemini.';
        return { success: false, message: errorMsg };
      }

      return { success: true, message: '¡Conexión con Gemini verificada exitosamente!' };
    } catch (err) {
      return { success: false, message: 'Error de red al conectar con Google Gemini: ' + err.message };
    }
  }

  /**
   * Genera 3 Prompts Clínicos específicos para el paciente analizado
   * basados en su diagnóstico, evolución de dolor (EVA) y ejercicios completados.
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
    
    // Obtener nombres de últimos ejercicios
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

  /**
   * Envía una consulta a Google Gemini y devuelve la respuesta clínica estructurada
   */
  async askGemini(promptText, patientContext = null) {
    const key = this.getApiKey();
    if (!key) {
      throw new Error('Debes configurar tu API Key de Gemini para realizar consultas.');
    }

    const systemInstruction = `Eres FisioIA, un asistente clínico especializado en Fisioterapia, Kinesiología y Rehabilitación Física Basada en la Evidencia.
Tus respuestas deben ser:
1. Claras, concisas y orientadas a la toma de decisiones clínicas del fisioterapeuta.
2. Organizadas con viñetas claras (Progresión, Dosificación, Criterios de Seguridad y Banderas Rojas si aplican).
3. Enfocadas en el bienestar del paciente anónimo respetando la dosificación adecuada.
No inventes información diagnóstica médica definitiva; brinda recomendaciones fundamentadas en fisioterapia moderna.`;

    let fullPrompt = promptText;
    if (patientContext) {
      fullPrompt = `[CONTEXTO CLÍNICO DEL PACIENTE]
Código anónimo: ${patientContext.codigo || 'PAC'}
Diagnóstico: ${patientContext.diagnostico || 'No especificado'}
Zona: ${patientContext.zona || 'No especificada'}
Nivel de Dolor Actual (EVA): ${patientContext.ultimoDolor || 'N/A'}/10
Total Sesiones: ${patientContext.totalSesiones || 'N/A'}

[PREGUNTA DEL FISIOTERAPEUTA]
${promptText}`;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.currentModel}:generateContent?key=${key}`;
    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: fullPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1000
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || 'Error en la respuesta de Google Gemini.';
      throw new Error(errMsg);
    }

    const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!answerText) {
      throw new Error('Gemini no generó ninguna respuesta para esta consulta.');
    }

    // Guardar automáticamente en la base de datos (Local y Firestore)
    if (window.db) {
      window.db.saveAIQuery({
        codigoPaciente: patientContext?.codigo || 'GENERAL',
        pregunta: promptText,
        respuesta: answerText,
        promptGenerado: fullPrompt
      });
    }

    return answerText;
  }

  /**
   * Formateador simple de Markdown a HTML seguro para la interfaz
   */
  formatMarkdown(text) {
    if (!text) return '';
    let html = text
      // Escapar caracteres peligrosos
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Negrita **texto**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Cursiva *texto*
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Títulos ##
      .replace(/^### (.*$)/gim, '<h5 class="text-xs font-bold text-primary mt-2 mb-1 uppercase tracking-wide">$1</h5>')
      .replace(/^## (.*$)/gim, '<h4 class="text-sm font-bold text-primary mt-3 mb-1.5">$1</h4>')
      // Viñetas * o -
      .replace(/^\s*[\*\-]\s+(.*$)/gim, '<li class="ml-4 list-disc text-xs text-on-surface mb-1">$1</li>')
      // Saltos de línea
      .replace(/\n\n/g, '<br class="my-1"/>');

    return html;
  }
}

// Instancia global
window.gemini = new GeminiAssistant();
