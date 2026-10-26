-- Corrección de políticas que permitían escritura anónima (auditoría 2026-10-26, SEC-001 y SEC-003).
-- Ejecutar una vez en Supabase → SQL Editor.
--
-- Qué corrige:
--   A) public.product_lines: la política de UPDATE incluía el rol anon.
--   B) storage.objects: anon podía subir (INSERT) y sobreescribir (UPDATE) en los buckets 'images' y 'products'.
--   C) public.announcements: solo tenía lectura; el panel necesita escribir con sesión iniciada.
--
-- Lecturas: no se tocan (el sitio público las necesita, y las URLs públicas de los buckets no dependen de ellas).
-- Si algo falla tras ejecutarlo, revisar con: select * from pg_policies where schemaname in ('public','storage');

-- A) product_lines: actualizar solo con sesión iniciada
drop policy if exists "Allow update for authenticated users" on public.product_lines;
create policy "Autenticados pueden editar líneas de producto"
    on public.product_lines
    for update
    to authenticated
    using (true)
    with check (true);

-- B) Storage: subir y reemplazar archivos solo con sesión iniciada
drop policy if exists "anon 1ffg0oo_2" on storage.objects;  -- INSERT bucket images
drop policy if exists "anon 1ffg0oo_1" on storage.objects;  -- UPDATE bucket images
drop policy if exists "anon 1ifhysk_2" on storage.objects;  -- INSERT bucket products
drop policy if exists "anon 1ifhysk_1" on storage.objects;  -- UPDATE bucket products

drop policy if exists "Autenticados pueden subir archivos a images y products" on storage.objects;
create policy "Autenticados pueden subir archivos a images y products"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id in ('images', 'products'));

drop policy if exists "Autenticados pueden reemplazar archivos de images y products" on storage.objects;
create policy "Autenticados pueden reemplazar archivos de images y products"
    on storage.objects
    for update
    to authenticated
    using (bucket_id in ('images', 'products'))
    with check (bucket_id in ('images', 'products'));

-- C) announcements: alta, edición y borrado solo con sesión iniciada
drop policy if exists "Autenticados pueden crear anuncios" on public.announcements;
create policy "Autenticados pueden crear anuncios"
    on public.announcements
    for insert
    to authenticated
    with check (true);

drop policy if exists "Autenticados pueden editar anuncios" on public.announcements;
create policy "Autenticados pueden editar anuncios"
    on public.announcements
    for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists "Autenticados pueden borrar anuncios" on public.announcements;
create policy "Autenticados pueden borrar anuncios"
    on public.announcements
    for delete
    to authenticated
    using (true);
