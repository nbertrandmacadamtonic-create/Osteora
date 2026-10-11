-- ============================================================
-- OSTÉO PRATIK V18 — AUTHENTIFICATION PUBLIQUE + SÉCURITÉ RLS
-- À exécuter UNE FOIS dans Supabase > SQL Editor
-- AVANT de rendre l'inscription étudiante publique.
-- ============================================================

-- Administrateur actuel du back-office.
-- Cette adresse n'est pas un secret : les droits sont vérifiés côté Supabase.
create or replace function public.osteo_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email','')) = lower('nicolas.bertrand4@hotmail.fr');
$$;

revoke all on function public.osteo_is_admin() from public;
grant execute on function public.osteo_is_admin() to anon, authenticated;

-- ============================================================
-- 1. PROFILS UTILISATEURS
-- Compatible avec le back-office Utilisateurs V13.
-- ============================================================

create table if not exists public.osteo_user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text not null default '',
  last_name text not null default '',
  profile_type text not null default 'Étudiant en ostéopathie',
  school text not null default '',
  student_year text not null default '',
  subscription_status text not null default 'inactif',
  subscription_plan text not null default '',
  subscription_expires_at date,
  payment_status text not null default 'en_attente',
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.osteo_user_profiles
  add column if not exists email text,
  add column if not exists first_name text not null default '',
  add column if not exists last_name text not null default '',
  add column if not exists profile_type text not null default 'Étudiant en ostéopathie',
  add column if not exists school text not null default '',
  add column if not exists student_year text not null default '',
  add column if not exists subscription_status text not null default 'inactif',
  add column if not exists subscription_plan text not null default '',
  add column if not exists subscription_expires_at date,
  add column if not exists payment_status text not null default 'en_attente',
  add column if not exists admin_notes text not null default '',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.osteo_user_profiles enable row level security;

drop policy if exists "osteo_profiles_own_read" on public.osteo_user_profiles;
drop policy if exists "osteo_profiles_admin_read" on public.osteo_user_profiles;
drop policy if exists "osteo_profiles_admin_update" on public.osteo_user_profiles;
drop policy if exists "osteo_profiles_admin_delete" on public.osteo_user_profiles;

create policy "osteo_profiles_own_read"
on public.osteo_user_profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "osteo_profiles_admin_read"
on public.osteo_user_profiles
for select
to authenticated
using (public.osteo_is_admin());

create policy "osteo_profiles_admin_update"
on public.osteo_user_profiles
for update
to authenticated
using (public.osteo_is_admin())
with check (public.osteo_is_admin());

create policy "osteo_profiles_admin_delete"
on public.osteo_user_profiles
for delete
to authenticated
using (public.osteo_is_admin());

-- Création automatique du profil à partir de Supabase Auth.
create or replace function public.osteo_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.osteo_user_profiles (
    user_id,
    email,
    first_name,
    last_name,
    profile_type,
    subscription_status,
    payment_status,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name',''),
    coalesce(new.raw_user_meta_data ->> 'last_name',''),
    coalesce(new.raw_user_meta_data ->> 'profile_type','Étudiant en ostéopathie'),
    'inactif',
    'en_attente',
    now(),
    now()
  )
  on conflict (user_id) do update set
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    profile_type = excluded.profile_type,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists osteo_on_auth_user_created on auth.users;
create trigger osteo_on_auth_user_created
after insert or update of email, raw_user_meta_data
on auth.users
for each row execute function public.osteo_handle_new_user();

-- Rattrapage des comptes déjà existants.
insert into public.osteo_user_profiles (
  user_id,email,first_name,last_name,profile_type,
  subscription_status,payment_status,created_at,updated_at
)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'first_name',''),
  coalesce(u.raw_user_meta_data ->> 'last_name',''),
  coalesce(u.raw_user_meta_data ->> 'profile_type','Étudiant en ostéopathie'),
  'inactif',
  'en_attente',
  coalesce(u.created_at,now()),
  now()
from auth.users u
on conflict (user_id) do nothing;

-- ============================================================
-- 2. TECHNIQUES : les étudiants peuvent lire,
-- seul l'administrateur peut écrire.
-- IMPORTANT : remplace l'ancienne règle "tout utilisateur
-- authentifié peut modifier".
-- ============================================================

alter table if exists public.osteo_techniques enable row level security;

drop policy if exists "osteo_public_read" on public.osteo_techniques;
drop policy if exists "osteo_admin_insert" on public.osteo_techniques;
drop policy if exists "osteo_admin_update" on public.osteo_techniques;
drop policy if exists "osteo_admin_delete" on public.osteo_techniques;

create policy "osteo_public_read"
on public.osteo_techniques
for select
to anon, authenticated
using (true);

create policy "osteo_admin_insert"
on public.osteo_techniques
for insert
to authenticated
with check (public.osteo_is_admin());

create policy "osteo_admin_update"
on public.osteo_techniques
for update
to authenticated
using (public.osteo_is_admin())
with check (public.osteo_is_admin());

create policy "osteo_admin_delete"
on public.osteo_techniques
for delete
to authenticated
using (public.osteo_is_admin());

-- ============================================================
-- 3. BANQUE DE QUIZ : lecture publique actuelle conservée,
-- écriture réservée à l'administrateur.
-- ============================================================

do $$
declare
  p record;
begin
  if to_regclass('public.osteo_quiz_questions') is not null then
    execute 'alter table public.osteo_quiz_questions enable row level security';
    for p in
      select policyname
      from pg_policies
      where schemaname='public' and tablename='osteo_quiz_questions'
    loop
      execute format('drop policy if exists %I on public.osteo_quiz_questions',p.policyname);
    end loop;

    execute $pol$
      create policy "osteo_quiz_questions_read"
      on public.osteo_quiz_questions
      for select to anon, authenticated
      using (true)
    $pol$;
    execute $pol$
      create policy "osteo_quiz_questions_admin_insert"
      on public.osteo_quiz_questions
      for insert to authenticated
      with check (public.osteo_is_admin())
    $pol$;
    execute $pol$
      create policy "osteo_quiz_questions_admin_update"
      on public.osteo_quiz_questions
      for update to authenticated
      using (public.osteo_is_admin())
      with check (public.osteo_is_admin())
    $pol$;
    execute $pol$
      create policy "osteo_quiz_questions_admin_delete"
      on public.osteo_quiz_questions
      for delete to authenticated
      using (public.osteo_is_admin())
    $pol$;
  end if;

  if to_regclass('public.osteo_quiz_sets') is not null then
    execute 'alter table public.osteo_quiz_sets enable row level security';
    for p in
      select policyname
      from pg_policies
      where schemaname='public' and tablename='osteo_quiz_sets'
    loop
      execute format('drop policy if exists %I on public.osteo_quiz_sets',p.policyname);
    end loop;

    execute $pol$
      create policy "osteo_quiz_sets_read"
      on public.osteo_quiz_sets
      for select to anon, authenticated
      using (true)
    $pol$;
    execute $pol$
      create policy "osteo_quiz_sets_admin_insert"
      on public.osteo_quiz_sets
      for insert to authenticated
      with check (public.osteo_is_admin())
    $pol$;
    execute $pol$
      create policy "osteo_quiz_sets_admin_update"
      on public.osteo_quiz_sets
      for update to authenticated
      using (public.osteo_is_admin())
      with check (public.osteo_is_admin())
    $pol$;
    execute $pol$
      create policy "osteo_quiz_sets_admin_delete"
      on public.osteo_quiz_sets
      for delete to authenticated
      using (public.osteo_is_admin())
    $pol$;
  end if;
end $$;

-- ============================================================
-- 4. ACTIVITÉ ÉTUDIANTE
-- L'étudiant écrit/lit uniquement sa propre activité.
-- L'administrateur lit tout pour les statistiques.
-- ============================================================

create table if not exists public.osteo_user_activity (
  id bigint generated by default as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  technique_id bigint,
  quiz_slug text,
  zone text,
  score numeric,
  max_score numeric,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

alter table public.osteo_user_activity enable row level security;

drop policy if exists "osteo_activity_own_read" on public.osteo_user_activity;
drop policy if exists "osteo_activity_own_insert" on public.osteo_user_activity;
drop policy if exists "osteo_activity_admin_read" on public.osteo_user_activity;

create policy "osteo_activity_own_read"
on public.osteo_user_activity
for select
to authenticated
using (auth.uid() = user_id);

create policy "osteo_activity_own_insert"
on public.osteo_user_activity
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "osteo_activity_admin_read"
on public.osteo_user_activity
for select
to authenticated
using (public.osteo_is_admin());

-- ============================================================
-- 5. STORAGE DES IMAGES
-- Lecture conservée ; écriture réservée à l'administrateur.
-- ============================================================

drop policy if exists "osteo_pratik_images_select" on storage.objects;
drop policy if exists "osteo_pratik_images_insert" on storage.objects;
drop policy if exists "osteo_pratik_images_update" on storage.objects;
drop policy if exists "osteo_pratik_images_delete" on storage.objects;

create policy "osteo_pratik_images_select"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'osteo-pratik-images');

create policy "osteo_pratik_images_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'osteo-pratik-images'
  and public.osteo_is_admin()
);

create policy "osteo_pratik_images_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'osteo-pratik-images'
  and public.osteo_is_admin()
)
with check (
  bucket_id = 'osteo-pratik-images'
  and public.osteo_is_admin()
);

create policy "osteo_pratik_images_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'osteo-pratik-images'
  and public.osteo_is_admin()
);

-- ============================================================
-- FIN V18
-- ============================================================
