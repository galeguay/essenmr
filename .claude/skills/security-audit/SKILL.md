---
name: security-audit
description: Analiza vulnerabilidades de seguridad de Essen MR (React + Vite + PocketBase + Supabase) y genera un informe en Markdown con hallazgos ordenados por severidad. Cubre código fuente (OWASP Top 10), dependencias (npm audit/CVEs), secretos y configuración (.env, vercel.json, políticas SQL/RLS) y el frontend en ejecución (headers, cookies, formularios). Usala siempre que el usuario pida una auditoría o revisión de seguridad, buscar vulnerabilidades, revisar XSS/inyección/control de acceso/RLS, chequear secretos expuestos o dependencias vulnerables, o pregunte "¿es seguro esto?", "¿hay algo expuesto?", "revisá la seguridad antes de desplegar", aunque no diga "auditoría" explícitamente.
---

# Security Audit (Essen MR)

Auditoría de solo lectura: se analiza y se informa, **no se modifica código** salvo que el usuario lo pida después. El valor está en hallazgos reales y verificados, no en una lista larga de advertencias genéricas; un informe con falsos positivos hace que el equipo deje de leerlo.

## Contexto del proyecto

SPA en React 19 + Vite, sin backend propio. La seguridad real vive en:
- **Supabase** (`src/lib/supabase.js`, carpeta `sql/`): la anon key es pública por diseño, así que *toda* la protección depende de las políticas RLS y de los permisos del Storage. Es la superficie más crítica.
- **PocketBase** (`src/lib/pocketbase.js`): autenticación del panel admin y sus reglas de colección (no están en el repo; marcarlas como "no verificable desde el código").
- **Panel admin** (`src/pages/admin`, `src/routes/AdminLayout.jsx`): un guard de ruta en el cliente es solo UX, no seguridad. Verificá que los datos sensibles/escrituras estén protegidos del lado del servidor.
- **Despliegue** en Vercel (`vercel.json`): hoy solo tiene rewrites, sin headers de seguridad.

Leé `AI_PROJECT_CONTEXT.md` si necesitás más contexto.

## Flujo

Trabajá por áreas; si el usuario acota ("solo dependencias"), hacé solo esa. Antes de empezar decí en una línea qué vas a cubrir.

### 1. Secretos y configuración
- `git ls-files | grep -i env` y `git log --all --oneline -- '.env*'`: ¿hay `.env` versionado o lo hubo en el historial? Confirmá que `.gitignore` cubre `.env*`.
- Buscá claves en el código y en `dist/`: `grep -rniE "(secret|service_role|api[_-]?key|token|password)\s*[:=]" src public index.html` (descartá nombres de variables sin valor).
- Toda variable `VITE_*` termina en el bundle público: una `service_role` o clave privada con prefijo `VITE_` es **crítica**. La anon key de Supabase no es un hallazgo por sí sola.
- Revisá `vercel.json` / `index.html`: faltan CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`/`frame-ancestors`, HSTS.
- Revisá `vite.config.js` (sourcemaps en producción, proxies) y `public/` por archivos que no deberían ser públicos.

### 2. Políticas de base de datos (Supabase)
- Leé todos los `sql/*.sql`: ¿cada tabla tiene RLS habilitado? ¿Hay políticas `USING (true)` o `TO anon` con INSERT/UPDATE/DELETE? ¿Quién puede borrar productos (ver las migraciones de `products_delete_policies`)?
- Cruzá con el código: tablas/buckets que el cliente escribe (`src/lib`, `src/utils/uploadImage.js`) vs. lo que las políticas permiten. Una escritura anónima permitida es **alta/crítica**.
- Subida de archivos: validación de tipo/tamaño, nombres de archivo, bucket público vs. privado.
- Si el SQL real del proyecto no está completo en el repo, decilo en "No verificado".

### 3. Código fuente (OWASP Top 10 aplicado a este stack)
- **XSS**: `dangerouslySetInnerHTML`, `innerHTML`, `href`/`src` armados con datos del usuario o de la base (`javascript:` URLs), HTML proveniente de PocketBase/Supabase sin sanear, `target="_blank"` sin `rel="noopener noreferrer"`.
- **Control de acceso**: guards de rutas admin solo en cliente, acciones admin accesibles sin sesión, IDs manipulables, datos que cualquier visitante puede leer pero no debería.
- **Autenticación/sesión**: dónde y cómo se guarda el token (authStore de PocketBase en localStorage), expiración, logout, manejo de errores de login que filtren si el usuario existe.
- **Inyección**: filtros de PocketBase armados concatenando entrada del usuario (`filter: \`name = "${x}"\``) en vez de parámetros; consultas dinámicas.
- **Redirecciones/URLs**: `window.location`/`navigate` con parámetros no validados; `new URL` sobre entradas externas (ver `src/utils/storagePath.js`).
- **Exposición de datos**: `console.log` de datos sensibles, mensajes de error con detalles internos, analítica (react-ga4) enviando datos personales.
- **Procesamiento de archivos**: `pdfjs-dist` con PDFs de terceros (versiones con CVE de ejecución de JS), carga de imágenes.
- **Componentes de terceros** que cargan scripts/iframes externos (YouTube, mapas, etc.): origen y atributos `sandbox`/`allow`.

### 4. Dependencias
```bash
npm audit --omit=dev --json   # producción primero
npm audit --json              # luego dev (menor prioridad: no llegan al bundle)
npm outdated
```
Reportá solo lo accionable: paquete, severidad, si es directa o transitiva, si llega al bundle de producción, y la versión que lo corrige (`npm audit fix` vs. cambio mayor). Una vulnerabilidad de dev-dependency (p. ej. del servidor de Vite) pesa mucho menos que una en `react-router-dom` o `pdfjs-dist`. Si no hay red, decilo y analizá `package-lock.json` manualmente.

### 5. Frontend en ejecución (opcional, si hay dev server o URL)
Con la herramienta de navegador disponible (`preview_start` con `.claude/launch.json`): revisá headers de respuesta, cookies/localStorage, errores en consola, y probá el panel admin sin sesión (¿se ven datos o acciones?). Usá solo el entorno local o el que el usuario indique; no ataques sitios en producción ni envíes payloads destructivos.

## Cómo evaluar cada hallazgo

Antes de incluirlo, verificá que sea real: leé el código alrededor, seguí el dato desde su origen hasta el punto peligroso y confirmá que nada lo sanea antes. Si no podés confirmarlo, marcalo como **"Por verificar"** en lugar de inflarlo. Asigná severidad por impacto × facilidad de explotación en *este* proyecto:

| Severidad | Criterio |
|---|---|
| Crítica | Escritura/lectura no autorizada de datos, secretos privados expuestos, toma de cuenta admin |
| Alta | XSS almacenado, RLS faltante en tablas con datos sensibles, dependencia de producción con CVE explotable |
| Media | XSS reflejado con precondiciones, falta de CSP/headers, subida de archivos sin validación |
| Baja | Hardening, fugas menores de información, dependencias de desarrollo |
| Info | Buenas prácticas, observaciones sin riesgo directo |

## Informe

Guardalo en `security-reports/AAAA-MM-DD-security-audit.md` (creá la carpeta; preguntá antes de commitearlo) y resumí en el chat: conteo por severidad y los 3 hallazgos más importantes. Estructura:

```markdown
# Auditoría de seguridad — Essen MR (AAAA-MM-DD)

## Resumen
Alcance cubierto, conteo por severidad, riesgo general en 2–3 líneas.

## Hallazgos
### [SEV-001] Título corto — Severidad
- **Ubicación**: `ruta/archivo.jsx:42`
- **Descripción**: qué pasa y por qué es un problema aquí.
- **Impacto / escenario de ataque**: qué puede hacer un atacante, concretamente.
- **Evidencia**: fragmento de código o salida del comando.
- **Corrección sugerida**: cambio concreto (código o SQL de ejemplo).

## Dependencias
Tabla: paquete | versión | severidad | en producción | solución.

## Lo que está bien
Controles correctos encontrados (para no re-trabajarlos).

## No verificado
Lo que no se pudo comprobar desde el repo (reglas de PocketBase, config del panel de Supabase, etc.) y cómo comprobarlo.
```

Ordená los hallazgos de mayor a menor severidad. Nunca pegues el valor de un secreto en el informe ni en el chat: indicá archivo y línea, y recomendá rotarlo.

## Límites
- Solo lectura y análisis; no corras exploits, fuzzing ni escaneos contra servicios que no sean el entorno local del usuario.
- No corrijas código a menos que el usuario lo pida después de ver el informe; si lo hace, un fix por hallazgo y volvé a verificar.
