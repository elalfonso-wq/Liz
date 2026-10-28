# FisioConecta - Prototipo de Seguimiento Clínico para Fisioterapia

**FisioConecta** es una aplicación web diseñada específicamente para fisioterapeutas, pensada para registrar las sesiones de sus pacientes y consultar de manera sencilla los ejercicios indicados y los cambios en el nivel de dolor a lo largo del proceso de rehabilitación.

---

## 1. El Problema que Resuelve
Un fisioterapeuta atiende a múltiples pacientes durante la semana. Al recibir nuevamente a un paciente, suele ser difícil recordar con exactitud qué ejercicios realizó en la sesión anterior, cuántas series y repeticiones toleró, o cómo ha ido evolucionando su nivel de dolor.

**FisioConecta centraliza toda esta información clínica en un solo lugar:**
* **Privacidad garantizada:** Registro anónimo mediante códigos alfanuméricos ficticios (ej. `#PAC-842`), sin solicitar nombres ni datos personales sensibles.
* **Escala Visual Analógica (EVA):** Medición del dolor de 0 a 10 con semáforo cromático clínico (verde para leve, ámbar para moderado, rojo para intenso).
* **Prescripción dosificada de ejercicios:** Registro ágil de series, repeticiones/tiempo y criterios técnicos específicos por ejercicio.
* **Gráfica de evolución temporal:** Visualización interactiva de la curva de dolor a través de las sesiones para evaluar objetivamente la respuesta al tratamiento.

---

## 2. Funcionalidades del Prototipo

### Pantalla 1: Directorio Clínico de Pacientes
* Listado de pacientes activos con badges de código anónimo.
* Buscador en tiempo real por código (ej. `842`) o zona corporal (ej. `rodilla`).
* Filtros rápidos por severidad de dolor en escala EVA (Leve 0-3, Moderado 4-6, Intenso 7-10).
* Alta rápida de nuevos pacientes con generación automática de código único y dolor inicial.

### Pantalla 2: Registro de Nueva Sesión
* Selector de paciente y selector de fecha.
* Riel táctil interactivo de 11 puntos para la Escala EVA (0 al 10).
* Comparativa automática con el dolor de la sesión anterior (ej. "Disminución de 1 punto • Evolución Favorable").
* Constructor de protocolo de ejercicios con controles interactivos (`+` / `-`) para series y repeticiones.
* Sugerencias rápidas de ejercicios comunes en fisioterapia (isometrías, puentes de glúteo, movilidad, etc.).
* Campo de texto para observaciones y notas clínicas del terapeuta.

### Pantalla 3: Evolución del Paciente y Gráfica Histórica
* Ficha clínica del paciente con fecha de inicio, diagnóstico y sesiones totales.
* Métricas clave: Dolor inicial, Dolor actual y porcentaje de mejora.
* **Gráfica interactiva en curva:** Trazo suave con gradiente, puntos de control coloreados por EVA y valores numéricos en cada sesión.
* Historial cronológico inverso con acceso directo al detalle de cada sesión.

### Pantalla 4: Consulta de Sesión Pasada
* Desglose completo de cualquier sesión anterior.
* Indicador visual de 11 escalones EVA y avance comparativo respecto a la primera cita.
* Listado de ejercicios realizados con series, repeticiones y criterios técnicos registrados.
* Botón **"Repetir en Nueva Sesión"** para transferir inmediatamente los ejercicios a una consulta nueva sin tener que escribirlos de nuevo.

---

## 3. Arquitectura y Base de Datos

* **Modo Local Inmediato (Offline):** La aplicación utiliza `localStorage` con la clase `FisioDB` ([js/db.js](js/db.js)). No requiere instalación de Node, Python ni servidores externos; funciona de inmediato en cualquier navegador.
* **Preparación para Firebase Firestore:** La estructura de datos está completamente normalizada en colecciones (`pacientes` y `sesiones`), lista para conectar la clave de Firebase desde el modal integrado de configuración en la nube.
* **Tecnologías:**
  * HTML5 Semántico
  * Tailwind CSS (vía CDN)
  * JavaScript Moderno (Vanilla ES6+)
  * Tipografías clínicas: `Manrope` (lectura médica) y `JetBrains Mono` (códigos y métricas)
  * Iconografía: Google Material Symbols Outlined

---

## 4. ¿Cómo Ejecutar en Local?

1. Descarga o clona el repositorio:
   ```bash
   git clone https://github.com/elalfonso-wq/Liz.git
   ```
2. Abre directamente el archivo `index.html` en tu navegador favorito (Google Chrome, Microsoft Edge, Firefox o Safari) haciendo doble clic sobre él.
3. ¡Listo! La aplicación ya contiene datos clínicos de demostración para probar todas las funciones desde el primer segundo.

---

## 5. Publicación en GitHub Pages (1 Clic)

Para que la aplicación esté disponible en línea en internet:
1. En GitHub, ve a tu repositorio: [elalfonso-wq/Liz](https://github.com/elalfonso-wq/Liz).
2. Entra a **Settings** > **Pages** (en el menú lateral izquierdo).
3. En **Branch**, selecciona `main` y la carpeta `/(root)`.
4. Haz clic en **Save**. En un minuto, tu aplicación estará publicada y accesible desde cualquier celular o computadora en:
   `https://elalfonso-wq.github.io/Liz/`
