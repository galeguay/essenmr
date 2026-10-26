-- Código Essen de producto: obligatorio y único.
-- IMPORTANTE: correr antes 2026-10-24_verify_essen_id_before_unique.sql (ambas consultas deben dar vacío),
-- de lo contrario esta migración falla.
-- Ejecutar una vez en Supabase → SQL Editor.
alter table public.products
    alter column essen_id set not null;

alter table public.products
    add constraint products_essen_id_key unique (essen_id);

comment on column public.products.essen_id is 'Código Essen: obligatorio, numérico y único';
