import React, { useState } from 'react';
import {
  X,
  Database,
  Check,
  Copy,
  ExternalLink,
  Table,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ThemeColors } from '../utils/theme.ts';
import { SUPABASE_PROJECT_ID, SUPABASE_DEFAULT_URL } from '../utils/supabase.ts';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeColors;
}

const SUPABASE_SCHEMA_SQL = `-- =========================================================================
-- STUDY SPACE: SUPABASE DATABASE INITIALIZATION SCHEMA & REALTIME SETUP
-- Project ID: yuppwsutqtyrfvzdchcz
-- Run in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yuppwsutqtyrfvzdchcz/sql/new
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. User Entries Table (Registrations & Onboarding)
create table if not exists public.user_entries (
  id text primary key default concat('entry-', uuid_generate_v4()),
  user_email text not null,
  full_name text not null,
  mobile text,
  age text,
  education_level text,
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

-- 2. User Profiles Table (Student Bio, Username & Avatar)
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

-- 3. Academic Resources & Uploaded Notes Table
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

-- 4. Study Tasks & Revision Schedules Table
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

-- 5. User Bookmarks Table
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

-- 6. Extracted Document Chunks for Server-Side RAG
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

-- 7. User Feedback Table
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

-- 8. Enable Realtime Publications
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
  end $$;
commit;`;

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose, theme }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'sql'>('info');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const sqlEditorUrl = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden animate-in zoom-in-95"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.surfaceBorder,
          color: theme.textPrimary,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: theme.surfaceBorder }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}
            >
              <Database className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight" style={{ color: theme.textPrimary }}>
                  Supabase Cloud Database
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Connected
                </span>
              </div>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                Project ID: <span className="font-mono font-bold text-[#8E74DB]">{SUPABASE_PROJECT_ID}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border hover:opacity-75 cursor-pointer"
            style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b shrink-0" style={{ borderColor: theme.surfaceBorder }}>
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'info'
                ? 'border-[#8E74DB] text-[#8E74DB]'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'info' ? '#8E74DB' : theme.textPrimary }}
          >
            Connection & Live Tables
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-[#8E74DB] text-[#8E74DB]'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ color: activeTab === 'sql' ? '#8E74DB' : theme.textPrimary }}
          >
            <span>SQL Schema Query</span>
            <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-purple-500/20 text-purple-600 dark:text-purple-300 font-mono">
              Ready
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'info' ? (
            <div className="space-y-4">
              {/* Connection Status Card */}
              <div
                className="p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  borderColor: 'rgba(16, 185, 129, 0.25)',
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      Live Connection Active
                    </span>
                  </div>
                  <p className="text-xs font-mono text-emerald-800 dark:text-emerald-200 break-all">
                    {SUPABASE_DEFAULT_URL}
                  </p>
                </div>

                <a
                  href={sqlEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 cursor-pointer transition-all"
                >
                  <span>Open Supabase SQL Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Connected Tables Summary */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider mb-2.5" style={{ color: theme.textSecondary }}>
                  Configured Database Tables
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { name: 'public.user_entries', desc: 'Student registrations, email sign-ups, and user records' },
                    { name: 'public.user_profiles', desc: 'Avatar, bio, college/school major, and personal settings' },
                    { name: 'public.user_resources', desc: 'Academic study materials, notes, PDF files, and subjects' },
                    { name: 'public.study_tasks', desc: 'Personal study planner tasks, schedules, and priorities' },
                    { name: 'public.user_bookmarks', desc: 'Saved and pinned resources per student account' },
                    { name: 'public.resource_chunks', desc: 'Document text chunks indexed for server-side AI grounding' },
                    { name: 'public.user_feedback', desc: 'Feedback submissions, feature requests, and reviews' },
                  ].map((tbl) => (
                    <div
                      key={tbl.name}
                      className="p-3 rounded-2xl border space-y-1"
                      style={{
                        backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                        borderColor: theme.surfaceBorder,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#8E74DB]">{tbl.name}</span>
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ready
                        </span>
                      </div>
                      <p className="text-[11px] leading-snug" style={{ color: theme.textSecondary }}>
                        {tbl.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div
                className="p-4 rounded-2xl border space-y-2"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(142, 116, 219, 0.1)' : '#F3EFFE',
                  borderColor: 'rgba(142, 116, 219, 0.25)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8E74DB]" />
                  <span className="text-xs font-black" style={{ color: theme.textPrimary }}>
                    Quick Setup Instructions:
                  </span>
                </div>
                <ol className="list-decimal list-inside text-xs space-y-1" style={{ color: theme.textSecondary }}>
                  <li>Click the <strong>"SQL Schema Query"</strong> tab above or click <strong>"Copy Full SQL Query"</strong> below.</li>
                  <li>Click <strong>"Open Supabase SQL Editor"</strong> to open your project's query editor.</li>
                  <li>Paste the SQL script and click <strong>"Run"</strong>. Your tables, indexes, RLS, and realtime will be live!</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: theme.textSecondary }}>
                  PostgreSQL Initialization Query:
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#302747] text-white hover:opacity-90 cursor-pointer shadow-xs transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <div className="relative">
                <pre
                  className="p-4 rounded-2xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[380px] border select-all"
                  style={{
                    backgroundColor: '#1E172E',
                    borderColor: 'rgba(220, 209, 250, 0.2)',
                    color: '#EDE9FE',
                  }}
                >
                  {SUPABASE_SCHEMA_SQL}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-3.5 border-t shrink-0"
          style={{ borderColor: theme.surfaceBorder }}
        >
          <a
            href={sqlEditorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8E74DB] hover:underline"
          >
            <span>Open in Supabase Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#302747] text-[#FFF9F0] hover:scale-105 active:scale-95 cursor-pointer shadow-sm transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy SQL Schema'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border hover:opacity-75 cursor-pointer"
              style={{ borderColor: theme.surfaceBorder, color: theme.textPrimary }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
