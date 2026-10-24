# Tareas 001 — Home: carga ordenada y efectos reversibles

Orden de dependencia. Cada tarea ≤ 30 min. Marcá `- [x]` al terminar.

## A. Base de datos y caché

- [x] **T1. Mover las consultas del home a `src/lib/homeData.js`.**
  Cubre: RF-2, RF-3. Tres funciones (anuncios, descuentos, novedades + combos) con las mismas consultas de `Home.jsx` y una función `loadHomeData()` con `Promise.allSettled` que devuelve `{ announcements, discounts, newProducts, allOk }`.
  Hecho cuando: el archivo exporta `loadHomeData()` y devuelve las tres listas con una consulta fallida simulada devolviendo `[]` sin lanzar error.

- [x] **T2. Caché de módulo + `sessionStorage` en `homeData.js`.**
  Cubre: RF-6. Clave `essenmr:home:v1`, vigencia de 5 min, todo en `try/catch`. Exporta `readHomeCache()` (devuelve `null` si venció o no hay) y guarda solo si `allOk`. El filtro de anuncios por fecha se aplica al leer.
  Hecho cuando: tras una carga, `sessionStorage` contiene la clave; con `savedAt` más viejo que 5 min, `readHomeCache()` devuelve `null`; un anuncio vencido no se devuelve desde el caché.

## B. Efectos

- [x] **T3. Duración y transición de salida en `index.css`.**
  Cubre: RF-7. `.reveal` a `0.9s` (opacidad y transformación); retraso de transición 0 en estado oculto; mantener el bloque `prefers-reduced-motion`.
  Hecho cuando: en DevTools `.reveal` muestra `0.9s` y con "reduce motion" sigue sin transición.

- [x] **T4. Reescribir `Reveal.jsx` con reinicio bidireccional.**
  Cubre: RF-8, RF-9, RF-7. Observer con umbrales `[0, 0.15]`, sin `disconnect` tras mostrarse; ocultar solo si salió por abajo; con `prefers-reduced-motion` queda visible sin observer; `delay` con tope de 400 ms aplicado solo al estar visible.
  Hecho cuando: en la consola del navegador, un `Reveal` visible pasa a `data-visible="false"` al sacarlo por abajo, no cambia al sacarlo por arriba, y con reduce motion siempre es `true`.

## C. Reserva de espacio

- [x] **T5. Reservar la imagen de `NewReleaseCard.jsx`.**
  Cubre: RF-5. Contenedor con `aspect-[4/3]` en móvil y alto completo en `sm+`, imagen `object-contain`.
  Hecho cuando: el alto de la tarjeta es el mismo con la imagen sin cargar (red bloqueada) que cargada.

- [x] **T6. Reservar la imagen de `Promotions.jsx`.**
  Cubre: RF-4, RF-5. Leer el ancho y alto reales de `tarjetas.webp` y fijar `aspect-ratio` en la imagen, manteniendo `loading="lazy"`.
  Hecho cuando: con la imagen bloqueada, la sección de Promociones ocupa el mismo alto que cargada.

## D. Pantalla de carga y orquestación

- [x] **T7. Crear `HomeLoader.jsx`.**
  Cubre: RF-1. Capa `fixed inset-0 z-[100] bg-orange-600` opaca desde el primer render; logo (`logo_blanco.webp`) con indicador sutil que aparece a los 300 ms; `role="status"` con texto `sr-only`; desvanecimiento de 300 ms al `visible=false`, luego se desmonta; sin animación con reduce motion.
  Hecho cuando: renderizada de forma aislada con `visible` verdadero muestra solo el fondo naranja y, a los 300 ms, el logo; al pasar a falso se desvanece y desaparece del DOM.

- [x] **T8. Crear `useHomeLoad.js`.**
  Cubre: RF-2, RF-3, RF-4, RF-6. Fases `ready-cache | loading | done`; usa el caché; `loadHomeData()`; mide las `<img>` dentro de la ventana y espera su `load`/`error`; tope de 4 s; aplica los datos tardíos sin cambiar de fase; cancelación idempotente para `StrictMode`.
  Hecho cuando: con red lenta devuelve `loading` hasta que lleguen datos e imágenes visibles; con las consultas bloqueadas pasa a `done` a los 4 s; con caché vigente arranca en `ready-cache`.

- [x] **T9. Crear `useHomeScroll.js`.**
  Cubre: RF-6, RF-10. `history.scrollRestoration = 'manual'` mientras el home está montado; guardado de `scrollY` con throttle; al terminar la carga resuelve ancla, restauración (atrás/adelante) o arriba.
  Hecho cuando: ir a un producto y volver con "atrás" deja el scroll donde estaba; abrir `/#promociones` llega a esa sección; una visita nueva empieza arriba.

## E. Integración en el home

- [x] **T10. Integrar todo en `Home.jsx`.**
  Cubre: RF-1 a RF-8. Quitar `useState`/`useEffect`/`fetch*` locales; usar `useHomeLoad` y `useHomeScroll`; montar `HomeLoader`; envolver el contenido en un contenedor `opacity-0` + `inert` mientras `loading`; bloquear el scroll del `body` mientras `loading`; escalonado `Math.min((index % 4) * 100, 400)` en descuentos; quitar el `setTimeout` del hash.
  Hecho cuando: el home carga en orden detrás de la capa, sin barra ni pie visibles hasta que termine, y sigue mostrando descuentos, novedades, anuncios y promociones.

- [x] **T11. Revisar el tope de 4 s, los datos tardíos y los casos límite.**
  Cubre: RF-3, RF-5. Probar con red lenta y consulta bloqueada; confirmar que una sección sin datos queda oculta y que lo tardío se incorpora sin salto.
  Hecho cuando: ninguna de esas pruebas muestra contenido parcial antes del retiro de la capa ni un desplazamiento visible del contenido al llegar datos o imágenes tardíos.

## F. Cierre

- [x] **T12. `npm run lint` y `npm run build`.**
  Cubre: todos los RF. Corregir errores introducidos por estos cambios.
  Hecho cuando: ambos comandos terminan sin errores.

- [x] **T13. Actualizar `AI_PROJECT_CONTEXT.md`.**
  Cubre: documentación. Agregar la descripción de la pantalla de carga del home, los hooks nuevos, `homeData.js` y el caché de sesión.
  Hecho cuando: `AI_PROJECT_CONTEXT.md` menciona los archivos nuevos y el comportamiento de carga y reinicio de efectos.
