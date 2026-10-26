-- Verificación previa a la migración 2026-10-24_products_essen_id_unique.sql
-- Solo lectura. Ejecutar en Supabase → SQL Editor. Ambas consultas deben devolver cero filas.

-- Productos sin código
select id, name from public.products where essen_id is null;

-- Códigos repetidos (con los productos que los comparten)
select essen_id, count(*) as cantidad, array_agg(name order by name) as productos
from public.products
where essen_id is not null
group by essen_id
having count(*) > 1;
