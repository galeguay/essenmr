# Plan técnico — Spec 002: Código de producto único y obligatorio

Cubre RF-1 a RF-8 de [spec.md](./spec.md). No se agregan rutas ni páginas: el cambio vive en el formulario de producto del panel (`/admin/products/new` y `/admin/products/:id`) y en la base de datos de Supabase.

## 1. Estructura de módulos

| Archivo | Cambio | RF |
|---|---|---|
| `src/utils/productCode.js` (nuevo) | Funciones puras: `normalizeProductCode(raw)` y `validateProductCodeFormat(raw)`. Sin acceso a red. | RF-1, RF-2, RF-3 |
| `src/lib/products.js` (nuevo) | `findProductByCode(code, excludeId)`: consulta a Supabase y devuelve `{ id, name }` o `null`; lanza error si la consulta falla. | RF-4, RF-5, RF-6 |
| `src/pages/admin/ProductForm.jsx` | Estado de error/verificación del código, validación en `onBlur`, validación previa en `handleSubmit`, traducción del error de base. | RF-1 a RF-7 |
| `sql/2026-10-24_verify_essen_id_before_unique.sql` (nuevo) | Consulta de solo lectura: vacíos y duplicados. | RF-8 |
| `sql/2026-10-24_products_essen_id_unique.sql` (nuevo) | Migración: `not null` + restricción `unique`. | RF-7 |
| `AI_PROJECT_CONTEXT.md` | Dejar asentado que `essen_id` es obligatorio y único. | — |

No se tocan el catálogo ni las páginas públicas: los datos ya están limpios y las direcciones no cambian.

## 2. Modelo de datos

Tabla `public.products`, columna `essen_id` (hoy `bigint`, nullable, sin unicidad).

Ejemplo de fila válida:

```json
{ "id": 87, "name": "Sartén 24 cm", "essen_id": 123, "product_line": 3 }
```

**Verificación previa (RF-8)**, solo lectura, se corre justo antes de migrar:

```sql
-- Productos sin código
select id, name from public.products where essen_id is null;

-- Códigos repetidos
select essen_id, count(*) as cantidad, array_agg(name order by name) as productos
from public.products
where essen_id is not null
group by essen_id
having count(*) > 1;
```

**Migración (RF-7)**, se ejecuta una vez en Supabase → SQL Editor, solo si ambas consultas dieron vacío:

```sql
alter table public.products
    alter column essen_id set not null;

alter table public.products
    add constraint products_essen_id_key unique (essen_id);

comment on column public.products.essen_id is 'Código Essen: obligatorio, numérico y único';
```

La restricción `unique` crea un índice, de modo que la consulta de duplicados del formulario también es rápida. Los errores de Postgres que debe manejar el formulario: `23505` (duplicado) y `23502` (vacío).

## 3. Diseño de la interfaz

Todo ocurre en el campo "Código Essen" de `ProductForm`. No hay componentes nuevos.

**Estado nuevo:**
- `codeError`: texto del error o `""`.
- `codeChecking`: `true` mientras se consulta la base.

**Comportamiento del campo:**
1. `type="text"` con `inputMode="numeric"` para mostrar teclado numérico en mobile, `required` y `maxLength` generoso. Al escribir solo se limpia `codeError`; no se valida en cada tecla.
2. **Al salir del campo (`onBlur`)** (RF-3, RF-4, RF-6):
   - Normaliza el valor (recorta espacios y quita ceros a la izquierda) y lo escribe de vuelta en el campo.
   - Valida el formato; si falla, muestra el error y no consulta.
   - Si es válido, consulta duplicados y muestra el nombre del producto que lo usa.
3. **Botón Guardar** deshabilitado mientras `loading || codeChecking` (RF-4).
4. **Mensaje:** debajo del campo, con `role="alert"`, borde del input en rojo (`input-error` de DaisyUI) **y** un ícono/texto, no solo color (accesibilidad). En mobile el texto ocupa todo el ancho y puede partirse en líneas.

**Mensajes (español rioplatense):**
- Vacío: "El código es obligatorio."
- Formato: "El código solo puede contener números."
- Largo: "El código no puede tener más de 15 dígitos."
- Duplicado: "Este código ya lo usa el producto «{nombre}»."
- Falla de conexión: "No pudimos verificar el código. Revisá tu conexión e intentá de nuevo."

## 4. Algoritmos

**Normalización y formato (`productCode.js`)** — RF-1, RF-2, RF-3:

```
normalizeProductCode(raw):
    s = String(raw ?? "").trim()
    if s matches /^\d+$/:  return s sin ceros a la izquierda (si queda vacío, "0")
    return s              // no se corrige nada más (RF-2)

validateProductCodeFormat(raw):
    s = String(raw ?? "").trim()
    if s == "":               return "El código es obligatorio."
    if s no matches /^\d+$/:  return "El código solo puede contener números."
    if normalize(s).length > 15: return "El código no puede tener más de 15 dígitos."
    return ""
```

**Verificación de duplicado (`products.js`)** — RF-4, RF-5, RF-6:

```
findProductByCode(code, excludeId):
    query = supabase.from("products").select("id, name").eq("essen_id", Number(code))
    if excludeId: query = query.neq("id", excludeId)
    { data, error } = await query.limit(1).maybeSingle()
    if error: throw error
    return data   // { id, name } o null
```

**Flujo de `handleSubmit`** — RF-5, RF-7. Se agrega al inicio, antes de subir cualquier archivo:

```
code = normalizeProductCode(product.essen_id)
setProduct(essen_id = code)
formatError = validateProductCodeFormat(code)
if formatError: setCodeError(formatError); return        // sin subir nada
try:
    dup = await findProductByCode(code, isEdit ? id : null)
catch:
    setCodeError(mensaje de conexión); return             // falla cerrada
if dup: setCodeError(mensaje de duplicado con dup.name); return
... (subida de archivos y guardado, como hoy)
catch (error) al guardar:
    if error.code == "23505": setCodeError(mensaje de duplicado genérico)   // carrera entre dos personas
    else: alert(...) como hoy
```

Para la carrera entre dos personas, el producto que ganó no se conoce, por lo que el mensaje de `23505` es genérico: "Este código ya lo usa otro producto." Los archivos ya subidos en ese caso extremo quedan huérfanos; es un caso muy poco probable que se acepta (la spec cubre el caso común, donde la verificación previa evita la subida).

El `normalizeNumber(product.essen_id)` existente en `handleSubmit` se mantiene: recibe el valor ya normalizado.

## 5. Integraciones y manejo de errores

- **Supabase (consulta):** usa el cliente existente (`src/lib/supabase.js`). Falla de red o permisos → se informa y no se guarda (RF-7).
- **Supabase (guardado):** `23505` se traduce a mensaje de duplicado; `23502` no debería ocurrir (el formulario ya lo valida) y cae en el `alert` actual.
- **Estados de carga:** `codeChecking` para la verificación del campo, `loading` para el guardado; ambos deshabilitan el botón.
- **Las políticas de acceso de Supabase** ya permiten leer `products` desde el panel (el listado y la edición lo hacen hoy); no se esperan cambios.

## 6. Decisiones técnicas

| Decisión | Justificación | Alternativas descartadas |
|---|---|---|
| Código tratado como número (sin ceros a la izquierda) | La columna es `bigint` y todo el sistema lo usa como número (ordenamiento, direcciones). | Cambiar la columna a texto: migración mayor, fuera del alcance. |
| Límite de 15 dígitos | Entra con holgura en `bigint` y en el entero seguro de JavaScript (16 dígitos), evitando pérdida de precisión en `Number()`. | Sin límite: puede fallar al guardar o redondear el valor. |
| Validación en `onBlur` + al guardar | Aviso temprano sin perder trabajo (decidido en la spec). | Solo al guardar; validar en cada tecla (muchas consultas). |
| Consulta explícita antes de subir archivos | Evita archivos huérfanos (RF-5). | Confiar solo en el error de la base: subiría archivos antes de fallar. |
| Restricción en la base además del frontend | Protege contra carga simultánea y accesos que evitan el panel (RF-7). | Solo validación en el frontend. |
| Funciones puras en `src/utils/` y consulta en `src/lib/` | Sigue la estructura del proyecto y deja la lógica separada del componente. | Todo dentro de `ProductForm.jsx`, que ya es grande. |
| Falla cerrada si no se puede verificar | Priorizar la integridad de los datos. | Guardar igual y confiar en la base: el mensaje sería técnico. |

## 7. Estrategia de verificación

Automática (no hay tests configurados):

```
npm run lint
npm run build
```

Checklist manual por RF (con `npm run dev`, en desktop y mobile):

- [ ] **RF-1:** guardar con el código vacío → no guarda y muestra "obligatorio".
- [ ] **RF-2:** escribir `12a45`, `12 345`, `12-345` → rechaza con el mensaje de números; escribir 16 dígitos → rechaza por largo.
- [ ] **RF-3:** escribir ` 123 ` → se guarda como `123`; escribir `00123` → el campo muestra `123` al salir.
- [ ] **RF-4:** escribir un código existente y salir del campo → aviso con el nombre del producto; mientras consulta, Guardar está deshabilitado; corregir el código → el aviso desaparece.
- [ ] **RF-5:** escribir un código existente y apretar Guardar sin salir del campo → no guarda; verificar en el storage que no se subieron archivos nuevos.
- [ ] **RF-6:** editar un producto sin tocar el código → guarda sin avisos; cambiarlo por el de otro producto → aviso.
- [ ] **RF-7:** correr la migración; intentar insertar un duplicado desde el SQL Editor → error `23505`; simular carga simultánea abriendo dos pestañas con el mismo código → la segunda muestra el mensaje de repetido; cortar la conexión y probar → no guarda y avisa.
- [ ] **RF-8:** correr las dos consultas de verificación previa → ambas vacías antes de migrar.
