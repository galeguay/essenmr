-- Prioridad de las líneas de producto: define el orden en que se presentan en el sitio.
-- Número más bajo = aparece primero. Las líneas con el mismo número se ordenan por nombre.
-- Ejecutar una vez en Supabase → SQL Editor.
alter table public.product_lines
    add column if not exists priority integer not null default 100;

comment on column public.product_lines.priority is 'Orden de presentación: menor número = aparece antes';
