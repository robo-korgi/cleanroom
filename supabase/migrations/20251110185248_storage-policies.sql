-- PUBLIC BUCKET POLICIES
drop policy if exists "Public read access" on storage.objects;
drop policy if exists "Users can upload their own files to public bucket" on storage.objects;
drop policy if exists "Users can update their own files in public bucket" on storage.objects;
drop policy if exists "Users can delete their own files in public bucket" on storage.objects;

create policy "Public read access"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'cleanroom-public');

create policy "Users can upload their own files to public bucket"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'cleanroom-public'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own files in public bucket"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'cleanroom-public'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'cleanroom-public'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own files in public bucket"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'cleanroom-public'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- PRIVATE BUCKET POLICIES
drop policy if exists "Private bucket: user can read their files" on storage.objects;
drop policy if exists "Private bucket: user can insert into their folder" on storage.objects;
drop policy if exists "Private bucket: user can update their files" on storage.objects;
drop policy if exists "Private bucket: user can delete their files" on storage.objects;

create policy "Private bucket: user can read their files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'cleanroom-private'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Private bucket: user can insert into their folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'cleanroom-private'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Private bucket: user can update their files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'cleanroom-private'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'cleanroom-private'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Private bucket: user can delete their files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'cleanroom-private'
  and (storage.foldername(name))[1] = auth.uid()::text
);
