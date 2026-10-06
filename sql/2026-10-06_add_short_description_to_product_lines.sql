-- Descripción breve de cada línea (se muestra en la página de Catálogo).
-- La descripción larga (`description`) sigue usándose en la página de cada línea.
-- Ejecutar una vez en Supabase → SQL Editor.
alter table public.product_lines
    add column if not exists short_description text;

comment on column public.product_lines.short_description is 'Descripción breve de la línea (una o dos frases) para el Catálogo';
