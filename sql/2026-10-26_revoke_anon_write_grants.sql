-- Endurecimiento (auditoría 2026-10-26): quitar a anon los permisos de escritura sobre las tablas de public.
-- Ejecutar una vez en Supabase → SQL Editor.
--
-- Por qué: el RLS ya impide que anon escriba, pero los GRANT por defecto de Supabase le dejan INSERT/UPDATE/
-- DELETE/TRUNCATE. Si alguien desactiva el RLS por error, o con TRUNCATE (que el RLS no controla), anon podría
-- escribir. Con el revoke, la protección no depende de una sola capa.
--
-- No afecta al sitio público (solo lee, con SELECT) ni al panel admin (usa el rol authenticated, que no se toca).
-- Si algo falla, restaurar con:  grant insert, update, delete on public.<tabla> to anon;

revoke insert, update, delete, truncate on public.announcements from anon;
revoke insert, update, delete, truncate on public.faqs          from anon;
revoke insert, update, delete, truncate on public.product_lines from anon;
revoke insert, update, delete, truncate on public.products      from anon;
