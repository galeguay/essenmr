# Spec 002 — Código de producto único y obligatorio

## 1. Contexto y objetivo

Hoy cada producto tiene un "Código Essen" que lo identifica (se usa en la dirección de su página pública y como SKU). Sin embargo, el sistema no impide que dos productos tengan el mismo código, ni que un producto se guarde sin código. Esto puede provocar que una página de producto muestre otro producto distinto al esperado, o que el catálogo tenga datos ambiguos.

**Objetivo:** garantizar que el código de cada producto sea **obligatorio, numérico y único**, tanto avisando a quien administra el panel en el momento de cargarlo como protegiendo los datos de forma definitiva, de modo que no se puedan repetir aunque falle la validación visual.

## 2. Usuarios

- **Administradora/or del panel:** crea y edita productos. Es quien recibe los avisos de validación.
- **Visitante público:** no interactúa con esta funcionalidad, pero se beneficia: cada código lleva siempre a un único producto.

## 3. Historias de usuario

- Como administradora/or, quiero que el sistema me avise si el código que escribí ya pertenece a otro producto, para no crear duplicados por error.
- Como administradora/or, quiero ver qué producto ya usa ese código, para decidir si corresponde corregir el código o editar el producto existente.
- Como administradora/or, quiero que el código sea obligatorio, para no dejar productos sin identificar.
- Como visitante, quiero que cada código de producto lleve a un solo producto, para ver siempre el correcto.

## 4. Requisitos funcionales

**RF-1 — Código obligatorio.**
- Cuando la administradora/or intente guardar un producto sin código, el sistema debe impedir el guardado y mostrar un mensaje indicando que el código es obligatorio.

**RF-2 — Código numérico y de largo acotado.**
- Cuando el código ingresado contenga caracteres que no sean dígitos (incluidos espacios o guiones intermedios, como `12 345` o `12-345`), el sistema debe impedir el guardado y mostrar un mensaje indicando que el código solo puede contener números. El sistema no debe corregir el valor por su cuenta.
- Cuando el código supere los 15 dígitos, el sistema debe impedir el guardado y mostrar un mensaje indicando el largo máximo.

**RF-3 — Normalización.**
- Cuando el código ingresado tenga espacios al inicio o al final, el sistema debe ignorarlos al comparar y al guardar.
- Cuando el código ingresado tenga ceros a la izquierda (por ejemplo `00123`), el sistema debe considerarlo igual a su valor sin ceros (`123`). Al salir del campo, el sistema debe mostrar el valor normalizado en el propio campo, de modo que lo que se ve coincida con lo que se guarda y se compara.

**RF-4 — Aviso inmediato de duplicado.**
- Cuando la administradora/or salga del campo "Código Essen" con un valor que ya pertenece a otro producto, el sistema debe mostrar un aviso junto al campo indicando que el código ya existe y el nombre del producto que lo usa.
- Cuando el valor ingresado no pertenezca a otro producto, o cuando se corrija un valor que antes estaba repetido, el sistema debe quitar el aviso al salir nuevamente del campo.
- Mientras la verificación esté en curso, el sistema debe indicarlo y mantener deshabilitado el botón de guardar, sin bloquear la edición del resto del formulario.

**RF-5 — Verificación al guardar.**
- Cuando la administradora/or intente guardar un producto cuyo código ya pertenece a otro producto, el sistema debe impedir el guardado y mostrar el mismo aviso que en RF-4, aunque no haya salido del campo antes.
- El sistema debe realizar esta verificación antes de subir cualquier archivo (imagen, ficha, video), para que un rechazo no deje archivos huérfanos.

**RF-6 — Edición.**
- Cuando se edite un producto existente, el sistema debe excluir a ese mismo producto de la comparación, de modo que conservar su propio código no sea considerado un duplicado.
- Cuando se cambie el código de un producto existente por uno que ya usa otro producto, el sistema debe aplicar RF-4 y RF-5.

**RF-7 — Protección en la base de datos.**
- El sistema debe rechazar, a nivel de base de datos, cualquier intento de guardar un producto con un código ya existente, sin importar el origen de la operación (panel, carga masiva, acceso directo).
- El sistema debe rechazar, a nivel de base de datos, cualquier producto sin código.
- Si la base de datos rechaza un guardado por código duplicado (por ejemplo, por una carga simultánea de dos personas), el sistema debe mostrar el mismo mensaje de código repetido, no un error técnico.
- Si no se puede completar la verificación de duplicado (por ejemplo, por un problema de conexión), el sistema no debe guardar el producto y debe avisar que no pudo verificar el código.

**RF-8 — Preparación de datos existentes.**
- Antes de activar las restricciones de RF-7, debe existir una consulta de verificación, guardada junto a los scripts del proyecto, que liste los productos con códigos repetidos y los productos sin código.
- Mientras existan duplicados o vacíos en los datos, las restricciones de RF-7 no deben activarse.
- Estado actual: se verificó que no existen productos sin código y los duplicados fueron eliminados por la administradora/or. La consulta debe volver a correrse justo antes de aplicar la migración.

## 5. Requisitos no funcionales

- **Responsive/mobile:** los avisos junto al campo deben leerse correctamente en pantallas chicas, sin romper el diseño del formulario.
- **Rendimiento:** la verificación al salir del campo no debe sentirse lenta ni impedir seguir completando el formulario.
- **Accesibilidad:** el mensaje de error debe estar asociado visualmente al campo y distinguirse por algo más que el color.
- **SEO:** sin impacto; las direcciones de producto existentes no cambian.
- **Idioma:** mensajes en español rioplatense.

## 6. Casos límite

- Dos personas crean productos con el mismo código al mismo tiempo: gana la primera; la segunda recibe el mensaje de código repetido (RF-7).
- Se ingresa `00123` cuando ya existe `123`: se normaliza a `123` y se avisa duplicado (RF-3, RF-4).
- La verificación de duplicado falla por un problema de conexión: no se guarda y se avisa (RF-7).
- Se crea un producto copiando datos de otro y se olvida cambiar el código: lo detecta RF-5.
- Se edita un producto sin tocar el código: no debe aparecer ningún aviso de duplicado (RF-6).
- Se corrige un código repetido volviendo al valor original: el aviso desaparece al salir del campo (RF-4).
- El guardado es rechazado por duplicado: no quedan archivos subidos sin producto (RF-5).

## 7. Fuera de alcance

- Generación automática de códigos.
- Cambios en el formato de las direcciones públicas de producto.
- Conservar ceros a la izquierda (el código se trata como número).
- Unicidad de otros campos (nombre, línea, etc.).
- Importación o carga masiva de productos.
- Corrección automática de duplicados existentes.

## 8. Criterios de finalización

- No se puede guardar un producto sin código, con código no numérico, de más de 15 dígitos o con un código ya usado por otro producto, ni creando ni editando.
- El aviso de duplicado aparece al salir del campo y al guardar, indicando el producto que ya usa el código.
- La base de datos rechaza duplicados y vacíos aunque se evite el panel.
- Los datos existentes fueron revisados justo antes de la migración y no quedan duplicados ni vacíos.
- Editar un producto conservando su código funciona sin avisos falsos.
- Un guardado rechazado por duplicado no deja archivos subidos.

## 9. Dudas abiertas

Ninguna.
