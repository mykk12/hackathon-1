-- =========================================================================
-- STUDY SPACE: SUPABASE DATABASE INITIALIZATION SCHEMA & REALTIME SETUP
-- Project ID: yuppwsutqtyrfvzdchcz
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yuppwsutqtyrfvzdchcz/sql/new
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================================================================
-- 1. User Entries Table (Registrations, Onboarding & User Records)
-- =========================================================================
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
  entry_type text default 'student_registration',
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

create index if not exists idx_user_entries_email on public.user_entries (user_email);
create index if not exists idx_user_entries_created on public.user_entries (created_at desc);


-- =========================================================================
-- 2. User Profiles Table (Student Bio, Username, Avatar & Institution)
-- =========================================================================
create table if not exists public.user_profiles (
  id text primary key default concat('profile-', uuid_generate_v4()),
  email text unique not null,
  full_name text not null,
  username text,
  avatar_url text,
  bio text,
  institution text,
  major text,
  academic_year text,
  phone text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_profiles enable row level security;

drop policy if exists "Anyone can read user_profiles" on public.user_profiles;
create policy "Anyone can read user_profiles" on public.user_profiles for select using (true);

drop policy if exists "Anyone can insert user_profiles" on public.user_profiles;
create policy "Anyone can insert user_profiles" on public.user_profiles for insert with check (true);

drop policy if exists "Anyone can update user_profiles" on public.user_profiles;
create policy "Anyone can update user_profiles" on public.user_profiles for update using (true);

drop policy if exists "Anyone can delete user_profiles" on public.user_profiles;
create policy "Anyone can delete user_profiles" on public.user_profiles for delete using (true);

create index if not exists idx_user_profiles_email on public.user_profiles (email);


-- =========================================================================
-- 3. Academic Resources & Uploaded Notes Table
-- =========================================================================
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

create index if not exists idx_user_resources_owner on public.user_resources (owner_email);
create index if not exists idx_user_resources_public on public.user_resources (is_public);
create index if not exists idx_user_resources_subject on public.user_resources (subject);
create index if not exists idx_user_resources_created on public.user_resources (created_at desc);


-- =========================================================================
-- 4. Study Tasks & Revision Schedules Table
-- =========================================================================
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

create index if not exists idx_study_tasks_owner on public.study_tasks (owner_email);
create index if not exists idx_study_tasks_completed on public.study_tasks (completed);
create index if not exists idx_study_tasks_created on public.study_tasks (created_at desc);


-- =========================================================================
-- 5. User Bookmarks Table
-- =========================================================================
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

create index if not exists idx_user_bookmarks_email on public.user_bookmarks (user_email);


-- =========================================================================
-- 6. Extracted Document Chunks for Server-Side RAG
-- =========================================================================
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

create index if not exists idx_resource_chunks_res on public.resource_chunks (resource_id);


-- =========================================================================
-- 7. User Feedback & Feature Requests Table
-- =========================================================================
create table if not exists public.user_feedback (
  id text primary key default concat('fb-', uuid_generate_v4()),
  user_email text,
  category text not null default 'general',
  rating integer default 5,
  feedback_text text not null,
  contact_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_feedback enable row level security;

drop policy if exists "Anyone can read user_feedback" on public.user_feedback;
create policy "Anyone can read user_feedback" on public.user_feedback for select using (true);

drop policy if exists "Anyone can insert user_feedback" on public.user_feedback;
create policy "Anyone can insert user_feedback" on public.user_feedback for insert with check (true);


-- =========================================================================
-- 8. Enable Realtime Publications for Live Sync across Devices
-- =========================================================================
begin;
  do $$
  begin
    if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
      alter publication supabase_realtime add table public.user_entries;
      alter publication supabase_realtime add table public.user_profiles;
      alter publication supabase_realtime add table public.user_resources;
      alter publication supabase_realtime add table public.study_tasks;
      alter publication supabase_realtime add table public.user_bookmarks;
    end if;
  exception when others then
    -- ignore if already added
  end $$;
commit;
