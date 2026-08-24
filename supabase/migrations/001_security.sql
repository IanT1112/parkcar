-- Ejecutar con Supabase CLI o en SQL Editor. Revisa primero en un proyecto de prueba.
alter table public.pruebas enable row level security;
alter table public.comentarios enable row level security;

revoke all on table public.pruebas from anon, authenticated;
revoke all on table public.comentarios from anon, authenticated;
grant select, insert on table public.pruebas to authenticated;
grant insert on table public.comentarios to authenticated;

alter table public.pruebas
  alter column user_id set not null;
alter table public.comentarios
  alter column user_id set not null,
  alter column comentario set not null,
  alter column valoracion set not null;

alter table public.comentarios
  add constraint comentarios_longitud_check
    check (char_length(btrim(comentario)) between 1 and 1000),
  add constraint comentarios_valoracion_check
    check (valoracion between 1 and 5);

create index if not exists pruebas_user_created_idx
  on public.pruebas (user_id, created_at desc);
create index if not exists comentarios_user_created_idx
  on public.comentarios (user_id, created_at desc);

drop policy if exists "users_select_own_pruebas" on public.pruebas;
create policy "users_select_own_pruebas" on public.pruebas
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "users_insert_own_pruebas" on public.pruebas;
create policy "users_insert_own_pruebas" on public.pruebas
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "users_insert_own_comments" on public.comentarios;
create policy "users_insert_own_comments" on public.comentarios
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and email = (select auth.jwt() ->> 'email')
  );

-- Impide spam básico incluso si se llama directamente a la API de Supabase.
create or replace function public.limit_comment_frequency()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.comentarios
    where user_id = new.user_id
      and created_at > now() - interval '10 seconds'
  ) then
    raise exception 'Espera antes de enviar otro comentario';
  end if;
  return new;
end;
$$;

revoke all on function public.limit_comment_frequency() from public;
drop trigger if exists comentarios_rate_limit on public.comentarios;
create trigger comentarios_rate_limit
before insert on public.comentarios
for each row execute function public.limit_comment_frequency();
