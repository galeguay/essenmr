-- Reglas de acceso de productos: lectura pública; alta, edición y borrado solo con sesión iniciada.
-- Ejecutar una vez en Supabase → SQL Editor, DESPUÉS de revisar los resultados de
-- 2026-10-24_verify_products_references.sql y 2026-10-24_verify_products_delete_access.sql.
--
-- Contexto: public.products no tenía ninguna política (RLS desactivado), por lo que cualquiera con la
-- clave pública podía modificar o borrar productos. Este script activa RLS y define las políticas
-- necesarias para que el sitio público (lectura) y el panel admin (sesión iniciada) sigan funcionando.
-- Si algo falla tras ejecutarlo, revertir con:  alter table public.products disable row level security;
--
-- Storage: solo agrega la política de borrado del bucket 'products' para usuarios con sesión
-- (las políticas existentes de lectura, alta y edición de ese bucket no se tocan).

-- 1) public.products
alter table public.products enable row level security;

drop policy if exists "Lectura pública de productos" on public.products;
create policy "Lectura pública de productos"
    on public.products
    for select
    to anon, authenticated
    using (true);

drop policy if exists "Autenticados pueden crear productos" on public.products;
create policy "Autenticados pueden crear productos"
    on public.products
    for insert
    to authenticated
    with check (true);

drop policy if exists "Autenticados pueden editar productos" on public.products;
create policy "Autenticados pueden editar productos"
    on public.products
    for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists "Autenticados pueden borrar productos" on public.products;
create policy "Autenticados pueden borrar productos"
    on public.products
    for delete
    to authenticated
    using (true);

-- 2) storage.objects (bucket 'products')
drop policy if exists "Autenticados pueden borrar archivos de productos" on storage.objects;
create policy "Autenticados pueden borrar archivos de productos"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'products');
