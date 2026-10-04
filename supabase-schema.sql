-- Ostéo Pratik — base centrale Supabase
-- À exécuter une seule fois dans l'éditeur SQL du projet Supabase.

create table if not exists public.osteo_techniques (
  id bigint primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.osteo_techniques enable row level security;

drop policy if exists "osteo_public_read" on public.osteo_techniques;
create policy "osteo_public_read"
on public.osteo_techniques
for select
to anon, authenticated
using (true);

drop policy if exists "osteo_admin_insert" on public.osteo_techniques;
create policy "osteo_admin_insert"
on public.osteo_techniques
for insert
to authenticated
with check (true);

drop policy if exists "osteo_admin_update" on public.osteo_techniques;
create policy "osteo_admin_update"
on public.osteo_techniques
for update
to authenticated
using (true)
with check (true);

drop policy if exists "osteo_admin_delete" on public.osteo_techniques;
create policy "osteo_admin_delete"
on public.osteo_techniques
for delete
to authenticated
using (true);

create or replace function public.osteo_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists osteo_techniques_set_updated_at on public.osteo_techniques;
create trigger osteo_techniques_set_updated_at
before update on public.osteo_techniques
for each row execute function public.osteo_set_updated_at();
