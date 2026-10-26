-- Verificación previa a la función "Eliminar producto" (solo lectura, no modifica nada).
-- Ejecutar en Supabase → SQL Editor ANTES de activar el borrado de productos.
-- Lista toda llave foránea de otras tablas que apunte a public.products.
-- Si devuelve filas, NO activar la función: revisar la spec (specs/003-eliminar-producto)
-- para decidir qué hacer con esas tablas al borrar un producto.
select
    con.conname                       as restriccion,
    con.conrelid::regclass            as tabla_que_referencia,
    pg_get_constraintdef(con.oid)     as definicion
from pg_constraint con
where con.contype = 'f'
  and con.confrelid = 'public.products'::regclass;
