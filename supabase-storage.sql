-- OSTÉO PRATIK — SUPABASE STORAGE
-- À exécuter UNE SEULE FOIS dans Supabase > SQL Editor.
-- Le bucket est public en lecture pour que les images s'affichent dans l'application.
-- L'écriture reste réservée aux utilisateurs Supabase authentifiés.

insert into storage.buckets (id, name, public)
values ('osteo-pratik-images', 'osteo-pratik-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "osteo_pratik_images_select" on storage.objects;
create policy "osteo_pratik_images_select"
on storage.objects
for select
to authenticated
using (bucket_id = 'osteo-pratik-images');

drop policy if exists "osteo_pratik_images_insert" on storage.objects;
create policy "osteo_pratik_images_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'osteo-pratik-images');

drop policy if exists "osteo_pratik_images_update" on storage.objects;
create policy "osteo_pratik_images_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'osteo-pratik-images')
with check (bucket_id = 'osteo-pratik-images');

drop policy if exists "osteo_pratik_images_delete" on storage.objects;
create policy "osteo_pratik_images_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'osteo-pratik-images');
