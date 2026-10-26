-- Verificaciones de la auditoría de seguridad (solo lectura, no modifica nada).
-- Ejecutar en Supabase → SQL Editor, una consulta por vez (seleccionar y "Run selected").
-- Informe: security-reports/2026-10-26-security-audit.md (SEC-001, SEC-002, SEC-003).

-- 1) ¿Qué tablas de public tienen RLS activo?  (SEC-001)
--    Esperado: rls_activo = true en TODAS. Las que den false son editables por cualquiera con la clave pública.
select c.relname as tabla, c.relrowsecurity as rls_activo
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relrowsecurity, c.relname;

-- 2) Políticas vigentes en public y storage.  (SEC-001 / SEC-002)
--    Revisar: que insert/update/delete sean solo 'authenticated' y que ninguna política de escritura incluya 'anon' o {public}.
select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, cmd, policyname;

-- 3) Permisos directos de anon sobre tablas (los GRANT cuentan además del RLS).  (SEC-001)
--    Con RLS activo, anon con INSERT/UPDATE/DELETE queda frenado por las políticas; sin RLS, pasa.
select table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and grantee = 'anon'
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
order by table_name, privilege_type;

-- 4) Configuración de los buckets de Storage.  (SEC-003)
--    Revisar: public, file_size_limit (null = sin tope) y allowed_mime_types (null = cualquier tipo).
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
order by name;

-- 5) Usuarios registrados.  (SEC-002)
--    Cada cuenta de esta lista tiene permisos de administrador con las políticas actuales.
--    Si aparece alguna que no reconocés, hay registro abierto en uso.
select id, email, created_at, last_sign_in_at, is_anonymous
from auth.users
order by created_at;
