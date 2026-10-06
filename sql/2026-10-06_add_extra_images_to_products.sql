-- Fotos adicionales por producto (además de la imagen principal `image`).
-- Ejecutar una vez en Supabase → SQL Editor.
alter table public.products
    add column if not exists images text[] not null default '{}';

comment on column public.products.images is 'URLs públicas de fotos adicionales del producto (galería)';
