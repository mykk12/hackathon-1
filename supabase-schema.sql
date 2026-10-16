-- =========================================================================
-- STUDY SPACE: SUPABASE DATABASE INITIALIZATION SCHEMA & REALTIME SETUP
-- =========================================================================
-- Clean database initialization script without sample data.
-- Run in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dwlaxoheemywrzagodpb/sql/new
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. User Entries Table (Student Profiles, Registrations & Entry Submissions)
create table if not exists public.user_entries (
  id text primary key default concat('entry-', uuid_generate_v4()),
  user_email text not null,
  full_name text not null,
  mobile text,
  age text,
  education_level text, -- 'school' or 'college'
  school_class text,
  college_name text,
  college_course text,
  college_year text,
  college_semester text,
  entry_type text default 'student_registration', -- 'student_registration', 'profile_update', 'custom_entry'
  notes text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_entries enable row level security;

drop policy if exists "Anyone can read user_entries" on public.user_entries;
create policy "Anyone can read user_entries" on public.user_entries for select using (true);

drop policy if exists "Anyone can insert user_entries" on public.user_entries;
create policy "Anyone can insert user_entries" on public.user_entries for insert with check (true);

drop policy if exists "Anyone can update user_entries" on public.user_entries;
create policy "Anyone can update user_entries" on public.user_entries for update using (true);

drop policy if exists "Anyone can delete user_entries" on public.user_entries;
create policy "Anyone can delete user_entries" on public.user_entries for delete using (true);


-- 2. Academic Resources & Uploaded Notes Table
create table if not exists public.user_resources (
  id text primary key default concat('res-', uuid_generate_v4()),
  user_entry_id text references public.user_entries(id) on delete set null,
  title text not null,
  subject text not null default 'Computer Science',
  format text not null default 'PDF',
  author text default 'Student',
  institution text,
  reads_count integer default 0,
  rating numeric default 5.0,
  pages integer default 1,
  summary text,
  topics text[] default '{}',
  is_public boolean default true,
  file_name text,
  file_size text default '1.0 MB',
  file_url text,
  file_data text,
  file_mime_type text,
  owner_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_resources enable row level security;

drop policy if exists "Anyone can read user_resources" on public.user_resources;
create policy "Anyone can read user_resources" on public.user_resources for select using (true);

drop policy if exists "Anyone can insert user_resources" on public.user_resources;
create policy "Anyone can insert user_resources" on public.user_resources for insert with check (true);

drop policy if exists "Anyone can update user_resources" on public.user_resources;
create policy "Anyone can update user_resources" on public.user_resources for update using (true);

drop policy if exists "Anyone can delete user_resources" on public.user_resources;
create policy "Anyone can delete user_resources" on public.user_resources for delete using (true);


-- 3. Study Tasks & Revision Schedules Table
create table if not exists public.study_tasks (
  id text primary key default concat('task-', uuid_generate_v4()),
  user_entry_id text references public.user_entries(id) on delete set null,
  title text not null,
  subject text not null default 'Computer Science',
  due_date text not null,
  duration_minutes integer default 30,
  completed boolean default false,
  priority text default 'medium',
  owner_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.study_tasks enable row level security;

drop policy if exists "Anyone can read study_tasks" on public.study_tasks;
create policy "Anyone can read study_tasks" on public.study_tasks for select using (true);

drop policy if exists "Anyone can insert study_tasks" on public.study_tasks;
create policy "Anyone can insert study_tasks" on public.study_tasks for insert with check (true);

drop policy if exists "Anyone can update study_tasks" on public.study_tasks;
create policy "Anyone can update study_tasks" on public.study_tasks for update using (true);

drop policy if exists "Anyone can delete study_tasks" on public.study_tasks;
create policy "Anyone can delete study_tasks" on public.study_tasks for delete using (true);


-- 4. User Bookmarks Table
create table if not exists public.user_bookmarks (
  id text primary key default concat('bm-', uuid_generate_v4()),
  user_email text not null,
  resource_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_email, resource_id)
);

alter table public.user_bookmarks enable row level security;

drop policy if exists "Anyone can read user_bookmarks" on public.user_bookmarks;
create policy "Anyone can read user_bookmarks" on public.user_bookmarks for select using (true);

drop policy if exists "Anyone can insert user_bookmarks" on public.user_bookmarks;
create policy "Anyone can insert user_bookmarks" on public.user_bookmarks for insert with check (true);

drop policy if exists "Anyone can delete user_bookmarks" on public.user_bookmarks;
create policy "Anyone can delete user_bookmarks" on public.user_bookmarks for delete using (true);


-- 5. Extracted Document Chunks for Server-Side RAG
create table if not exists public.resource_chunks (
  id text primary key default concat('chunk-', uuid_generate_v4()),
  resource_id text not null,
  title text not null,
  subject text not null default 'Computer Science',
  format text not null default 'PDF',
  file_name text not null,
  page_number integer default 1,
  chunk_index integer not null default 0,
  content text not null,
  is_public boolean default false,
  owner_email text,
  topics text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.resource_chunks enable row level security;

drop policy if exists "Anyone can read resource_chunks" on public.resource_chunks;
create policy "Anyone can read resource_chunks" on public.resource_chunks for select using (true);

drop policy if exists "Anyone can insert resource_chunks" on public.resource_chunks;
create policy "Anyone can insert resource_chunks" on public.resource_chunks for insert with check (true);

drop policy if exists "Anyone can update resource_chunks" on public.resource_chunks;
create policy "Anyone can update resource_chunks" on public.resource_chunks for update using (true);

drop policy if exists "Anyone can delete resource_chunks" on public.resource_chunks;
create policy "Anyone can delete resource_chunks" on public.resource_chunks for delete using (true);


-- 6. Enable Realtime Publications for Realtime Live Syncing
begin;
  do $$
  begin
    if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
      alter publication supabase_realtime add table public.user_entries;
      alter publication supabase_realtime add table public.user_resources;
      alter publication supabase_realtime add table public.study_tasks;
      alter publication supabase_realtime add table public.user_bookmarks;
    end if;
  exception when others then
    -- ignore if already added
  end $$;
commit;
