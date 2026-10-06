-- Video de presentación de cada línea (archivo en Storage, YouTube, Instagram o TikTok).
-- Ejecutar una vez en Supabase → SQL Editor.
alter table public.product_lines
    add column if not exists video_url text;

comment on column public.product_lines.video_url is 'URL del video de la línea (archivo en Storage, YouTube, Instagram o TikTok)';
