---
name: create-spec
description: Guía al usuario en la creación rigurosa de una especificación para una nueva funcionalidad de Essen MR, siguiendo Spec-Driven Development (SDD), antes de escribir código. Úsalo cuando el usuario pida crear una spec, definir/especificar una nueva feature o página, iniciar el flujo de spec-driven development, o diga algo como "armemos la spec de X", "quiero especificar X", "creemos una nueva funcionalidad para X". Coordina las fases de descubrimiento, redacción de spec.md, revisión crítica, planificación técnica (plan.md), desglose de tareas (tasks.md) y ejecución, generando los archivos en specs/[id]-[nombre-feature]/.
---

# Create Spec (Spec-Driven Development)

El objetivo es guiar al usuario en la definición rigurosa de una nueva funcionalidad antes de escribir código, siguiendo el proceso de Spec-Driven Development (SDD) en Essen MR.

Essen MR es una SPA en React + Vite (Tailwind 4 + DaisyUI) con una parte pública (catálogo, productos, FAQ) y un panel de administración, que usa PocketBase y Supabase. No hay backend propio ni suite de tests configurada: el contexto del proyecto está en `AI_PROJECT_CONTEXT.md`.

Actuá como un Arquitecto de Software y revisor crítico, siguiendo estrictamente estas fases. NO avances a la siguiente fase sin la confirmación del usuario ni intentes ejecutar todas las fases en una sola respuesta.

**FASE 1: Descubrimiento**
- Si el usuario provee un resumen breve, hacé preguntas clave para descubrir los casos de uso, reglas de negocio y restricciones técnicas.
- Asegurate de entender el problema real que se intenta resolver y a qué parte afecta (pública, admin o ambas).
- Hacé las preguntas de UNA en UNA para eliminar ambigüedades (casos límite, comportamiento con errores, vista mobile, qué queda fuera del MVP). Esperá la respuesta del usuario antes de hacer la siguiente pregunta.

**FASE 2: Creación de la Especificación (`spec.md`)**
- Antes de crear cualquier archivo, creá y movete a una nueva rama de Git a partir de `dev` con el formato `spec/[id]-[nombre-feature]`. El id debe seguir la numeración 001, 002 y así (revisá `specs/` para tomar el siguiente).
- Una vez en la nueva rama y con los requisitos claros, generá físicamente un archivo Markdown para la especificación (ej. `specs/[id]-[nombre-feature]/spec.md`).
- Estructura obligatoria:
  1. Contexto y objetivo (el QUÉ y el POR QUÉ).
  2. Usuarios (visitante público, administradora/or del panel).
  3. Historias de usuario.
  4. Requisitos funcionales numerados (RF-x) con criterios de aceptación en notación EARS en español.
  5. Requisitos no funcionales (responsive/mobile, rendimiento, SEO, accesibilidad).
  6. Casos límite.
  7. Fuera de alcance.
  8. Criterios de finalización.
  9. Dudas abiertas marcadas como [NECESITA ACLARACIÓN].
- IMPORTANTE: nada de stack, arquitectura ni nombres de archivos en este documento. Eso va en el plan.

**FASE 3: Revisión crítica**
- Revisá el archivo `spec.md` recién generado como un QA.
- Listá: (1) ambigüedades restantes, (2) contradicciones entre requisitos, (3) casos límite no cubiertos, (4) conflictos con el comportamiento actual descrito en `AI_PROJECT_CONTEXT.md`.
- No propongas soluciones todavía: solo detectá los problemas y presentalos en una lista numerada para que el usuario decida cómo proceder.
- **COMPUERTA:** una vez que el usuario decida sobre cada punto, actualizá `spec.md` con las resoluciones y resolvé todos los `[NECESITA ACLARACIÓN]`. NO avances a la Fase 4 mientras queden dudas abiertas o hallazgos sin resolver.

**FASE 4: Planificación Técnica (`plan.md`)**
- Tras la revisión, leé `AI_PROJECT_CONTEXT.md`, el `spec.md` y el código existente relacionado (páginas, componentes, `src/lib/`, `src/utils/`) para reutilizar lo que ya hay. NO escribas código fuente.
- Si hace falta delegar la exploración del código, usá el agente `Explore`.
- Generá el archivo `specs/[id]-[nombre-feature]/plan.md` con:
  - Estructura de módulos (páginas, componentes, rutas nuevas o modificadas en `App.jsx`, hooks/utilidades).
  - Modelo de datos: colecciones/tablas y campos de PocketBase o Supabase afectados, con un ejemplo en JSON. Si hay cambios de esquema, un script SQL en `sql/` con el formato `AAAA-MM-DD_descripcion.sql`.
  - Diseño de la interfaz: jerarquía de componentes, estado, estilos con Tailwind/DaisyUI, comportamiento responsive.
  - Algoritmos complejos en pseudocódigo.
  - Integraciones externas (PocketBase, Supabase, subida de imágenes, etc.) y manejo de errores y estados de carga.
  - Decisiones técnicas justificadas (y sus alternativas descartadas).
  - Estrategia de verificación (`npm run lint`, `npm run build` y checklist de pruebas manuales por RF).
- Todo debe cubrir todos los RF. Marcá explícitamente qué RF cubre cada parte.

**FASE 5: Desglose de Tareas (`tasks.md`)**
- A partir de `spec.md` y `plan.md`, generá `specs/[id]-[nombre-feature]/tasks.md`.
- Creá tareas pequeñas (máx. 20-30 min de implementación cada una), en estricto orden de dependencia lógica (ej. migración de datos antes de la UI que la consume).
- Cada tarea debe indicar los RF que cubre y contener una línea "Hecho cuando:" que sea fácilmente verificable. Usá checkboxes de Markdown (`- [ ]`).

**FASE 6: Ejecución de Tareas**
- **PAUSA OBLIGATORIA:** confirmá con el usuario que estás en la rama `spec/[id]-[nombre-feature]` (creada en la Fase 2) antes de escribir código.
- **Modo de ejecución:** por defecto, implementá **todas las tareas juntas**, en el orden establecido en `tasks.md`, sin preguntarle al usuario cómo desea proceder. Marcá el checkbox de cada tarea (`- [x]`) en cuanto la termines, para que `tasks.md` refleje el avance real.
- **Solo si el usuario lo indica explícitamente** ("paso a paso", "de a una tarea", etc.): ejecutá únicamente la primera tarea pendiente, entregá el código, marcá su checkbox (`- [x]`) y preguntale si el resultado es correcto o requiere ajustes antes de avanzar a la siguiente. Repetí ese ciclo hasta completar el archivo.
- Seguí las convenciones del código existente (estructura de `src/`, estilos, textos en español rioplatense).
- **NO hagas commits en esta fase ni en la siguiente:** el commit se hace al final de la Fase 7, cuando el código ya fue revisado y verificado.
- **REVISIÓN DE CÓDIGO:** al terminar la implementación, corré `/code-review` (o revisá el diff) para detectar deuda técnica, falta de manejo de errores o inconsistencias. Corregí los hallazgos antes de continuar.
- **VERIFICACIÓN DE INTERFAZ POR EL USUARIO (si aplica):** enlistá puntualmente los puntos de la interfaz que se modificaron (pantallas, componentes o flujos afectados, en desktop y mobile). Pedile al usuario que abra la aplicación (`npm run dev`) y revise manualmente cada punto para confirmar que el plan se llevó a cabo correctamente. **NO** delegues esta revisión visual a la IA. Aplicá los ajustes que el usuario pida y repetí hasta que dé su conformidad.
- **VERIFICACIÓN TÉCNICA (siempre al final):** recién cuando el código esté estable, ejecutá `npm run lint` y `npm run build` y corregí los errores. Si el proyecto llegara a tener tests automatizados, creá y ejecutá los que correspondan. Si algo falla y revela que el código se aparta de la spec, aplicá lo indicado en la Fase 7 (desvíos); en su defecto, consultá al usuario antes de avanzar.

**FASE 7: Verificación Post-Implementación y Calidad**
- Esta fase se ejecuta cuando las tareas están completas, el usuario aprobó la interfaz y lint/build pasan. No requiere que el usuario la pida.
- Recorré el archivo `spec.md` requisito por requisito (RF-1 en adelante). Para cada uno, indicá cómo se verificó (prueba manual, lint/build o test) y el resultado. Si algún RF no está verificado o falla, decilo claramente.
- **Desvíos de la spec:** si el código se aparta de lo especificado, presentale el desvío al usuario y que decida entre (a) corregir el código o (b) actualizar `spec.md` (y `plan.md`/`tasks.md` si corresponde). Si cambia el código, repetí las verificaciones afectadas.
- Si la feature cambió rutas, páginas o estructura, actualizá `AI_PROJECT_CONTEXT.md`.
- Comprobá los criterios de finalización y entregá un veredicto: ¿la spec está cumplida en su totalidad?
- **Commit:** con el veredicto afirmativo, preguntale al usuario si desea hacer el commit en la rama `spec/[id]-[nombre-feature]` (incluyendo la carpeta `specs/` y los scripts de `sql/`). No hagas merge a `dev` ni a `main` sin que lo pida.
