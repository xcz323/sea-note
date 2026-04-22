-- Supabase auth + social extension migration
-- Execute in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.notes
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create table if not exists public.note_likes (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(note_id, user_id)
);

create table if not exists public.note_collections (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(note_id, user_id)
);

alter table public.notes enable row level security;
alter table public.note_likes enable row level security;
alter table public.note_collections enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Public read access for notes" on public.notes;
drop policy if exists "Public insert access for notes" on public.notes;

create policy "Public read notes"
  on public.notes
  for select
  using (true);

create policy "Authenticated insert notes"
  on public.notes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Owner update notes"
  on public.notes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Owner delete notes"
  on public.notes
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Read likes"
  on public.note_likes
  for select
  using (true);

create policy "Owner manage likes"
  on public.note_likes
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Read collections"
  on public.note_collections
  for select
  using (true);

create policy "Owner manage collections"
  on public.note_collections
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Profile read"
  on public.profiles
  for select
  using (true);

create policy "Profile owner manage"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

