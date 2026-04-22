-- Supabase schema for cloud notes app
-- Run this SQL in your Supabase project's SQL editor.

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('bottle', 'plane')),
  content text not null,
  created_at timestamptz not null default now(),
  image_url text,
  location text,
  author text
);

-- Optional future extension: associate notes with authenticated users
-- alter table public.notes
--   add column user_id uuid references auth.users(id);

-- Basic RLS configuration.
alter table public.notes enable row level security;

-- Public read access (any client can read notes).
create policy "Public read access for notes"
  on public.notes
  for select
  using (true);

-- Public insert access (any client can create notes).
-- For production, you should tighten this policy to authenticated users.
create policy "Public insert access for notes"
  on public.notes
  for insert
  with check (true);

