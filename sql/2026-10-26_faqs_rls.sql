-- Reglas de acceso de faqs: lectura pública; alta, edición y borrado solo con sesión iniciada.
-- Ejecutar una vez en Supabase → SQL Editor.
--
-- Contexto (auditoría 2026-10-26, SEC-001): public.faqs tenía RLS desactivado, por lo que cualquiera
-- con la clave pública podía crear, modificar o borrar preguntas frecuentes.
-- Si algo falla tras ejecutarlo, revertir con:  alter table public.faqs disable row level security;

-- 0) Antes de activar: revisar que el contenido actual sea el esperado (alguien pudo haberlo alterado).
-- select * from public.faqs order by id;

alter table public.faqs enable row level security;

drop policy if exists "Lectura pública de faqs" on public.faqs;
create policy "Lectura pública de faqs"
    on public.faqs
    for select
    to anon, authenticated
    using (true);

drop policy if exists "Autenticados pueden crear faqs" on public.faqs;
create policy "Autenticados pueden crear faqs"
    on public.faqs
    for insert
    to authenticated
    with check (true);

drop policy if exists "Autenticados pueden editar faqs" on public.faqs;
create policy "Autenticados pueden editar faqs"
    on public.faqs
    for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists "Autenticados pueden borrar faqs" on public.faqs;
create policy "Autenticados pueden borrar faqs"
    on public.faqs
    for delete
    to authenticated
    using (true);
