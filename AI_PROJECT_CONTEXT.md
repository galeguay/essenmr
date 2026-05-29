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

## Páginas públicas
- `src/pages/public/Home.jsx`
- `src/pages/public/Catalog.jsx`
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
- La app usa `document.documentElement.setAttribute("data-theme", "light")` al inicio para fijar tema claro.
- Las rutas admin se renderizan con `AdminLayout`, mientras el resto se muestra con `PublicLayout`.
- `src/lib/pocketbase.js` guarda token y usuario en `localStorage` y sincroniza auth state.
- El proyecto es privado (`private: true`) en `package.json`.
