# Plan técnico 001 — Home: carga ordenada y efectos reversibles

Cubre RF-1 a RF-10 de `spec.md`. Sin cambios de esquema (no hay SQL). Sin dependencias nuevas.

## 0. Hallazgos del código que condicionan el diseño

1. **`Promotions.jsx` no consulta datos**: es una imagen estática (`tarjetas.webp`) con `loading="lazy"`. Lo que "llega tarde" es la imagen, no un dato. RF-4, RF-5 y RF-10 siguen valiendo: se reserva el espacio de la imagen y la sección queda fuera de la condición de "todo listo".
2. **Los enlaces de `NavBar.jsx` y `NewReleaseCard.jsx` son `<a href>`** (recarga completa de la página), mientras que `ProductCard.jsx` usa `<Link>` (navegación SPA). Un caché solo en memoria de módulo se pierde con las recargas, así que RF-6 necesita además `sessionStorage`.
3. **`PublicLayout.jsx` renderiza `Navbar` y `Footer` fuera del `Home`**. Para cumplir "no mostrar barra ni pie antes de tiempo" (RF-1) la pantalla de carga debe ser una capa fija que los cubra, no un cambio dentro de `Home`.
4. **La causa del desorden actual:** `Home` renderiza al instante `Promotions` y el resto, mientras `discounts`/`newProducts`/`announcements` llegan por consultas separadas. Las secciones de abajo aparecen primero y empujan lo de arriba cuando llegan los datos.
5. **`NewReleaseCard.jsx` no reserva alto de imagen** (`h-auto`) y `AnnouncementBanner.jsx` tampoco. `ProductCard.jsx` ya reserva (`aspect-square`).

## 1. Estructura de módulos

| Archivo | Cambio | RF |
|---|---|---|
| `src/lib/homeData.js` (nuevo) | Consultas a Supabase movidas desde `Home.jsx` + caché de módulo y de `sessionStorage` | RF-2, RF-3, RF-6 |
| `src/hooks/useHomeLoad.js` (nuevo) | Orquesta carga: datos + imágenes de la primera pantalla + tope de 4 s + umbral de 300 ms. Devuelve `{ data, phase }` | RF-1, RF-2, RF-3, RF-4 |
| `src/hooks/useHomeScroll.js` (nuevo) | Guarda y restaura el scroll, y resuelve el ancla | RF-6, RF-10 |
| `src/components/HomeLoader.jsx` (nuevo) | Capa fija con logo e indicador, desvanecimiento de salida | RF-1 |
| `src/components/Reveal.jsx` | Observer bidireccional, `prefers-reduced-motion` y tope de retraso | RF-7, RF-8, RF-9 |
| `src/index.css` | Duración 0,9 s en `.reveal`; transición de salida inmediata; animación del indicador | RF-7 |
| `src/pages/public/Home.jsx` | Usa los hooks, quita `useEffect`/`fetch*` locales, escalonado `index * 100` con tope | RF-1 a RF-8 |
| `src/components/NewReleaseCard.jsx` | Reserva el alto de la imagen con proporción fija | RF-5 |
| `src/components/Promotions.jsx` | Reserva el espacio de la imagen con `aspect-ratio` | RF-4, RF-5 |

No se modifica `PublicLayout.jsx`, `NavBar.jsx` ni `Footer.jsx`.

## 2. Modelo de datos

Sin cambios en Supabase ni PocketBase. Las consultas son las mismas que hoy, movidas a `homeData.js`:

- `announcements` (`is_active = true`, orden `sort_order`, `created_at`).
- `products` con `discount > 0` y `is_visible = true`, con `product_line (*)`.
- `products` con `is_new = true` más los de la línea "Combos", sin duplicados.

**Caché en `sessionStorage`** (clave `essenmr:home:v1`), guarda los datos crudos:

```json
{
  "savedAt": 1761300000000,
  "announcements": [{ "id": 1, "image_url": "…", "expiration_date": "2026-11-01T18:30:00Z" }],
  "discounts": [{ "id": 7, "essen_id": "ABC", "discount": 20, "image": "…", "product_line": { "name": "…" } }],
  "newProducts": [{ "id": 9, "essen_id": "XYZ", "is_new": true, "image": "…" }]
}
```

- Vigencia: **5 minutos** (`savedAt`). Pasado ese tiempo se ignora y se vuelve a consultar.
- El filtro de anuncios por fecha (`starts_at`/`expiration_date`) se aplica **al leer**, no al guardar, para que un anuncio vencido no reaparezca desde el caché.
- Si `sessionStorage` falla (modo privado, cuota), se usa solo el caché de módulo, dentro de `try/catch`.

## 3. Diseño de la interfaz

### 3.1 Fases de carga (RF-1 a RF-4)

`useHomeLoad` expone una fase:

| Fase | Significado | Qué se ve |
|---|---|---|
| `ready-cache` | Hay caché vigente | Home directo, sin capa (RF-6) |
| `loading` | Esperando datos / imágenes | Capa fija; el home está montado pero invisible |
| `done` | Condición de RF-2 cumplida o 4 s vencidos | Capa se desvanece y se desmonta |

Jerarquía:

```
<Home>
  <Seo/>                            (siempre montado: RF NFR SEO)
  <HomeLoader visible={phase==='loading'} />   fixed inset-0 z-[100]
  <div ref={contentRef} inert/aria-hidden mientras loading, opacity-0>
    <AnnouncementBanner/>* · Descuentos · Novedades · CTAs · medios de pago · <Promotions/>
  </div>
</Home>
```

- **Capa de carga:** `fixed inset-0 z-[100] bg-white`, por encima de la barra (`z-50`). Está opaca **desde el primer render** para tapar barra y pie (RF-1); el **logo y el indicador aparecen recién a los 300 ms** (decisión de "aparición diferida"). Si la carga termina antes, la persona solo vio un fondo claro de menos de 300 ms. El logo reutiliza `logo_blanco.webp`; como es blanco, se usa sobre un fondo naranja del tema (el mismo de la barra) y no blanco. **Fondo de la capa: `bg-orange-600`.** Se indica con `role="status"` y texto `sr-only` "Cargando".
- **Bloqueo de scroll** mientras `loading`: `document.body.style.overflow = 'hidden'` (se restaura en la limpieza, igual que en `Promotions`).
- **Contenido oculto pero con layout:** se usa `opacity-0` + `inert` (no `display:none`) para poder medir posiciones e iniciar la carga de las imágenes visibles.

### 3.2 Condición "todo listo" (RF-2, RF-3)

Pseudocódigo de `useHomeLoad`:

```
al montar:
  si caché vigente → data = caché; fase = 'ready-cache' (sin refresco en segundo plano: se renueva al vencer los 5 min)
  si no:
    t0 = ahora; fase = 'loading'
    timeout4s = setTimeout(() => fase = 'done', 4000)
    results = await Promise.allSettled([announcements, discounts, newProducts])
    data = valores cumplidos (los rechazados quedan en [] y se loguean)
    guardar caché solo si las 3 se cumplieron
    esperar a que React pinte el contenido (requestAnimationFrame x2)
    imgs = todas las <img> dentro de contentRef
              cuyo getBoundingClientRect().top < window.innerHeight
    await Promise.all(imgs.map(img => img.complete ? ok : esperar load|error))
    → fase = 'done' (cancela timeout4s)
timeout4s dispara → fase = 'done' aunque falten datos o imágenes
```

- Un `Promise.allSettled` evita que una consulta fallida bloquee a las otras (RF-3).
- Las imágenes de la primera pantalla se miden **por posición** (RF-2: "alto de la ventana"), no por conjunto fijo. Las que llegan tarde (o después del tope) se incorporan solas porque el espacio ya está reservado (RF-5).
- Las `<img loading="lazy">` dentro de la ventana cargan igual; las de más abajo siguen en diferido.
- Datos que llegan **después** del tope: el hook sigue escuchando la promesa y hace `setData` al resolverse, sin cambiar de fase.
- `error` de una imagen se trata como "lista" para no bloquear (caso límite).

### 3.3 Umbral de 300 ms (RF-1)

```
const [showLogo, setShowLogo] = useState(false)
useEffect(() => { const t = setTimeout(() => setShowLogo(true), 300); return () => clearTimeout(t) }, [])
```

La capa opaca ya está, el logo se muestra sólo si `showLogo`. Al terminar: `opacity-0` con `transition-opacity duration-300`, y se desmonta tras 300 ms.

### 3.4 Efectos reversibles (`Reveal.jsx`, RF-7, RF-8, RF-9)

```
umbrales = [0, 0.15]; rootMargin = '0px 0px -40px 0px'
callback(entry):
  si entry.intersectionRatio >= 0.15 → visible = true
  si no, si !entry.isIntersecting y entry.boundingClientRect.top > 0   // salió por abajo
        → visible = false
  // salió por arriba (top <= 0) → no hace nada: queda como estaba
si matchMedia('(prefers-reduced-motion: reduce)') → visible = true; no se crea el observer
delay efectivo = Math.min(delay, 400) solo mientras visible; al ocultarse, transitionDelay = 0
```

- No se llama a `observer.disconnect()` tras la primera visibilidad: el observer queda activo para poder reiniciar.
- El rango entre 0 y 0,15 funciona como histéresis, así no hay parpadeo en el borde (caso límite de subidas y bajadas rápidas).
- El estado oculto de `up` (`translateY(32px)`) lo desplaza hacia abajo, lo que aleja al elemento del área visible: no genera un ciclo de reinicio.
- En `index.css`: `.reveal` pasa a `0.9s` en opacidad y transformación (RF-7). Al ocultarse se aplica la transición con el mismo valor, pero fuera de pantalla no se percibe.
- En la restauración de scroll (RF-8) los componentes ya están montados con `visible=false`, se animan al entrar.

### 3.5 Escalonado (RF-7)

En `Home.jsx`: `delay={Math.min((index % 4) * 100, 400)}` para descuentos. Para las novedades no hay escalonado (cada una entra por su cuenta con su efecto, como hoy). `Reveal` también aplica el tope de 400 ms por seguridad.

### 3.6 Reserva de espacio (RF-5)

- **`NewReleaseCard`:** el contenedor de la imagen pasa a `aspect-[4/3]` en móvil y `sm:aspect-auto sm:self-stretch` en escritorio, con la imagen en `object-contain`. Hoy el alto lo dicta la imagen (`h-auto`); con proporción fija el alto es predecible. **Cambio visual leve** (el contenedor `bg-stone-50` puede mostrar bandas si la imagen no es 4:3): se valida visualmente (Fase 6).
- **`Promotions`:** se fija el `aspect-ratio` del `<img>` con el ancho/alto reales de `tarjetas.webp` (se leen al implementar) y se mantiene `loading="lazy"`. Hasta que llegue la imagen, el botón conserva su alto.
- **`ProductCard`:** ya reserva (`aspect-square`), sin cambios.
- **`AnnouncementBanner`:** sus imágenes están en la primera pantalla, así que la capa las espera (RF-2). No se modifica.

### 3.7 Visitas repetidas y scroll (RF-6, RF-10)

`useHomeScroll`:

```
al montar: history.scrollRestoration = 'manual'; al desmontar: = 'auto'
mientras el home está visible: guardar window.scrollY en sessionStorage('essenmr:home:scroll'), con throttle de 150 ms
cuando la fase pasa a 'done' o 'ready-cache' (antes del desvanecimiento):
  si hay hash en la URL → scrollIntoView(hash) con behavior 'auto'
  si no, si fue navegación atrás/adelante → window.scrollTo(0, scrollGuardado)
  si no → scroll arriba
```

- "Atrás/adelante": `useNavigationType() === 'POP'` tras una navegación SPA, o, en la carga inicial del documento, `performance.getEntriesByType('navigation')[0].type === 'back_forward'`.
- El hash de "Ver promociones financieras" se resuelve contra el espacio ya reservado de `#promociones` (RF-10). El `setTimeout(300)` actual se elimina.
- El enlace del mismo home (`onClick` con `scrollIntoView({behavior:'smooth'})`) se mantiene.

## 4. Integraciones y manejo de errores

- **Supabase:** tres consultas en paralelo, `Promise.allSettled`; un error se registra con `console.error` y esa sección queda vacía (no se muestra), como hoy.
- **Tope de 4 s:** `setTimeout` limpiado en el `cleanup` del efecto para no disparar al desmontar (importante con `StrictMode` en desarrollo, que monta dos veces: el efecto debe ser idempotente y cancelar la primera ejecución).
- **Datos tardíos:** se aplican con `setState` condicionado a `mounted` (bandera de cancelación).
- **Imágenes con error:** `onerror` cuenta como lista; `ProductCard` ya tiene imagen de reemplazo.
- **`sessionStorage`:** todas las lecturas/escrituras dentro de `try/catch`.
- **Sin `prefers-reduced-motion`:** además de `Reveal`, el CSS existente ya lo contempla; se agrega que la capa de carga se retire sin transición y que el indicador no anime.

## 5. Decisiones técnicas

| Decisión | Alternativas descartadas |
|---|---|
| Capa fija `z-[100]` sobre el layout, opaca desde el primer render | Mover el estado de carga a `PublicLayout`: acopla el layout a una sola página |
| Contenido montado pero `opacity-0` + `inert` durante la carga | `display:none`: impide medir qué imágenes están en la primera pantalla; no montarlo: añade un render extra y retrasa las imágenes |
| Medir imágenes por posición (`getBoundingClientRect`) | Lista fija de N imágenes: no se adapta a celular/escritorio (decisión del punto 3) |
| Caché en `sessionStorage` con vigencia de 5 min, además del de módulo | Solo módulo: se pierde con los `<a href>` de `NavBar`; `localStorage`: vigencia indefinida y datos viejos entre sesiones |
| `IntersectionObserver` con dos umbrales (histéresis) | Escuchar `scroll`: más costoso y propenso a parpadeos; resetear al salir por cualquier lado: contradice RF-8 |
| `allSettled` | `Promise.all`: una falla bloquearía todo |
| Proporción fija para `NewReleaseCard` | Guardar dimensiones de imagen en la base: requiere cambio de esquema fuera de alcance |
| Restauración de scroll manual | La automática del navegador corre antes de que haya contenido y queda arriba |

## 6. Estrategia de verificación

**Comandos:** `npm run lint` y `npm run build` sin errores.

**Checklist manual** (`npm run dev`, DevTools → Network → throttling):

- [ ] **RF-1:** con "Fast 3G" se ve el fondo naranja y, tras 300 ms, el logo con el indicador; barra y pie no aparecen. Con red normal el home aparece sin logo ni parpadeo. La capa se retira con desvanecimiento.
- [ ] **RF-2:** la capa se retira cuando las imágenes visibles ya están; las de más abajo cargan después.
- [ ] **RF-3:** con "Offline" o la consulta bloqueada, a los 4 s aparece el home con lo disponible y sin secciones fallidas. Al volver la red, el contenido tardío se incorpora sin recargar.
- [ ] **RF-4:** en el primer pantallazo no aparece nada de abajo antes que lo de arriba. `Promotions` no empuja el contenido.
- [ ] **RF-5:** con imágenes lentas, la altura de tarjetas, novedades y promociones no cambia al llegar (Performance → Layout Shift).
- [ ] **RF-6:** abrir un producto con `<Link>` (tarjeta) y volver con "atrás": sin capa y con el scroll restaurado. Repetir con un `<a href>` (Novedades) y con la barra. Pasados 5 minutos, vuelve a consultar.
- [ ] **RF-7:** efectos de 0,9 s, escalonado de 100 ms, máximo 400 ms en la grilla de descuentos.
- [ ] **RF-8:** bajar hasta Novedades, subir hasta Descuentos: Novedades vuelve a estado oculto y se anima al volver a bajar; lo que quedó arriba sigue visible.
- [ ] **RF-9:** con "Emular prefers-reduced-motion: reduce" no hay animaciones ni reinicios.
- [ ] **RF-10:** abrir `/#promociones` y usar "Ver promociones financieras": llega al espacio de Promociones apenas se retira la capa.
- [ ] **Móvil y escritorio:** repetir con el emulador de dispositivo.
- [ ] **StrictMode:** en desarrollo no se ven dos pantallas de carga ni se dispara el tope dos veces.
