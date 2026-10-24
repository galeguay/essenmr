# Spec 001 — Home: carga ordenada y efectos reversibles

## 1. Contexto y objetivo

**Problema.** Al entrar al home, la carga se ve desordenada: en el primer pantallazo aparecen primero los elementos de más abajo y al final los de más arriba. Además, los efectos de entrada se disparan al volverse visibles y, una vez ejecutados, no se repiten: si la persona sube, los componentes que quedaron debajo de la pantalla permanecen estáticos.

**Objetivo.** Que el home se muestre completo y en orden (de arriba hacia abajo) detrás de una pantalla de carga, sin saltos de contenido, y que los efectos de entrada, un poco más lentos y suaves que los actuales, se reinicien para los componentes que quedan debajo de la pantalla cuando la persona sube.

**Alcance.** Solo la parte pública, página de inicio (home).

## 2. Usuarios

- **Visitante público**: entra al home desde celular o escritorio, muchas veces con datos móviles.
- **Administradora/or del panel**: no tiene cambios propios; el contenido que cargue (anuncios, descuentos, novedades, promociones) debe seguir apareciendo igual.

## 3. Historias de usuario

- Como visitante, quiero ver una pantalla de carga y luego el home completo en orden, para no ver contenido desarmado ni que lo de abajo aparezca antes que lo de arriba.
- Como visitante, quiero que el home no quede bloqueado si algo tarda o falla, para poder navegar igual.
- Como visitante, quiero que al volver al home desde otra página no tenga que esperar de nuevo, para navegar con fluidez.
- Como visitante, quiero que al subir y volver a bajar las secciones se animen de nuevo, para que la navegación se sienta viva.
- Como visitante sensible al movimiento, quiero que se respete mi preferencia de "reducir movimiento", para no marearme con las animaciones.

## 4. Requisitos funcionales

**RF-1. Pantalla de carga.**
- Cuando el visitante abre el home y la carga demora más de 300 ms, el sistema debe mostrar una pantalla de carga que cubra toda la ventana, incluida la barra superior.
- La pantalla de carga debe mostrar el logo de Essen MR centrado con un indicador de progreso sutil sobre el fondo naranja de la marca (el mismo de la barra superior).
- Mientras la carga no termine, el sistema no debe mostrar fragmentos parciales del home, ni antes de los 300 ms ni durante la pantalla de carga. Esto incluye la barra superior, el pie de página y los anuncios.
- Cuando la carga termina antes de los 300 ms, el sistema debe mostrar el home directamente, sin pantalla de carga.

**RF-2. Condición de "todo listo".**
- Cuando hayan llegado los datos de anuncios, descuentos y novedades, y estén cargadas las imágenes que entran en el alto de la ventana del visitante al abrir el home, el sistema debe retirar la pantalla de carga con un desvanecimiento corto y mostrar el home completo.
- Las imágenes por debajo de la primera pantalla no deben demorar el retiro de la pantalla de carga.
- La sección de Promociones financieras no forma parte de la condición de "todo listo".

**RF-3. Tope de espera.**
- Si pasan 4 segundos desde que se abrió el home y la condición de RF-2 no se cumple, el sistema debe retirar la pantalla de carga y mostrar el home con lo que haya llegado.
- Si la consulta de una sección falló o no respondió dentro del tope, el sistema no debe mostrar esa sección (igual que hoy cuando una sección no tiene datos).
- Si una sección tiene los datos pero le faltan imágenes al llegar al tope, el sistema debe mostrarla con sus tarjetas y completar las imágenes cuando terminen de cargar.
- Los datos que lleguen después del tope deben incorporarse a la página sin recargarla.

**RF-4. Orden de aparición.**
- Cuando el home se muestra, las secciones deben presentarse en el orden en que están en la página, de arriba hacia abajo.
- El sistema no debe mostrar contenido de secciones inferiores antes que el de las superiores.
- Cuando Promociones financieras llegue después de que el home ya se muestre, el sistema debe incorporarla en su lugar, sin efecto de entrada, como hoy.

**RF-5. Sin saltos de contenido.**
- El sistema debe reservar el espacio de cada imagen según su proporción, para que su llegada tardía no cambie el alto de la tarjeta ni empuje el contenido.
- El sistema debe reservar el espacio de Promociones financieras mientras sus datos no hayan llegado.

**RF-6. Visitas repetidas en la misma sesión.**
- Cuando el visitante vuelve al home dentro de la misma sesión y los datos del home ya están en memoria, el sistema debe mostrar el home sin pantalla de carga.
- Cuando el visitante vuelve con el botón atrás/adelante del navegador, el sistema debe restaurar la posición de scroll en que estaba.

**RF-7. Efectos de entrada.**
- Cuando un componente con efecto entra en el área visible, el sistema debe animarlo con su efecto asignado (subir, izquierda, derecha, zoom o aparecer).
- Los efectos existentes se mantienen. No se agregan efectos nuevos ni se animan secciones que hoy no tienen efecto (Promociones financieras y pie de página quedan sin efecto).
- Cada efecto debe durar 0,9 s (hoy dura 0,7 s).
- El escalonado entre elementos de una misma lista debe ser de 100 ms por elemento, con un máximo de 400 ms acumulados.

**RF-8. Reinicio de efectos.**
- Cuando un componente ya animado queda por debajo del área visible porque la persona subió, el sistema debe devolverlo a su estado oculto inicial.
- Cuando ese componente vuelve a entrar en el área visible, el sistema debe repetir su animación.
- Cuando un componente sale del área visible por arriba (la persona ya lo pasó), el sistema debe mantenerlo visible, sin reiniciarlo.
- Cuando se restaura el scroll al volver con el botón atrás (RF-6), los componentes que queden por debajo del área visible deben mostrarse en estado oculto y animarse al entrar.

**RF-9. Reducir movimiento.**
- Si el sistema operativo o el navegador del visitante tiene activada la preferencia de reducir movimiento, el sistema debe mostrar todos los componentes visibles sin animaciones ni reinicios.

**RF-10. Enlaces internos del home.**
- Cuando el visitante llega al home con un ancla (por ejemplo, a Promociones financieras) o usa el enlace "Ver promociones financieras", el sistema debe desplazarse a esa sección apenas se retire la pantalla de carga.
- Si Promociones financieras aún no llegó, el sistema debe desplazarse hasta su espacio reservado.

## 5. Requisitos no funcionales

- **Responsive/mobile:** la pantalla de carga, las imágenes reservadas y los efectos deben funcionar y verse bien en celular y escritorio.
- **Rendimiento:** la pantalla de carga no debe extender la espera más allá de los 4 segundos de RF-3. Los efectos no deben provocar saltos de diseño ni trabarse en celulares de gama media.
- **SEO:** el título, la descripción y los metadatos del home deben estar presentes aunque se esté mostrando la pantalla de carga o el home todavía oculto.
- **Accesibilidad:** la pantalla de carga debe anunciarse como estado de carga a los lectores de pantalla; se respeta reducir movimiento (RF-9).

## 6. Casos límite

- Conexión muy lenta o sin red: se aplica el tope de 4 segundos y el home se muestra con lo que haya.
- Una consulta falla y las otras no: se muestran las secciones con datos y se oculta la que falló.
- Sin descuentos, sin novedades o sin anuncios: la sección correspondiente no se muestra, igual que hoy.
- Imagen de la primera pantalla que falla: no debe bloquear la salida de la pantalla de carga.
- La persona intenta hacer scroll mientras está la pantalla de carga: no debe ver contenido parcial ni perder la posición al retirarse la pantalla.
- Subidas y bajadas rápidas de scroll: los efectos no deben quedar a medio camino ni parpadear.
- Carga que termina justo en el umbral de 300 ms: no debe producirse un parpadeo de la pantalla de carga más allá del desvanecimiento.
- Llegada con ancla: ver RF-10.
- Volver al home con atrás/adelante: ver RF-6 y RF-8.
- Contenido que llega después del tope: se incorpora sin reiniciar la página ni saltar bruscamente (RF-5).

## 7. Fuera de alcance

- Agregar efectos nuevos o animar secciones que hoy no tienen efecto (incluidas Promociones financieras y el pie de página).
- Mensaje de error con botón "reintentar" cuando falla una consulta.
- Cambios en otras páginas públicas o en el panel de administración.
- Cambios en el contenido, textos o diseño de las tarjetas y secciones.
- Esqueletos (placeholders) por sección.

## 8. Criterios de finalización

- Al abrir el home con una conexión normal se ve el home completo en orden; con una conexión lenta, primero la pantalla de carga y luego el home completo, sin contenido parcial ni desordenado.
- Con una red lenta simulada, a los 4 segundos el home se muestra con lo disponible.
- Al volver al home dentro de la misma sesión, no hay pantalla de carga y se restaura el scroll.
- Al subir, los componentes que quedan debajo de la pantalla se reinician y se animan de nuevo al volver a entrar; los que quedan arriba permanecen visibles.
- Los efectos duran 0,9 s con escalonado de 100 ms (máximo 400 ms).
- Con "reducir movimiento" activado, no hay animaciones.
- Los enlaces con ancla del home siguen funcionando.
- Verificado en celular y escritorio por la persona responsable del proyecto.

## 9. Dudas abiertas

Ninguna.
