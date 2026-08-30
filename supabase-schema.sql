-- ==============================================================================
-- 1. PROPERTIES DATABASE TABLE
-- ==============================================================================
create table if not exists public.properties (
  id text primary key,
  number text,
  title text,
  property_type text not null,
  location text not null,
  price text,
  highlights text,
  prompt text,
  image_url text not null,
  ratio text default '16:9',
  engine text default 'bytedance/seedream-5.0-pro',
  branding jsonb,
  api_status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.properties enable row level security;

-- Policies allowing public read and write via Anon Key
drop policy if exists "Allow anonymous select on properties" on public.properties;
create policy "Allow anonymous select on properties" 
  on public.properties for select 
  using (true);

drop policy if exists "Allow anonymous insert on properties" on public.properties;
create policy "Allow anonymous insert on properties" 
  on public.properties for insert 
  with check (true);

drop policy if exists "Allow anonymous update on properties" on public.properties;
create policy "Allow anonymous update on properties" 
  on public.properties for update 
  using (true);

drop policy if exists "Allow anonymous delete on properties" on public.properties;
create policy "Allow anonymous delete on properties" 
  on public.properties for delete 
  using (true);


-- ==============================================================================
-- 2. SUPABASE STORAGE BUCKET: 'properties'
-- ==============================================================================
-- Create the public storage bucket for image files
insert into storage.buckets (id, name, public)
values ('properties', 'properties', true)
on conflict (id) do update set public = true;

-- Storage RLS Policies allowing public read and anon uploads
drop policy if exists "Public Access for properties bucket" on storage.objects;
create policy "Public Access for properties bucket"
  on storage.objects for select
  using (bucket_id = 'properties');

drop policy if exists "Public Uploads for properties bucket" on storage.objects;
create policy "Public Uploads for properties bucket"
  on storage.objects for insert
  with check (bucket_id = 'properties');

drop policy if exists "Public Updates for properties bucket" on storage.objects;
create policy "Public Updates for properties bucket"
  on storage.objects for update
  using (bucket_id = 'properties');

drop policy if exists "Public Deletes for properties bucket" on storage.objects;
create policy "Public Deletes for properties bucket"
  on storage.objects for delete
  using (bucket_id = 'properties');

