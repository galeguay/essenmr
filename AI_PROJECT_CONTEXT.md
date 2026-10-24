# Contexto del proyecto para IA

## Nombre del proyecto
- `essen_mr`

## Descripción general
- Aplicación web front-end construida con React y Vite.
- Incluye una parte pública para usuarios finales y un panel de administración.
- Utiliza Tailwind CSS + DaisyUI para estilos.
- Integra PocketBase para autenticación/datos y Supabase como dependencia presente en el proyecto.

## Stack principal
- React 19
- Vite
- Tailwind CSS 4
- DaisyUI
- React Router DOM 7
- PocketBase
- Supabase JS
- Bootstrap Icons

## Estructura principal
- `src/main.jsx`: punto de entrada de la aplicación.
- `src/App.jsx`: definición de rutas principales.
- `src/routes/RootLayout.jsx`: selecciona layout público o admin según la ruta.
- `src/routes/PublicLayout.jsx`: layout para la parte pública.
- `src/routes/AdminLayout.jsx`: layout para el panel admin.
- `src/lib/pocketbase.js`: instancia de PocketBase y manejo de authStore.
- `src/lib/supabase.js`: cliente Supabase.
- `src/utils/uploadImage.js`: utilitario para carga de imágenes.
- `src/lib/homeData.js`: consultas del home (anuncios, descuentos, novedades) en paralelo y caché de 5 min (memoria + `sessionStorage`).
- `src/hooks/useHomeLoad.js`: orquesta la carga del home (datos + imágenes de la primera pantalla, tope de 4 s).
- `src/hooks/useHomeScroll.js`: guarda/restaura el scroll del home y resuelve anclas.
- `src/components/HomeLoader.jsx`: pantalla de carga (capa fija naranja con logo; el logo aparece a los 300 ms).
- `src/components/Reveal.jsx`: efectos de entrada; se reinician cuando el componente queda debajo de la pantalla (0,9 s, retraso máx. 400 ms, respeta `prefers-reduced-motion`).

## Páginas públicas
- `src/pages/public/Home.jsx` (se muestra detrás de `HomeLoader` hasta que carguen los datos y las imágenes de la primera pantalla; sin caché vigente puede demorar hasta 4 s)
- `src/pages/public/Catalog.jsx` (guía de líneas con productos de muestra)
- `src/pages/public/ProductsPage.jsx` (listado completo con filtros)
- `src/pages/public/ProductDetail.jsx`
- `src/pages/public/FaqList.jsx`
- `src/pages/public/AboutMe.jsx`

## Páginas admin
- `src/pages/admin/Login.jsx`
- `src/pages/admin/Products.jsx`
- `src/pages/admin/ProductLines.jsx`
- `src/pages/admin/ProductForm.jsx`
- `src/pages/admin/ProductLineForm.jsx`
- `src/pages/admin/PromotionsForm.jsx`
- `src/pages/admin/FaqForm.jsx`
- `src/pages/admin/Settings.jsx`

## Rutas principales
- `/` → `Home`
- `/catalogo` → `Catalog`
- `/productos` → `ProductsPage`
- `/producto/:essen_id` → `ProductDetail`
- `/faq` → `FaqList`
- `/about_me` → `AboutMe`
- `/admin/login` → `Login`
- `/admin/products` → `Products`
- `/admin/productLines` → `ProductLines`
- `/admin/products/new` → `ProductForm`
- `/admin/products/:id` → `ProductForm`
- `/admin/productLines/new` → `ProductLineForm`
- `/admin/productLines/:id` → `ProductLineForm`
- `/admin/promotions` → `PromotionsForm`
- `/admin/faq` → `FaqForm`
- `/admin/settings` → `Settings`

## Scripts disponibles
- `npm run dev` → arranca Vite en modo desarrollo.
- `npm run build` → genera la versión de producción.
- `npm run preview` → vista previa del build.
- `npm run lint` → ejecuta ESLint.

## Notas importantes
- Ficha PDF y video 9:16 por producto: columnas `products.info_pdf` y `products.video_url` (ver `sql/`), se muestran en la página del producto. El PDF se renderiza con `pdfjs-dist` cargado bajo demanda.
- Código de producto (`products.essen_id`): obligatorio, numérico (sin ceros a la izquierda, máx. 15 dígitos) y único. Se valida en `ProductForm` (`src/utils/productCode.js`, `src/lib/products.js`) y en la base con la restricción de `sql/2026-10-24_products_essen_id_unique.sql` (correr antes `sql/2026-10-24_verify_essen_id_before_unique.sql`).
- La app usa `document.documentElement.setAttribute("data-theme", "light")` al inicio para fijar tema claro.
- Las rutas admin se renderizan con `AdminLayout`, mientras el resto se muestra con `PublicLayout`.
- `src/lib/pocketbase.js` guarda token y usuario en `localStorage` y sincroniza auth state.
- El proyecto es privado (`private: true`) en `package.json`.
