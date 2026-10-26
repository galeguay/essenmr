-- Verificación de reglas de acceso para borrar productos (solo lectura, no modifica nada).
-- Ejecutar en Supabase → SQL Editor ANTES de 2026-10-24_products_delete_policies.sql.
--
-- 1) Estado de RLS. Interpretación de "rls_activo":
--    - true  → ya hay RLS. Si no existe una política de DELETE, hoy nadie puede borrar:
--              alcanza con correr 2026-10-24_products_delete_policies.sql.
--    - false → SIN RLS: cualquiera con la clave pública podría borrar. No alcanza el script de
--              políticas: hay que definir primero un conjunto completo de políticas
--              (lectura pública, escritura solo autenticados) antes de activar RLS.
select n.nspname as esquema, c.relname as tabla, c.relrowsecurity as rls_activo
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where (n.nspname, c.relname) in (('public', 'products'), ('storage', 'objects'));

-- 2) Políticas vigentes sobre ambas tablas.
select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where (schemaname, tablename) in (('public', 'products'), ('storage', 'objects'))
order by schemaname, tablename, cmd, policyname;
