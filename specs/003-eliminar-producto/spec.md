# Spec 003 — Eliminar producto

## 1. Contexto y objetivo

Hoy el panel de administración permite crear y editar productos, pero no eliminarlos. Si un producto se cargó por error, se discontinuó o quedó duplicado, la administradora/or no tiene forma de sacarlo del catálogo y debe pedir ayuda externa para borrarlo directamente en la base de datos.

**Objetivo:** permitir que la administradora/or elimine **de forma permanente** un producto desde su pantalla de edición, exigiendo una verificación explícita (escribir textualmente "eliminar producto") para evitar borrados accidentales. Al eliminarlo se intentan borrar también los archivos que el producto usa (imágenes, ficha PDF y video subido), para no dejar archivos huérfanos.

## 2. Usuarios

- **Administradora/or del panel:** es quien elimina productos y confirma la acción.
- **Visitante público:** no interactúa con esta funcionalidad, pero un producto eliminado deja de aparecer en el catálogo y su página deja de estar disponible.

## 3. Historias de usuario

- Como administradora/or, quiero eliminar un producto que ya no se vende o que cargué por error, para que deje de aparecer en el catálogo.
- Como administradora/or, quiero tener que escribir una frase de verificación antes de borrar, para no eliminar un producto por un clic accidental.
- Como administradora/or, quiero que se borren también las imágenes, la ficha y el video del producto, para no acumular archivos que ya no se usan.
- Como administradora/or, quiero recibir una confirmación clara cuando el producto fue eliminado, para saber que la operación terminó.
- Como visitante, quiero no ver productos eliminados en el catálogo, para no encontrarme con productos que ya no existen.

## 4. Requisitos funcionales

**RF-1 — Acceso a la acción de eliminar.**
- Cuando la administradora/or abra la pantalla de edición de un producto existente, el sistema debe mostrar una acción "Eliminar producto", claramente diferenciada de la acción de guardar (por ejemplo, con un estilo de advertencia).
- Cuando la administradora/or esté creando un producto nuevo (que todavía no existe), el sistema no debe mostrar la acción de eliminar.
- El sistema no debe ofrecer la acción de eliminar desde el listado de productos.

**RF-2 — Diálogo de confirmación.**
- Cuando la administradora/or active "Eliminar producto", el sistema debe abrir un diálogo que indique el nombre del producto a eliminar, advierta que la acción es **permanente e irreversible** y que también se borrarán sus imágenes, ficha y video.
- El nombre del producto debe mostrarse completo, con cortes de línea automáticos, de modo que un nombre largo nunca desborde ni corte el diálogo, incluso en pantallas chicas.
- El diálogo debe incluir un campo de texto donde se pida escribir "eliminar producto" para confirmar, y las opciones "Cancelar" y "Eliminar".
- Cuando la administradora/or elija "Cancelar", cierre el diálogo (por ejemplo, con la tecla Escape o haciendo clic fuera) o abandone el flujo sin confirmar, el sistema no debe eliminar nada y debe dejar la pantalla de edición como estaba.

**RF-3 — Verificación por frase.**
- Mientras el texto ingresado no coincida con la frase "eliminar producto", el sistema debe mantener deshabilitada la opción "Eliminar" del diálogo.
- Cuando el texto ingresado coincida con la frase, el sistema debe habilitar la opción "Eliminar".
- Para comparar, el sistema debe ignorar diferencias entre mayúsculas y minúsculas y los espacios al inicio y al final del texto. No debe tolerar otras diferencias (letras faltantes, errores de tipeo, espacios intermedios de más).
- Cuando el diálogo se vuelva a abrir, el campo de texto debe estar vacío.

**RF-4 — Eliminación permanente.**
- Cuando la administradora/or confirme la eliminación con la frase correcta, el sistema debe borrar el producto de forma permanente.
- Una vez eliminado, el sistema no debe ofrecer ninguna forma de recuperarlo ni de deshacer la acción.
- Una vez eliminado, el producto no debe aparecer en el listado del panel, ni en el catálogo público, ni en la página de inicio, ni en los listados de su línea de productos.
- Cuando alguien intente abrir la página pública de un producto eliminado (por ejemplo, desde un enlace guardado), el sistema debe mostrar el mensaje "Producto no encontrado" que esa página ya muestra hoy para un producto inexistente, sin cambios en la página pública.
- Si la eliminación deja a una línea de productos sin productos, la línea debe seguir existiendo y su página pública debe mostrar lo que hoy muestra una línea sin productos. No se requiere aviso ni tratamiento especial.

**RF-5 — Intento de borrado de archivos asociados.**
- Cuando se elimine un producto, el sistema debe intentar borrar del almacenamiento los archivos subidos que el producto tiene registrados en ese momento: imagen principal, imágenes adicionales, ficha PDF y video (solo si es un archivo subido).
- Si el video es un enlace externo (por ejemplo, YouTube, Instagram o TikTok), el sistema debe ignorarlo: no hay nada que borrar.
- El sistema debe borrar solo los archivos registrados en los campos del producto, sin importar cómo se llamen, y no debe buscar otros archivos por nombre o por código.
- Antes de borrar cada archivo, el sistema debe verificar que ningún otro producto lo use. Si otro producto lo usa, el sistema debe omitir ese archivo y no considerarlo un fallo.
- El sistema debe eliminar primero el producto y recién después sus archivos, de modo que un fallo con los archivos no deje al producto visible en el catálogo.

**RF-6 — Fallos parciales y errores.**
- Si el producto se elimina pero uno o más archivos no se pueden borrar, el sistema debe considerar al producto eliminado, llevar a la administradora/or al listado y mostrar un aviso genérico indicando que el producto fue eliminado pero algunos archivos no pudieron borrarse del almacenamiento. El detalle técnico no se muestra (queda disponible solo en la consola del navegador).
- Si no se puede eliminar el producto (por ejemplo, por un problema de conexión, de permisos o por sesión vencida), el sistema no debe borrar ningún archivo, debe conservar el producto, mantener la pantalla de edición abierta y mostrar un mensaje de error comprensible, sin detalles técnicos. No hay un tratamiento especial para la sesión vencida más allá de este comportamiento.
- Mientras la eliminación esté en curso, el sistema debe mostrar un indicador de carga, deshabilitar las acciones del diálogo (para evitar doble envío) y mantener inactivos "Cancelar", la tecla Escape y el clic fuera del diálogo. Fuera de ese momento, el diálogo se cierra con normalidad.

**RF-7 — Resultado para la administradora/or.**
- Cuando la eliminación termine con éxito, el sistema debe mostrar un aviso de confirmación con el mismo estilo de avisos que usa hoy el panel (mensaje emergente del navegador), por ejemplo "Producto eliminado", y llevar a la administradora/or al listado de productos del panel.
- El listado de productos mostrado debe reflejar el cambio (sin el producto eliminado), sin necesidad de recargar manualmente la página. El listado se muestra en su estado inicial (primera página, sin búsqueda), igual que al terminar de guardar una edición.

**RF-8 — Acceso restringido.**
- El sistema debe permitir eliminar productos únicamente a quien haya iniciado sesión en el panel de administración.
- La base de datos y el almacenamiento deben rechazar el borrado de productos y de sus archivos cuando la solicitud no provenga de una sesión iniciada, sin importar el origen de la operación (panel, acceso directo).
- Debe existir un script, guardado junto a los scripts del proyecto, que deje definidas esas reglas de acceso y permita verificarlas.

**RF-9 — Preparación y verificación previa.**
- Antes de activar la función, debe existir una consulta de verificación, guardada junto a los scripts del proyecto, que liste si alguna otra tabla referencia a los productos.
- Si la consulta revela referencias de otras tablas hacia productos, la función no debe activarse hasta revisar esta spec y decidir cómo tratarlas.

## 5. Requisitos no funcionales

- **Responsive/mobile:** el diálogo de confirmación y la acción de eliminar deben usarse sin dificultad en pantallas chicas: el diálogo debe caber en pantalla, el campo de texto ser fácil de tocar y las opciones "Cancelar" y "Eliminar" no quedar tapadas por el teclado.
- **Rendimiento:** la eliminación de un producto con varios archivos no debe bloquear la interfaz; debe haber un indicador visible mientras se procesa.
- **SEO:** la página pública de un producto eliminado no debe quedar disponible; el catálogo no debe seguir enlazando a ella.
- **Accesibilidad:** el diálogo debe poder operarse con teclado (abrir, escribir, confirmar, cancelar con Escape fuera del proceso de eliminación), llevar el foco al campo de texto al abrirse y comunicar claramente que la acción es destructiva. La advertencia no debe depender solo del color.
- **Idioma:** todos los textos en español rioplatense, coherentes con el resto del panel.

## 6. Casos límite

- **Frase con diferencias de formato:** "ELIMINAR PRODUCTO" y "  eliminar producto " deben aceptarse; "eliminar producto.", "eliminarproducto" y "eliminar  producto" no.
- **Texto pegado:** si se pega la frase, debe validarse igual que si se escribiera.
- **Producto sin archivos o con video externo:** si el producto no tiene imágenes, ficha ni video subido, o su video es un enlace externo, la eliminación debe completarse con normalidad, sin avisos de fallo.
- **Archivo usado por otro producto:** si un archivo del producto también lo usa otro producto, se omite su borrado y no se avisa como fallo.
- **Producto ya eliminado:** si otra persona lo eliminó antes y la pantalla de edición estaba abierta desde antes, al intentar eliminar o guardar el sistema debe informar que el producto ya no existe y llevar al listado, sin mostrar un error técnico.
- **Doble envío:** un doble clic en "Eliminar" no debe provocar dos operaciones ni mensajes de error.
- **Cambios sin guardar:** si la administradora/or editó campos del formulario y luego elimina el producto, los cambios sin guardar se pierden sin pedir confirmación adicional (la confirmación por frase ya cubre la acción).
- **Cierre o recarga durante la eliminación:** si se cierra la pestaña en medio de la operación, el producto puede quedar eliminado con archivos sin borrar; no se espera recuperación automática.
- **Reutilización del código:** tras eliminar un producto su código vuelve a estar disponible. Si el borrado de sus archivos falló y se crea otro producto con el mismo código el mismo día, los nombres de archivo podrían coincidir. Es un riesgo aceptado de muy baja probabilidad, sin tratamiento especial.
- **Mobile:** con el teclado abierto, las opciones del diálogo deben seguir accesibles.
- **Productos destacados o en promoción en el inicio:** un producto eliminado deja de aparecer también allí.

## 7. Fuera de alcance

- Eliminar productos desde el listado del panel o eliminar varios productos a la vez.
- Papelera, "deshacer", archivado u ocultamiento temporal (no existe recuperación).
- Eliminar líneas de productos u otros contenidos (preguntas frecuentes, anuncios).
- Registro de auditoría o historial de quién eliminó qué.
- Limpieza de archivos huérfanos que no figuren hoy en los campos del producto: los que hayan quedado de eliminaciones anteriores, de imágenes reemplazadas en ediciones pasadas o de fallos parciales.
- Redirecciones o páginas especiales para enlaces a productos eliminados, y mejoras a la pantalla "Producto no encontrado". La administradora/or es responsable de revisar anuncios o enlaces propios que apunten al producto eliminado.
- Conservar la búsqueda o la página del listado al volver tras eliminar.
- Evitar la sobrescritura de archivos con nombre coincidente al subir.
- Tratamiento específico de la sesión vencida (reautenticación).
- Diferenciar permisos entre administradoras/es (hoy todas/os las/os que acceden al panel pueden eliminar).

## 8. Criterios de finalización

- La acción "Eliminar producto" aparece solo al editar un producto existente y no en el alta ni en el listado.
- El diálogo exige la frase "eliminar producto" (sin distinguir mayúsculas ni espacios en los extremos) para habilitar la eliminación, y muestra el nombre completo del producto.
- Al confirmar, el producto desaparece del panel, del catálogo, del inicio y de su línea, y su página pública muestra "Producto no encontrado".
- Los archivos subidos que el producto tenía registrados se borran del almacenamiento, sin afectar a otros productos ni a enlaces externos.
- Los fallos totales y parciales se informan con mensajes comprensibles, y un fallo al borrar el producto no elimina sus archivos.
- Tras eliminar, se vuelve al listado con un aviso de confirmación.
- Sin sesión iniciada, la base y el almacenamiento rechazan el borrado; el script de reglas y la consulta de verificación de referencias existen junto a los scripts del proyecto.
- Funciona en desktop y mobile, y `npm run lint` y `npm run build` pasan sin errores.

## 9. Dudas abiertas

Ninguna.
