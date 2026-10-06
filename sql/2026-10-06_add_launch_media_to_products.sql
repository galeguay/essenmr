-- Contenido de lanzamiento por producto: ficha/infografía en PDF y video vertical 9:16.
-- Ejecutar una vez en Supabase → SQL Editor.
alter table public.products
    add column if not exists info_pdf text,
    add column if not exists video_url text;

comment on column public.products.info_pdf is 'URL pública de la ficha / infografía en PDF';
comment on column public.products.video_url is 'URL del video vertical 9:16 (archivo en Storage, YouTube Shorts, Instagram o TikTok)';
