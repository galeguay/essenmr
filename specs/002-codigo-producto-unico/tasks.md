# Tareas — Spec 002: Código de producto único y obligatorio

Orden de dependencia: scripts SQL → utilidades → formulario → documentación → migración en la base. La migración se aplica al final, cuando el formulario ya maneja los errores.

- [x] **T1 — Script de verificación previa.** Crear `sql/2026-10-24_verify_essen_id_before_unique.sql` con las dos consultas de solo lectura (vacíos y duplicados) y un comentario de uso.
  **RF:** RF-8
  **Hecho cuando:** el archivo existe, sigue el formato de nombre de `sql/` y al correrlo en el SQL Editor devuelve cero filas en ambas consultas.

- [x] **T2 — Script de migración.** Crear `sql/2026-10-24_products_essen_id_unique.sql` con `set not null`, la restricción `unique` y el comentario de columna. Incluir arriba la advertencia de correr antes la verificación de T1. **No ejecutarlo todavía.**
  **RF:** RF-7, RF-8
  **Hecho cuando:** el archivo existe, es idempotente en lo posible y menciona que depende de T1.

- [x] **T3 — Utilidades de código.** Crear `src/utils/productCode.js` con `normalizeProductCode` y `validateProductCodeFormat` según el plan (trim, ceros a la izquierda, solo dígitos, máximo 15).
  **RF:** RF-1, RF-2, RF-3
  **Hecho cuando:** `normalizeProductCode(" 00123 ")` da `"123"`, `"0"`→`"0"`, y `validateProductCodeFormat` devuelve los mensajes del plan para vacío, `12-345` y 16 dígitos, y `""` para `123`. Verificable desde la consola del navegador o `node`.

- [x] **T4 — Consulta de duplicados.** Crear `src/lib/products.js` con `findProductByCode(code, excludeId)`.
  **RF:** RF-4, RF-5, RF-6
  **Hecho cuando:** devuelve `{ id, name }` para un código existente, `null` para uno libre, ignora el producto `excludeId` y lanza el error si la consulta falla.

- [x] **T5 — Campo con validación al salir (`onBlur`).** En `ProductForm.jsx`: agregar estados `codeError` y `codeChecking`, hacer el campo `required` con `inputMode="numeric"`, limpiar el error al escribir, y en `onBlur` normalizar el valor, validar formato y consultar duplicados (excluyendo el producto en edición).
  **RF:** RF-1 a RF-4, RF-6
  **Hecho cuando:** al salir del campo con `00123` el campo muestra `123`; con un código existente aparece "Este código ya lo usa el producto «nombre»"; al editar un producto con su propio código no aparece aviso.

- [x] **T6 — Mensaje y estado visual.** Mostrar el error bajo el campo con `role="alert"`, `input-error` y un ícono o texto que no dependa solo del color; deshabilitar Guardar mientras `codeChecking` o `loading`.
  **RF:** RF-4, requisitos no funcionales (accesibilidad, mobile)
  **Hecho cuando:** el mensaje se lee en un ancho de 375 px sin romper el diseño y el botón queda deshabilitado durante la verificación.

- [x] **T7 — Verificación al guardar antes de subir archivos.** En `handleSubmit`: normalizar, validar formato, consultar duplicados y cortar si hay error (falla cerrada si la consulta falla), todo antes de cualquier `uploadImage`.
  **RF:** RF-1, RF-5, RF-6, RF-7
  **Hecho cuando:** guardar con código vacío, repetido o con conexión caída no guarda ni sube archivos y muestra el mensaje correspondiente.

- [x] **T8 — Traducir el error de la base.** En el `catch` de `handleSubmit`: si `error.code === "23505"`, mostrar "Este código ya lo usa otro producto." bajo el campo en lugar del `alert` técnico.
  **RF:** RF-7
  **Hecho cuando:** un duplicado que escape a la verificación (por ejemplo, dos pestañas) muestra el mensaje en el campo, no el texto del error de Postgres.

- [x] **T9 — Documentar el contexto.** Actualizar `AI_PROJECT_CONTEXT.md` indicando que `essen_id` es obligatorio, numérico (sin ceros a la izquierda, máx. 15 dígitos) y único, y mencionando los scripts de `sql/`.
  **RF:** —
  **Hecho cuando:** la sección de productos del archivo refleja la regla y apunta a los scripts.

- [x] **T10 — Aplicar la migración en la base.** Con el formulario ya listo, volver a correr T1 (debe dar vacío) y luego ejecutar T2 en Supabase → SQL Editor. **Lo ejecuta la persona del proyecto, no la IA.**
  **RF:** RF-7, RF-8
  **Hecho cuando:** la restricción existe (`\d products` o el panel de Supabase la muestra) y un insert duplicado desde el SQL Editor falla con `23505`.

- [x] **T11 — Verificación técnica.** Correr `npm run lint` y `npm run build` y corregir lo que falle.
  **RF:** todos
  **Hecho cuando:** ambos comandos terminan sin errores.
