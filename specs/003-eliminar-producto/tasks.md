# Tareas 003 — Eliminar producto

Orden de dependencia lógica. Cada tarea toma 20-30 minutos o menos. Detalle técnico en [plan.md](plan.md).

## A. Scripts SQL (no se ejecutan en la base sin que la persona responsable los revise)

- [x] **T1. Script de verificación de referencias a productos** — RF-9
  Crear `sql/2026-10-24_verify_products_references.sql`: consulta de solo lectura sobre `pg_constraint` que liste toda llave foránea hacia `public.products`, con comentario de cabecera como los scripts existentes.
  Hecho cuando: el archivo existe, es solo lectura (sin `insert`/`update`/`delete`/`alter`) y su cabecera explica que se corre antes de activar la función y qué hacer si devuelve filas.

- [x] **T2. Script de verificación de acceso de borrado** — RF-8
  Crear `sql/2026-10-24_verify_products_delete_access.sql`: consulta de solo lectura que muestre si RLS está activo en `public.products` y `storage.objects`, y las políticas de `pg_policies` de ambas tablas.
  Hecho cuando: el archivo existe, es solo lectura y su cabecera indica cómo interpretar cada escenario (RLS activo sin política de borrado / RLS desactivado).

- [x] **T3. Script de políticas de borrado** — RF-8
  Crear `sql/2026-10-24_products_delete_policies.sql`: políticas idempotentes (`drop policy if exists` + `create policy`) `for delete to authenticated` sobre `public.products` y sobre `storage.objects` con `bucket_id = 'products'`. No activa RLS ni toca políticas de lectura, inserción o actualización.
  Hecho cuando: el archivo existe, solo crea esas dos políticas y su cabecera advierte que debe correrse después de T2 y que, si RLS está desactivado, se necesita definir antes un conjunto completo de políticas.

## B. Utilidades y lógica

- [x] **T4. Utilidad de frase de confirmación** — RF-3
  Crear `src/utils/deleteConfirmation.js` con `DELETE_PHRASE = "eliminar producto"` e `isDeletePhraseValid(text)`: ignora mayúsculas/minúsculas y espacios en los extremos, y rechaza cualquier otra diferencia.
  Hecho cuando: en la consola o un script de Node la función devuelve `true` para `"ELIMINAR PRODUCTO"` y `"  eliminar producto "`, y `false` para `"eliminar producto."`, `"eliminarproducto"`, `"eliminar  producto"` y `""`.

- [x] **T5. Utilidad de ruta de Storage** — RF-5
  Crear `src/utils/storagePath.js` con `storagePathFromUrl(url, bucket)`: devuelve la ruta decodificada dentro del bucket, o `null` si la URL está vacía, es inválida, es de otro origen que `VITE_SUPABASE_URL` o no contiene `/storage/v1/object/public/<bucket>/`. Ignora parámetros de consulta.
  Hecho cuando: con una URL pública del bucket `products` (incluso con `?v=123`) devuelve el nombre del archivo; con un enlace de YouTube, `null`, `""` y `undefined` devuelve `null`.

- [x] **T6. Función `deleteProductWithFiles`** — RF-4, RF-5, RF-6
  En `src/lib/products.js` agregar `deleteProductWithFiles(id)` según el pseudocódigo del plan (§4): leer registro de la base, borrar la fila, distinguir 0 filas por permisos de "ya eliminado", recolectar rutas únicas con T5, omitir archivos usados por otro producto, borrar en Storage en lote y contar fallos. Devuelve `{ status, failedFiles }` y lanza error si no se pudo borrar la fila.
  Hecho cuando: la función existe, exportada, sin código muerto; `npm run lint` no reporta errores nuevos en el archivo; y se revisa que no se toque Storage antes de confirmar que la fila fue borrada.

## C. Interfaz

- [x] **T7. Componente `DeleteProductDialog`** — RF-2, RF-3, RF-6
  Crear `src/components/admin/DeleteProductDialog.jsx` (`<dialog>` de DaisyUI, `modal-bottom sm:modal-middle`, `max-h-[90dvh]`): nombre del producto con `break-words`, advertencia de acción permanente con ícono y texto, mención de imágenes/ficha/video, input con foco automático y vacío al abrir, botones "Cancelar" y "Eliminar" (deshabilitado según T4 o `deleting`), spinner y "Eliminando…". Bloquear Escape (`cancel` con `preventDefault`), clic fuera y "Cancelar" mientras `deleting`. Enter confirma solo si la frase es válida.
  Hecho cuando: renderizado desde `ProductForm` (T8) el diálogo abre/cierra, el botón sigue deshabilitado hasta la frase correcta, y con `deleting` activo ni Escape, ni clic fuera ni "Cancelar" lo cierran.

- [x] **T8. Botón y flujo de borrado en `ProductForm`** — RF-1, RF-6, RF-7
  En `src/pages/admin/ProductForm.jsx`: guardar `savedName` en `loadProduct`; agregar estados `showDeleteDialog` y `deleting`; zona de peligro con el botón "Eliminar producto" (`type="button"`, estilo de advertencia con ícono y texto, ancho completo en mobile) debajo de los botones de guardar, solo si `isEdit`; handler `handleDelete` según el plan (§5) con los tres avisos (`Producto eliminado` / archivos no borrados / producto ya inexistente), `navigate("/admin/products")` en éxito y diálogo abierto con error genérico en fallo.
  Hecho cuando: el botón no aparece en `/admin/products/new`, aparece en `/admin/products/:id`, abre el diálogo y al confirmar con un producto de prueba lo elimina, muestra el aviso y vuelve al listado sin ese producto.

- [x] **T9. Guardar sobre un producto ya eliminado** — RF-6 (caso límite)
  En el `catch` de `handleSubmit` de `ProductForm.jsx`, si `error.code === "PGRST116"` y una relectura por `id` devuelve `null`, mostrar "Este producto fue eliminado y ya no existe." y navegar al listado; si la fila existe, mantener el mensaje genérico actual.
  Hecho cuando: con el mismo producto abierto en dos pestañas, eliminarlo en una y pulsar "Actualizar" en la otra muestra ese aviso y lleva al listado, sin error técnico.

## D. Verificación y cierre

- [x] **T10. Verificación técnica** — todos los RF
  Ejecutar `npm run lint` y `npm run build` y corregir lo que corresponda.
  Hecho cuando: ambos comandos terminan sin errores nuevos atribuibles a esta feature.

- [x] **T11. Documentación del proyecto** — RF-4, RF-5, RF-8
  Actualizar `AI_PROJECT_CONTEXT.md` solo con lo que cambió: borrado de producto desde la edición, borrado de archivos del bucket `products`, nuevos archivos de `src/` y scripts de `sql/`.
  Hecho cuando: `AI_PROJECT_CONTEXT.md` menciona esos cambios y no se alteró nada más del documento.

## Pasos manuales (no son tareas de código)

- Revisión de la interfaz por parte de la persona usuaria (desktop y mobile) en la Fase 6.
- Correr en Supabase T1 y T2, analizar resultados y recién entonces T3 (RF-8, RF-9), y completar el checklist manual del plan (§8).

## Cobertura de RF

| RF | Tareas |
|---|---|
| RF-1 | T8 |
| RF-2 | T7, T8 |
| RF-3 | T4, T7 |
| RF-4 | T6, T8 |
| RF-5 | T5, T6 |
| RF-6 | T6, T7, T8, T9 |
| RF-7 | T8 |
| RF-8 | T2, T3 |
| RF-9 | T1 |
