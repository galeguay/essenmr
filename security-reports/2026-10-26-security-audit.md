# Auditoría de seguridad — Essen MR (2026-10-26)

## Resumen

Alcance: secretos y configuración, políticas SQL del repo, código fuente (OWASP) y dependencias. No se cubrió el frontend en ejecución (sin navegador). Solo lectura.

| Severidad | Cantidad |
|---|---|
| Crítica | 0 |
| Alta | 2 |
| Media | 3 |
| Baja | 3 |
| Info / por verificar | 2 |

Riesgo general: **medio**. No hay secretos expuestos ni XSS evidente en el código. El riesgo real está fuera del repo: cualquier usuario autenticado de Supabase tiene permisos de administrador, y solo `products` tiene RLS documentado en `sql/`.

---

## Estado de remediación (actualizado 2026-10-26)

| Hallazgo | Estado |
|---|---|
| SEC-001 `faqs` sin RLS | **Confirmado y corregido**: `sql/2026-10-26_faqs_rls.sql` ejecutado por el usuario. `announcements`, `product_lines` y `products` ya tenían RLS activo. |
| SEC-001 políticas de las demás tablas, SEC-002 registro abierto, SEC-003 buckets | Verificaciones de `sql/2026-10-26_verify_security_audit.sql` ejecutadas por el usuario, que informó que completaron con éxito. **Los resultados detallados no se adjuntaron a este informe.** |
| SEC-001 (consulta 2) | **Hallazgos nuevos confirmados**: `product_lines` permitía UPDATE a `anon`; los buckets `images` y `products` permitían INSERT y UPDATE a `anon`; `announcements` no tenía políticas de escritura. Corrección preparada en `sql/2026-10-26_fix_anon_write_policies.sql` (pendiente de ejecutar). |
| SEC-001 (correcciones A, B, C) | Ejecutadas por el usuario (`sql/2026-10-26_fix_anon_write_policies.sql`). |
| SEC-001 (consulta 3, grants de `anon`) | Sin brechas: las 4 tablas con grants por defecto tienen RLS activo. Endurecimiento opcional en `sql/2026-10-26_revoke_anon_write_grants.sql` (quita INSERT/UPDATE/DELETE/TRUNCATE a `anon`). |
| SEC-001 (endurecimiento) | `revoke` de escritura a `anon` ejecutado por el usuario. |
| SEC-003 (consulta 4, buckets) | **Confirmado**: `images`, `product_lines` y `products` son públicos y sin `file_size_limit` ni `allowed_mime_types`. Riesgo reducido tras la corrección B (solo `authenticated` sube). Propuesta de límites en `sql/2026-10-26_storage_bucket_limits.sql` (pendiente de revisar con los archivos existentes). |
| SEC-002 (consulta 5, usuarios) | Verificado por el usuario ("todo ok"): sin cuentas desconocidas. Resultado detallado no adjunto. |
| SEC-002 (registro abierto) | **Corregido**: captura del panel (Authentication → Sign In / Providers) muestra "Allow new users to sign up", "Allow anonymous sign-ins" y "Allow manual linking" desactivados; "Confirm email" activado. Pendiente confirmar que se guardó (recargar la página). |
| SEC-003 (límites de buckets) | Ejecutado por el usuario (`sql/2026-10-26_storage_bucket_limits.sql`). |
| SEC-004 cabeceras/CSP | **Aplicado en rama `fix/seguridad-auditoria`**: `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` activos; CSP en modo `Report-Only` (pasarla a `Content-Security-Policy` tras revisar la consola en producción). |
| SEC-005 dependencias | **Corregido**: `npm audit fix`, 0 vulnerabilidades. |
| SEC-003 (cliente) | **Corregido**: `validateUpload` en `uploadImage.js` y `PromotionsForm.jsx`. |
| SEC-006 enlaces | **Corregido** en `PdfInfographic` con `src/utils/safeUrl.js` (`HeroFusionBanner`/`CtaCard` reciben valores fijos del código). |
| SEC-007 `console.log` | **Corregido**. |
| SEC-008 contraseña | **Corregido** (mínimo 12 caracteres en el cliente; activar la política equivalente en Supabase). |
| SEC-009 PocketBase | **Corregido**: `src/lib/pocketbase.js` eliminado, documentación actualizada. |

---

## Hallazgos

### [SEC-001] Solo `products` tiene RLS versionado; el resto de tablas no se puede verificar — Alta (por verificar)
- **Ubicación**: `sql/2026-10-24_products_delete_policies.sql`; tablas usadas en el cliente: `product_lines`, `faqs`, `announcements`, `images`.
- **Descripción**: la propia migración reconoce que `products` estuvo sin RLS ("cualquiera con la clave pública podía modificar o borrar"). Ninguna otra tabla que el panel escribe (`product_lines`, `faqs`, `announcements`, `images`) tiene políticas en el repo. La anon key es pública y está en el bundle, así que si alguna sigue sin RLS, cualquier visitante puede modificarla.
- **Impacto**: un tercero podría editar o borrar FAQs, anuncios y líneas de producto, o insertar contenido (enlaces de phishing en anuncios) con solo `curl` y la anon key.
- **Evidencia**: `grep` de `.from(...)` en `src/` muestra escrituras (`insert/update/delete`) sobre `faqs`, `announcements`, `product_lines`. `grep -i "policy\|row level" sql/` solo encuentra `products` y `storage.objects`.
- **Corrección sugerida**: ejecutar `sql/2026-10-24_verify_products_delete_access.sql` adaptado a todas las tablas (cambiar la lista de `in (...)`) y, donde `rls_activo = false`, aplicar el mismo patrón: `select` público (si corresponde) y `insert/update/delete` solo `to authenticated`. Guardar esas políticas en `sql/`.

### [SEC-002] Cualquier usuario autenticado es administrador — Alta (por verificar)
- **Ubicación**: `sql/2026-10-24_products_delete_policies.sql:27-48`, `src/routes/AdminLayout.jsx:14-18`.
- **Descripción**: las políticas usan `to authenticated ... using (true)` y el guard del panel solo comprueba `!!session`. No hay noción de rol. Si el registro público está habilitado en Supabase (Authentication → Providers → "Allow new users to sign up"), cualquiera puede crearse una cuenta con `supabase.auth.signUp` desde la consola y obtener control total: borrar productos, subir/borrar archivos del bucket.
- **Impacto**: toma completa del contenido del sitio sin credenciales previas.
- **Evidencia**: `grep signUp src` no devuelve nada (el cliente no lo usa), pero eso no impide que se llame directamente a la API.
- **Corrección sugerida**: deshabilitar el registro abierto en el panel de Supabase (si solo hay uno o pocos admins). Si no, restringir por usuario/rol, por ejemplo `using ((auth.jwt() ->> 'email') = 'admin@...')` o una tabla `admins`.

### [SEC-003] Subida de archivos sin validación y con `upsert` sobre nombre predecible — Media
- **Ubicación**: `src/utils/uploadImage.js:4-18`; `accept=` en `ProductForm.jsx:478,507,539,560`, `ProductLineForm.jsx:315,337`, `PromotionsForm.jsx:43`.
- **Descripción**: el nombre es `${essenId}.${ext}` con `ext` tomada del nombre del archivo, y `upsert: true`. Los `accept` son solo ayuda de UI. No se valida tipo MIME real ni tamaño. Un admin (o alguien con sesión, ver SEC-002) puede subir un `.html` o `.svg` al bucket público; Supabase lo sirve con su Content-Type desde el dominio de Supabase.
- **Impacto**: contenido activo alojado en un bucket público (aislado del origen del sitio, por lo que el impacto es de reputación/phishing más que robo de sesiones) y sobreescritura de imágenes existentes.
- **Corrección sugerida**: lista blanca de extensiones/MIME y tope de tamaño en el cliente (`uploadImage.js`), y restricciones de tipo y tamaño (`allowed_mime_types`, `file_size_limit`) en la configuración del bucket, que es lo que realmente impone el servidor.

### [SEC-004] Sin cabeceras de seguridad ni CSP — Media
- **Ubicación**: `vercel.json` (solo `rewrites`), `index.html`.
- **Descripción**: no se envían `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`/`frame-ancestors` ni HSTS (Vercel agrega HSTS solo en algunos casos). La sesión de Supabase vive en `localStorage`, por lo que un XSS futuro (o un script de terceros comprometido, como el de Google Tag Manager cargado en `index.html:38`) podría robarla. Una CSP es la mitigación de mayor valor aquí.
- **Corrección sugerida**: en `vercel.json` agregar un bloque `headers`:
  ```json
  { "headers": [{ "source": "/(.*)", "headers": [
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
    { "key": "X-Frame-Options", "value": "DENY" },
    { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; connect-src 'self' https://*.supabase.co https://www.google-analytics.com; img-src 'self' data: https://*.supabase.co; media-src 'self' https://*.supabase.co; frame-src https://www.youtube-nocookie.com https://www.instagram.com https://www.tiktok.com; style-src 'self' 'unsafe-inline'" }
  ]}]}
  ```
  Probar en modo `Content-Security-Policy-Report-Only` primero, porque la lista de orígenes (analytics, fuentes, etc.) puede estar incompleta.

### [SEC-005] Dependencias con vulnerabilidades conocidas — Media
- **Ubicación**: `package-lock.json`.
- **Descripción**: `npm audit` reporta 7 (1 moderada, 6 altas). Las dos de producción (`--omit=dev`) son `vite` ≤ 7.3.6 y `source-map-js`. En la práctica `vite` es herramienta de build/dev: las CVE de `launch-editor` y `server.fs.allow` afectan al servidor de desarrollo, no al sitio desplegado. `source-map-js` es un DoS en el procesamiento de source maps durante el build.
- **Impacto**: bajo para el sitio publicado; relevante para quien ejecute `npm run dev` expuesto a la red.
- **Corrección sugerida**: `npm audit fix` (todas indican "fix available", sin cambios mayores: vite 7.3.7).

### [SEC-006] Enlaces provenientes de la base sin validar el esquema — Baja
- **Ubicación**: `src/components/HeroFusionBanner.jsx:14`, `src/components/CtaCard.jsx:25`, `src/components/PdfInfographic.jsx:133,235,293`.
- **Descripción**: `href={link}` / `href={url}` reciben URLs cargadas desde el panel. React 19 bloquea `javascript:` en `href` en el render, así que no es explotable hoy, pero no hay validación propia. Como datos y panel los controla un admin, el riesgo depende de SEC-001/002.
- **Corrección sugerida**: función `safeUrl()` que acepte solo `http:`, `https:`, `mailto:`, `tel:` y rutas relativas.

### [SEC-007] `console.log` de datos de sesión en producción — Baja
- **Ubicación**: `src/pages/admin/ProductLineForm.jsx:75` (`console.log("USER:", userData.user)`), `ProductForm.jsx:11` y `ProductLineForm.jsx:9` (`onSubmit = (data) => console.log(data)` por defecto).
- **Descripción**: vuelca el objeto de usuario (email, id, metadatos) en la consola del navegador. Poco riesgo, pero es ruido de depuración y mala práctica.
- **Corrección sugerida**: eliminar esas líneas.

### [SEC-008] Contraseña mínima de 6 caracteres y mensaje de error crudo — Baja
- **Ubicación**: `src/pages/admin/ChangePasswordForm.jsx:15-40`.
- **Descripción**: se exige solo longitud ≥ 6, y se muestra `error.message` del servidor tal cual. La contraseña del único panel admin protege toda la escritura del sitio.
- **Corrección sugerida**: subir el mínimo a 12 y activar la protección de contraseñas filtradas y la política de longitud en Supabase (Authentication → Policies).

### [SEC-009] `pocketbase.js` con URL local y token en `localStorage` (código muerto) — Info
- **Ubicación**: `src/lib/pocketbase.js`.
- **Descripción**: apunta a `http://127.0.0.1:8090` y no se importa en ningún lado (`Footer.jsx:5` está comentado). Autenticación real: Supabase. Es código sin uso que además deja un patrón de token en `localStorage` si alguien lo reactiva. `AI_PROJECT_CONTEXT.md` todavía lo menciona como parte del stack.
- **Corrección sugerida**: eliminar el archivo y la dependencia `pocketbase`, y actualizar la documentación.

---

## Dependencias

| Paquete | Severidad | En producción (bundle) | Solución |
|---|---|---|---|
| `vite` 7.3.6 | Alta (5 avisos) | No (solo build/dev) | `npm audit fix` → 7.3.7 |
| `source-map-js` | Alta | No (build) | `npm audit fix` |
| `zod` < 4.6.6 | Alta | Transitiva, verificar quién la trae | `npm audit fix` |
| `js-yaml` | Moderada | No (herramientas de lint) | `npm audit fix` |

Además hay paquetes con actualizaciones menores disponibles (`react` 19.2.7 → 19.3.1, `react-router-dom` 7.18.2 → 7.18.4, `@supabase/supabase-js` 2.110.5 → 2.118.0). No se pudo confirmar si traen correcciones de seguridad.

---

## Lo que está bien
- `.env.local` no está versionado ni lo estuvo (`git log --all -- '.env*'` vacío); `.gitignore` cubre `.env` y `*.local`.
- El bundle de `dist/` solo contiene una clave con `role: anon` (la pública por diseño). No hay `service_role`.
- No hay `dangerouslySetInnerHTML`, `innerHTML`, `eval` ni `document.write` en `src/`.
- Todos los `target="_blank"` usan `rel="noopener noreferrer"`.
- No hay filtros construidos por concatenación: el cliente usa el query builder de Supabase (parametrizado).
- `videoEmbed.js` solo genera embeds para YouTube (nocookie), Instagram y TikTok, con IDs extraídos por patrón.
- `storagePath.js` valida origen y prefijo del bucket antes de derivar una ruta.
- Migración de `products` con RLS, lectura pública y escritura solo autenticada; sin sourcemaps en `dist/`.
- El login no distingue "usuario inexistente" de "contraseña incorrecta".

## No verificado
- **RLS y políticas reales en Supabase** para `product_lines`, `faqs`, `announcements`, `images` y buckets de Storage: consultar `pg_policies` y `pg_class.relrowsecurity` en el SQL Editor.
- **Registro abierto de usuarios** (SEC-002): Authentication → Providers → Email en el panel de Supabase.
- **Límites de tipo/tamaño** de los buckets de Storage.
- **Origen de `link` en `HeroFusionBanner`**: no se pudo rastrear quién lo alimenta ni si viene de datos editables.
- **Frontend en ejecución**: cabeceras reales servidas por Vercel y comportamiento del panel sin sesión (la ruta `/admin/*` redirige a login por el guard del cliente, pero los datos dependen de RLS).
- **PocketBase**: sin uso en el código, no se evaluó.
