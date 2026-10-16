-- =========================================================================
-- STUDY SPACE: SUPABASE DATABASE INITIALIZATION SCHEMA & RLS POLICIES
-- =========================================================================
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- This sets up the relational tables, foreign keys, and Row Level Security (RLS)
-- ensuring each student can ONLY read, insert, update, or delete their own data.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Student Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. Academic Resources & Uploaded Notes
create table if not exists public.user_resources (
  id text primary key default concat('res-', uuid_generate_v4()),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  file_name text not null,
  file_type text not null default 'pdf',
  format text not null default 'pdf',
  file_size text default '1.2 MB',
  pages integer default 10,
  is_public boolean default false,
  subject text not null default 'Computer Science',
  author text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_resources enable row level security;

-- Owner can do all operations on their own files
create policy "Users can manage own resources"
  on public.user_resources for all
  using (auth.uid() = user_id);

-- Any authenticated user can read public resources
create policy "Anyone can view public resources"
  on public.user_resources for select
  using (is_public = true);

-- 3. Study Tasks & Revision Schedules
create table if not exists public.study_tasks (
  id text primary key default concat('task-', uuid_generate_v4()),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  subject text not null default 'Computer Science',
  due_date text not null,
  duration_minutes integer default 30,
  completed boolean default false,
  priority text default 'medium',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.study_tasks enable row level security;

create policy "Users can manage own study tasks"
  on public.study_tasks for all
  using (auth.uid() = user_id);

-- 4. AI Assistant Conversations & Chat History
create table if not exists public.ai_conversations (
  id text primary key default concat('chat-', uuid_generate_v4()),
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ai_conversations enable row level security;

create policy "Users can manage own AI conversation history"
  on public.ai_conversations for all
  using (auth.uid() = user_id);

-- 5. Extracted Resource Chunks & Embeddings for StudySpace AI RAG
create table if not exists public.resource_chunks (
  id text primary key default concat('chunk-', uuid_generate_v4()),
  resource_id text not null,
  user_id uuid references auth.users on delete cascade,
  title text not null,
  subject text not null default 'Computer Science',
  format text not null default 'pdf',
  file_name text not null,
  page_number integer default 1,
  chunk_index integer not null default 0,
  content text not null,
  is_public boolean default false,
  owner_email text,
  storage_path text,
  topics text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.resource_chunks enable row level security;

-- Public chunks can be retrieved by any student/guest
create policy "Anyone can view public resource chunks"
  on public.resource_chunks for select
  using (is_public = true);

-- Private chunks can only be retrieved by their owner
create policy "Users can view own private resource chunks"
  on public.resource_chunks for select
  using (auth.uid() = user_id or auth.jwt()->>'email' = owner_email);

-- Users can manage their own resource chunks
create policy "Users can manage own resource chunks"
  on public.resource_chunks for all
  using (auth.uid() = user_id or auth.jwt()->>'email' = owner_email);

-- 6. Storage Bucket Configuration for Uploaded Notes & Study Materials
insert into storage.buckets (id, name, public)
values ('study-materials', 'study-materials', true)
on conflict (id) do nothing;

create policy "Public materials are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'study-materials');

create policy "Authenticated users can upload study materials"
  on storage.objects for insert
  with check (bucket_id = 'study-materials' and auth.role() = 'authenticated');

