-- Límites de tamaño y tipo en los buckets de Storage (auditoría 2026-10-26, SEC-003).
-- Ejecutar una vez en Supabase → SQL Editor, DESPUÉS de revisar los archivos existentes con:
--   select bucket_id, metadata->>'mimetype' as tipo, count(*) as archivos,
--          pg_size_pretty(max((metadata->>'size')::bigint)) as el_mas_grande
--   from storage.objects group by bucket_id, metadata->>'mimetype' order by bucket_id, archivos desc;
-- Ajustar los números si algún archivo legítimo los supera.
--
-- Los límites solo afectan a subidas nuevas; los archivos que ya están no se tocan.
-- Los tipos salen de lo que aceptan los formularios del panel (accept=): imágenes, PDF y video mp4/webm/mov.
-- Se excluye a propósito image/svg+xml y text/html: pueden contener scripts.
-- Nota: el plan de Supabase tiene un tope global por archivo (50 MB en el plan gratuito); un límite mayor no lo supera.

-- images (promociones y banners): solo imágenes
update storage.buckets
set file_size_limit = 5 * 1024 * 1024,   -- 5 MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
where id = 'images';

-- products: imágenes, ficha en PDF y video
update storage.buckets
set file_size_limit = 50 * 1024 * 1024,  -- 50 MB (por los videos)
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
                               'application/pdf', 'video/mp4', 'video/webm', 'video/quicktime']
where id = 'products';

-- product_lines: imágenes y video
update storage.buckets
set file_size_limit = 50 * 1024 * 1024,  -- 50 MB (por los videos)
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
                               'video/mp4', 'video/webm', 'video/quicktime']
where id = 'product_lines';
