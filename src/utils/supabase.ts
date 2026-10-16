import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AcademicResource, StudyTask } from '../types/index.ts';

// Client-side environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Determine if Supabase is genuinely configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('placeholder')
);

// Modular Supabase Client instance (null when not connected)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface SupabaseStatus {
  isConfigured: boolean;
  urlPreview?: string;
  authEnabled: boolean;
  tablesAvailable?: string[];
  message: string;
}

/**
 * Checks connectivity to the configured Supabase instance
 */
export async function getSupabaseConnectionStatus(): Promise<SupabaseStatus> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      isConfigured: false,
      authEnabled: false,
      message:
        'Supabase is not connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment or .env file to enable live cloud persistence.',
    };
  }

  try {
    // Attempt a lightweight ping query
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's still connected to the project
      return {
        isConfigured: true,
        urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 18)}...` : undefined,
        authEnabled: true,
        message: 'Connected to Supabase project! (Run supabase-schema.sql to initialize tables)',
      };
    }
    return {
      isConfigured: true,
      urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 18)}...` : undefined,
      authEnabled: true,
      tablesAvailable: ['profiles', 'user_resources', 'study_tasks', 'ai_conversations'],
      message: 'Connected to Supabase project with active Row Level Security.',
    };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      isConfigured: true,
      urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 18)}...` : undefined,
      authEnabled: false,
      message: `Supabase configured but ping failed: ${error.message}`,
    };
  }
}

/**
 * Fetches user authorized resources from Supabase with Row Level Security
 */
export async function fetchAuthorizedUserResources(userId: string): Promise<{
  data: AcademicResource[] | null;
  error: string | null;
  connected: boolean;
}> {
  if (!supabase) {
    return {
      data: null,
      error: 'Supabase database is not connected. Local storage is currently active.',
      connected: false,
    };
  }

  try {
    const { data, error } = await supabase
      .from('user_resources')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message, connected: true };
    }

    return {
      data: (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        subject: row.subject || 'Computer Science',
        format: (row.format || row.file_type || 'PDF'),
        fileName: row.file_name,
        fileSize: row.file_size,
        pages: row.pages,
        isPublic: Boolean(row.is_public),
        dateAdded: row.created_at || new Date().toISOString(),
        author: row.author || 'Anonymous Peer',
        readsCount: row.reads_count ?? 0,
        rating: row.rating ?? 5.0,
        summary: row.summary || row.title,
        topics: Array.isArray(row.topics) ? row.topics : [],
      })),
      error: null,
      connected: true,
    };
  } catch (err: unknown) {
    const error = err as Error;
    return { data: null, error: error.message, connected: true };
  }
}

/**
 * Fetches user authorized study tasks from Supabase
 */
export async function fetchAuthorizedStudyTasks(userId: string): Promise<{
  data: StudyTask[] | null;
  error: string | null;
  connected: boolean;
}> {
  if (!supabase) {
    return {
      data: null,
      error: 'Supabase database is not connected. Local storage is currently active.',
      connected: false,
    };
  }

  try {
    const { data, error } = await supabase
      .from('study_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message, connected: true };
    }

    return {
      data: (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        subject: row.subject,
        dueDate: row.due_date,
        durationMinutes: row.duration_minutes,
        completed: row.completed,
        priority: row.priority,
      })),
      error: null,
      connected: true,
    };
  } catch (err: unknown) {
    const error = err as Error;
    return { data: null, error: error.message, connected: true };
  }
}
