# Plan técnico 003 — Eliminar producto

Cubre los RF-1 a RF-9 de [spec.md](spec.md). No hay rutas nuevas: toda la UI vive en la pantalla de edición existente (`/admin/products/:id`).

## 1. Hallazgos del código actual

- `ProductForm.jsx` (`src/pages/admin/`) maneja alta y edición (`isEdit = !!id`). Usa `supabase` directo y `alert()` para avisos, y navega a `/admin/products` al terminar.
- Los archivos se suben con `uploadImage` (`src/utils/uploadImage.js`) siempre al bucket de Storage `products`. Las URLs guardadas en `products.image`, `products.info_pdf`, `products.video_url` y `products.images` (arreglo) son URLs públicas con la forma `<SUPABASE_URL>/storage/v1/object/public/products/<archivo>`. `video_url` también puede ser un enlace externo.
- `src/lib/products.js` ya concentra consultas de productos (`findProductByCode`): ahí va la lógica de borrado.
- `AdminLayout.jsx` ya redirige a `/admin/login` sin sesión de Supabase Auth.
- `ProductDetail.jsx` ya muestra "Producto no encontrado" cuando `maybeSingle()` devuelve `null`: no requiere cambios (RF-4).
- No hay componentes de diálogo; se usa DaisyUI (`modal`, `<dialog>`), ya presente en el proyecto.
- El esquema real y las reglas de acceso (RLS) de Supabase **no están en el repositorio**: no hay políticas en `sql/`. Es el principal riesgo del plan (ver §7).

## 2. Estructura de módulos

| Archivo | Cambio | RF |
|---|---|---|
| `src/utils/deleteConfirmation.js` (nuevo) | `DELETE_PHRASE = "eliminar producto"` y `isDeletePhraseValid(text)`. | RF-3 |
| `src/utils/storagePath.js` (nuevo) | `storagePathFromUrl(url, bucket)`: devuelve la ruta del archivo dentro del bucket o `null` si la URL no pertenece al Storage del proyecto. | RF-5 |
| `src/lib/products.js` | Agrega `deleteProductWithFiles(id)` y helpers privados. | RF-4, RF-5, RF-6 |
| `src/components/admin/DeleteProductDialog.jsx` (nuevo) | Diálogo de confirmación (presentacional). | RF-2, RF-3, RF-6 |
| `src/pages/admin/ProductForm.jsx` | Botón "Eliminar producto" (solo `isEdit`), estado del diálogo, handler de borrado, manejo de "guardar sobre producto ya eliminado". | RF-1, RF-6, RF-7 |
| `sql/2026-10-24_verify_products_references.sql` (nuevo) | Lista llaves foráneas que apuntan a `products`. | RF-9 |
| `sql/2026-10-24_verify_products_delete_access.sql` (nuevo) | Muestra estado de RLS y políticas vigentes de `products` y de Storage. | RF-8 |
| `sql/2026-10-24_products_delete_policies.sql` (nuevo) | Políticas de borrado solo para usuarios autenticados. | RF-8 |
| `AI_PROJECT_CONTEXT.md` | Documentar el borrado, el bucket `products` y las políticas (Fase 7). | — |

`App.jsx`, `Products.jsx` y las páginas públicas no cambian.

## 3. Modelo de datos

Sin columnas ni tablas nuevas. Se usa la fila existente de `products`:

```json
{
  "id": 42,
  "name": "Olla Essen 24",
  "essen_id": 12345,
  "image": "https://xxx.supabase.co/storage/v1/object/public/products/12345_260306.webp",
  "info_pdf": "https://xxx.supabase.co/storage/v1/object/public/products/12345_ficha_260306.pdf",
  "video_url": "https://www.youtube.com/shorts/abc123",
  "images": [
    "https://xxx.supabase.co/storage/v1/object/public/products/12345_extra_260306_1730000000000_0.webp"
  ]
}
```

En este ejemplo `video_url` es externo, por lo que se ignora (RF-5); se borran 3 archivos del bucket `products`.

### Scripts SQL (RF-8, RF-9)

1. **`verify_products_references.sql`** (solo lectura): consulta `pg_constraint` con `confrelid = 'public.products'::regclass` para listar toda llave foránea hacia `products`. Se corre **antes** de activar la función; si devuelve filas, se vuelve a la spec (RF-9).
2. **`verify_products_delete_access.sql`** (solo lectura): muestra `relrowsecurity` de `public.products` y `storage.objects`, y las políticas de `pg_policies` de ambas. Permite saber qué hay hoy antes de cambiar nada.
3. **`products_delete_policies.sql`**: crea, de forma idempotente (`drop policy if exists` + `create policy`), dos políticas `for delete to authenticated`: una sobre `public.products` y otra sobre `storage.objects` con `bucket_id = 'products'`. No toca políticas de lectura, inserción ni actualización. **No** activa RLS por su cuenta (ver riesgo en §7).

## 4. Lógica de borrado (`deleteProductWithFiles`)

Firma: `deleteProductWithFiles(id) → { status: "deleted" | "not_found", failedFiles: number }`. Lanza `Error` si no se pudo eliminar el producto (conexión, permisos): en ese caso **no** se tocó ningún archivo.

Se lee el producto **desde la base**, no desde el formulario, porque el formulario puede tener cambios sin guardar (por ejemplo, fotos "quitadas" que todavía figuran en la base).

```
fn deleteProductWithFiles(id):
  # 1. Leer lo registrado hoy en la base
  row = select id, image, info_pdf, video_url, images from products where id = :id (maybeSingle)
  if error: throw
  if row is null: return { status: "not_found", failedFiles: 0 }

  # 2. Borrar el producto primero (RF-5: el producto desaparece antes que los archivos)
  deleted = delete from products where id = :id, devolviendo id
  if error: throw
  if deleted vacío:
      # Con RLS, un borrado denegado no da error: devuelve 0 filas. Hay que distinguir.
      still = select id from products where id = :id (maybeSingle)
      if still: throw Error("sin permiso")        # existe pero no se pudo borrar
      return { status: "not_found", failedFiles: 0 }   # lo borró otra persona en el medio

  # 3. Recolectar rutas de Storage (RF-5)
  urls  = [row.image, row.info_pdf, row.video_url, ...row.images]
  paths = unique(urls.map(u => storagePathFromUrl(u, "products")).filter(notNull))
  # video externo, null y vacíos quedan afuera por storagePathFromUrl

  # 4. Excluir archivos que otro producto también use (RF-5)
  failed = 0
  toRemove = []
  for path in paths:
      url = publicUrl(path)
      try:
          shared = select id from products
                   where image = url or info_pdf = url or video_url = url or images @> {url}  (limit 1)
          if error: throw
          if shared: continue            # otro producto lo usa: se omite, no es fallo
          toRemove.push(path)
      catch: failed++                    # no se pudo verificar: no se borra (conservador)

  # 5. Borrar en Storage en un solo llamado
  if toRemove no vacío:
      { data, error } = storage.from("products").remove(toRemove)
      if error: failed += toRemove.length
      else:     failed += toRemove.length - data.length   # RLS denegado = menos filas devueltas

  log(console.error) detalle de fallos
  return { status: "deleted", failedFiles: failed }
```

`storagePathFromUrl(url, bucket)`:

```
fn storagePathFromUrl(url, bucket):
  if url vacío or no es string: return null
  marker = "/storage/v1/object/public/" + bucket + "/"
  parsed = try new URL(url) catch return null
  if parsed.origin != origin de VITE_SUPABASE_URL: return null
  if parsed.pathname no contiene marker: return null
  return decodeURIComponent(parsed.pathname.después de marker)
```

La comprobación de origen evita tratar como archivo propio una URL externa que casualmente tenga la misma forma. Se quita el `?v=` o cualquier parámetro porque se usa solo `pathname`.

La verificación de archivos compartidos corre **después** de borrar el producto, así que el propio producto ya no cuenta y no hace falta excluirlo. Para el filtro `images @> {url}` se usa el operador `cs` de PostgREST dentro de `.or(...)`, con la URL entre comillas dobles.

## 5. Interfaz

### Jerarquía y estado

```
ProductForm
 ├─ <form> ... (sin cambios)
 │    └─ Botones [Actualizar] [Cancelar?]
 │    └─ (solo isEdit) Zona de peligro:  [Eliminar producto]   ← fuera del flujo de submit (type="button")
 └─ <DeleteProductDialog open productName deleting error onCancel onConfirm />
```

Estado nuevo en `ProductForm`:

- `savedName`: nombre cargado desde la base en `loadProduct` (así el diálogo no muestra un nombre editado sin guardar).
- `showDeleteDialog` (bool) y `deleting` (bool).

El botón "Eliminar producto" va **debajo** de los botones de guardar, separado por un borde superior y con estilo de advertencia (`btn btn-outline btn-error` o equivalente con clases Tailwind rojas), con ícono y texto, para no depender solo del color (RF-1). Solo se renderiza si `isEdit`. Va fuera de los botones de envío y con `type="button"`, para que no dispare el `submit` ni la validación del formulario.

### `DeleteProductDialog`

Props: `open`, `productName`, `deleting`, `onCancel`, `onConfirm`. Estado propio: `text`.

- Usa `<dialog className="modal modal-bottom sm:modal-middle">` de DaisyUI abierto con `showModal()` en un `useEffect` según `open`, y `close()` al cerrar. `showModal()` ya atrapa el foco y habilita Escape de forma nativa.
- `modal-box` con `max-h-[90dvh] overflow-y-auto` para que quepa con el teclado abierto en mobile (RF, no funcional).
- Contenido: título "Eliminar producto"; nombre del producto en un elemento con `break-words` (RF-2, nombre largo); advertencia de acción **permanente e irreversible** con ícono de alerta y texto (no solo color) que menciona que se borran imágenes, ficha y video; etiqueta "Para confirmar, escribí «eliminar producto»"; `<input>` con foco automático al abrir, `autoComplete="off"`; botones "Cancelar" y "Eliminar" (rojo).
- "Eliminar" está `disabled` mientras `!isDeletePhraseValid(text) || deleting`. Al estar `deleting` muestra spinner (`loading loading-spinner`) y texto "Eliminando…".
- **Escape y clic fuera (RF-6):** se escucha el evento `cancel` del `<dialog>`; si `deleting`, se hace `preventDefault()`. El clic fuera se implementa con el `<form method="dialog" className="modal-backdrop">` de DaisyUI solo cuando `!deleting`. "Cancelar" queda `disabled` si `deleting`.
- Al abrirse, `text` se reinicia a `""` (RF-3).
- Enter dentro del input dispara `onConfirm` solo si la frase es válida y no está `deleting`.

### Handler en `ProductForm`

```
fn handleDelete():
  if deleting: return
  deleting = true
  try:
      result = await deleteProductWithFiles(id)
      if result.status == "not_found":
          alert("Este producto ya no existe. Volvemos al listado.")
      else if result.failedFiles > 0:
          alert("Producto eliminado, pero algunos archivos no pudieron borrarse del almacenamiento.")
      else:
          alert("Producto eliminado")
      navigate("/admin/products")
  catch err:
      console.error(err)
      alert("No pudimos eliminar el producto. Revisá tu conexión o tu sesión e intentá de nuevo.")
      # el diálogo se mantiene abierto; el producto sigue existiendo (RF-6)
  finally:
      deleting = false
```

`navigate` remonta `Products`, que vuelve a cargar su lista en estado inicial: cumple RF-7 sin código adicional.

### Guardar sobre un producto ya eliminado (caso límite)

En `handleSubmit`, rama `isEdit`, el `update(...).select().single()` devuelve `PGRST116` cuando no encuentra la fila. Se agrega en el `catch` antes del `alert` genérico:

```
if error.code == "PGRST116":
    existe = select id from products where id = :id (maybeSingle)
    if existe es null:
        alert("Este producto fue eliminado y ya no existe.")
        navigate("/admin/products"); return
```

Si la fila existe, sigue el mensaje genérico (el `PGRST116` se debió a otra causa). Esta rama no cubre los archivos que se hubieran subido antes del `update`; es un caso muy poco frecuente y queda dentro del alcance excluido de limpieza de huérfanos.

### Responsive

Todo el diálogo usa el patrón `modal-bottom` en mobile (hoja desde abajo) y `modal-middle` desde `sm`; botones apilados o `w-full` en pantallas chicas; área táctil mínima de 44 px (`btn` de DaisyUI ya cumple). El botón de la zona de peligro ocupa todo el ancho, como los botones de guardar.

## 6. Integraciones y manejo de errores

| Situación | Resultado | RF |
|---|---|---|
| Producto no encontrado al empezar | `not_found` → aviso + listado | RF-6, casos límite |
| Borrado de la fila falla (red/permisos/sesión) | `throw`, nada de Storage se toca, diálogo abierto, `alert` genérico | RF-6 |
| Borrado denegado por RLS (0 filas) | Se distingue de "ya eliminado" con una relectura | RF-6, RF-8 |
| Fila borrada, falla algún archivo | `failedFiles > 0` → aviso genérico + listado; detalle en consola | RF-6 |
| Archivo usado por otro producto | Se omite sin contar fallo | RF-5 |
| No se puede verificar si es compartido | Se omite y cuenta como fallo (conservador) | RF-5, RF-6 |
| Video externo / URL de otro origen | Se ignora | RF-5 |
| Doble clic | `deleting` y botón deshabilitado | RF-6 |
| Sesión vencida | Cae en "borrado falla" → error genérico | RF-6 |

Estados de carga: `deleting` deshabilita "Eliminar" y "Cancelar", muestra spinner y bloquea Escape y clic fuera.

## 7. Decisiones técnicas y riesgos

1. **Borrar la fila antes que los archivos** (spec RF-5): el catálogo nunca muestra un producto con archivos ya borrados. Descartado: borrar archivos primero (un fallo dejaría un producto visible con imágenes rotas).
2. **Leer el producto de la base y no del formulario**: el formulario puede tener fotos "quitadas" sin guardar o un nombre editado. Descartado: usar el estado del formulario (borraría o dejaría archivos equivocados).
3. **Sin transacción entre base y Storage**: no hay backend propio. Descartado: función de base de datos o Edge Function que lo haga atómico (agrega infraestructura nueva sin necesidad; el caso de fallo parcial ya está aceptado en la spec).
4. **Verificación de archivos compartidos por URL exacta**, después de borrar la fila. Descartado: buscar por prefijo de nombre (riesgo de borrar archivos de otro producto, resuelto en la spec).
5. **`dialog` nativo con DaisyUI** en lugar de librería de modales: no suma dependencias y da foco atrapado y Escape.
6. **`alert()`** para avisos, como el resto del panel (decisión de la spec).
7. **Políticas solo `for delete to authenticated`**: mínimo necesario para RF-8 sin tocar lectura, inserción ni actualización.

**Riesgo principal (RF-8):** se desconoce si RLS está activo hoy en `products` y en Storage. Hay dos escenarios y el script de verificación los distingue antes de aplicar nada:

- *RLS activo sin política de borrado:* hoy nadie puede borrar. Se agregan las políticas del script 3 y funciona.
- *RLS desactivado:* hoy **cualquiera con la clave pública podría borrar**. Activar RLS rompería lecturas públicas si faltan políticas de `select`. En ese caso el script 3 no alcanza y hay que definir con la persona responsable, y fuera de este código, un conjunto completo de políticas. Se decide en el momento, con el resultado del script 2 a la vista.

## 8. Estrategia de verificación

Automática: `npm run lint` y `npm run build` sin errores (el proyecto no tiene tests).

Manual (con `npm run dev`, producto de prueba creado para la ocasión, con imagen, fotos adicionales y ficha; probar también con video subido y con video externo):

- **RF-1:** el botón aparece al editar; no aparece en "Agregar producto"; el listado no tiene acción de eliminar. En mobile ocupa el ancho y se distingue de "Actualizar".
- **RF-2:** el diálogo muestra el nombre completo (probar un nombre largo), advertencia de irreversibilidad y mención de archivos; Cancelar, Escape y clic fuera cierran sin borrar.
- **RF-3:** "Eliminar" deshabilitado hasta escribir la frase; acepta `ELIMINAR PRODUCTO` y ` eliminar producto `; rechaza `eliminar producto.`, `eliminarproducto`, `eliminar  producto`; al reabrir el campo está vacío; funciona pegando texto.
- **RF-4:** tras eliminar, el producto no está en el panel, el catálogo, el inicio ni su línea; `/producto/<código>` muestra "Producto no encontrado"; la línea sigue existiendo.
- **RF-5:** en el panel de Storage, los archivos del producto desaparecieron; un video externo no genera error ni aviso; un archivo compartido a propósito entre dos productos (pegando la misma URL) se conserva.
- **RF-6:** simular error (modo sin conexión del navegador): el producto sigue, el diálogo queda abierto, hay mensaje; durante la eliminación Escape, clic fuera y Cancelar no responden; doble clic no duplica. Simular fallo parcial denegando temporalmente la política de Storage: aviso de archivos no borrados.
- **RF-7:** vuelve al listado en la página 1 sin búsqueda, con el aviso "Producto eliminado" y sin el producto.
- **RF-8:** sin sesión, un `DELETE` directo contra la API de `products` y de Storage con la clave pública es rechazado (probar con `curl` y con la sesión cerrada); con sesión funciona.
- **RF-9:** correr `verify_products_references.sql`; el resultado debe estar vacío o analizarse antes de continuar.
- **Casos límite:** dos pestañas con el mismo producto: eliminar en una y luego "Actualizar" y "Eliminar" en la otra → aviso de producto inexistente y vuelta al listado.
