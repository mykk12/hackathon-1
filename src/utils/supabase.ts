import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AcademicResource, StudyTask, SubjectType, ResourceFormat, UserEntry, UserRegistrationData } from '../types/index.ts';
import type { UserProfileData } from '../components/ProfileSettingsModal.tsx';

// Project credentials provided by the user
export const SUPABASE_PROJECT_ID = 'yuppwsutqtyrfvzdchcz';
export const SUPABASE_DEFAULT_URL = 'https://yuppwsutqtyrfvzdchcz.supabase.co';
export const SUPABASE_DEFAULT_ANON_KEY = 'sb_publishable__JFjKMVCUqNuZY1ZeGIIFw_2_bh7p__';

// Resolve environment variables with project defaults
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  SUPABASE_DEFAULT_URL;

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  SUPABASE_DEFAULT_ANON_KEY;

// Determine if Supabase is genuinely configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('placeholder')
);

// Modular Supabase Client instance
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface SupabaseStatus {
  isConfigured: boolean;
  projectId: string;
  urlPreview: string;
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
      projectId: SUPABASE_PROJECT_ID,
      urlPreview: SUPABASE_DEFAULT_URL,
      authEnabled: false,
      message: 'Supabase client is not initialized.',
    };
  }

  try {
    // Attempt lightweight queries to check which tables are ready
    const [entriesCheck, resourcesCheck, tasksCheck] = await Promise.all([
      supabase.from('user_entries').select('id', { count: 'exact', head: true }),
      supabase.from('user_resources').select('id', { count: 'exact', head: true }),
      supabase.from('study_tasks').select('id', { count: 'exact', head: true }),
    ]);

    const tablesAvailable: string[] = [];
    if (!entriesCheck.error) tablesAvailable.push('user_entries');
    if (!resourcesCheck.error) tablesAvailable.push('user_resources');
    if (!tasksCheck.error) tablesAvailable.push('study_tasks');

    const tablesExist = tablesAvailable.length > 0;

    return {
      isConfigured: true,
      projectId: SUPABASE_PROJECT_ID,
      urlPreview: supabaseUrl,
      authEnabled: true,
      tablesAvailable,
      message: tablesExist
        ? `Connected to Supabase project (${SUPABASE_PROJECT_ID}) with ${tablesAvailable.length} active tables.`
        : `Connected to Supabase (${SUPABASE_PROJECT_ID}). Tables pending creation via SQL query.`,
    };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      isConfigured: true,
      projectId: SUPABASE_PROJECT_ID,
      urlPreview: supabaseUrl,
      authEnabled: false,
      message: `Supabase ping failed: ${error.message}`,
    };
  }
}

// =========================================================================
// 1. User Entries & Registration Persistence
// =========================================================================

export async function insertUserEntryToSupabase(userData: UserRegistrationData): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const { error } = await supabase.from('user_entries').insert({
      user_email: userData.email,
      full_name: userData.fullName,
      age: userData.age,
      mobile: userData.mobile,
      education_level: userData.educationLevel,
      school_class: userData.schoolClass || null,
      college_name: userData.collegeName || null,
      college_course: userData.collegeCourse || null,
      college_year: userData.collegeYear || null,
      college_semester: userData.collegeSemester || null,
      entry_type: 'student_registration',
    });

    if (error) {
      console.warn('Error saving user entry to Supabase:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

export async function fetchUserEntriesFromSupabase(userEmail?: string): Promise<{ data: UserEntry[] | null; error: string | null }> {
  if (!supabase) {
    return { data: null, error: 'Supabase is not configured.' };
  }

  try {
    let query = supabase.from('user_entries').select('*').order('created_at', { ascending: false });
    if (userEmail) {
      query = query.eq('user_email', userEmail);
    }
    const { data, error } = await query;
    if (error) {
      return { data: null, error: error.message };
    }
    return {
      data: (data || []).map((row) => ({
        id: row.id,
        userEmail: row.user_email,
        fullName: row.full_name,
        mobile: row.mobile,
        age: row.age,
        educationLevel: row.education_level,
        schoolClass: row.school_class,
        collegeName: row.college_name,
        collegeCourse: row.college_course,
        collegeYear: row.college_year,
        collegeSemester: row.college_semester,
        entryType: row.entry_type,
        notes: row.notes,
        createdAt: row.created_at,
      })),
      error: null,
    };
  } catch (err: unknown) {
    const error = err as Error;
    return { data: null, error: error.message };
  }
}

// =========================================================================
// 2. User Profile Persistence
// =========================================================================

export async function saveUserProfileToSupabase(profile: UserProfileData): Promise<{ success: boolean; error: string | null }> {
  if (!supabase || !profile.email) {
    return { success: false, error: 'Supabase not ready or missing email' };
  }

  try {
    const { error } = await supabase.from('user_profiles').upsert(
      {
        email: profile.email,
        full_name: profile.fullName,
        username: profile.username,
        avatar_url: profile.avatarUrl,
        bio: profile.bio,
        institution: profile.institution,
        major: profile.major,
        academic_year: profile.academicYear,
        phone: profile.phone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );

    if (error) {
      console.warn('Error saving profile to Supabase:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

export async function fetchUserProfileFromSupabase(userEmail: string): Promise<UserProfileData | null> {
  if (!supabase || !userEmail) return null;

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle();

    if (error || !data) return null;

    return {
      fullName: data.full_name || '',
      username: data.username || '',
      avatarUrl: data.avatar_url || '',
      bio: data.bio || '',
      institution: data.institution || '',
      major: data.major || '',
      academicYear: data.academic_year || '',
      email: data.email,
      phone: data.phone || '',
    };
  } catch {
    return null;
  }
}

// =========================================================================
// 3. Academic Resources Persistence (Public + Private)
// =========================================================================

function mapSupabaseRowToResource(row: any): AcademicResource {
  return {
    id: row.id,
    title: row.title,
    subject: (row.subject || 'Computer Science') as SubjectType,
    format: (row.format || 'PDF') as ResourceFormat,
    author: row.author || 'Anonymous Student',
    institution: row.institution || undefined,
    readsCount: row.reads_count ?? 0,
    rating: Number(row.rating) || 5.0,
    pages: row.pages || 1,
    summary: row.summary || row.title,
    topics: Array.isArray(row.topics) ? row.topics : [],
    isPublic: Boolean(row.is_public),
    dateAdded: row.created_at || new Date().toISOString(),
    fileName: row.file_name,
    fileSize: row.file_size,
    fileUrl: row.file_url,
    fileData: row.file_data,
    fileMimeType: row.file_mime_type,
    ownerEmail: row.owner_email,
    userEntryId: row.user_entry_id,
  };
}

export async function fetchAllResourcesFromSupabase(currentUserEmail?: string | null): Promise<AcademicResource[]> {
  if (!supabase) return [];

  try {
    let query = supabase.from('user_resources').select('*');

    if (currentUserEmail) {
      // Fetch public resources OR resources owned by the current user
      query = query.or(`is_public.eq.true,owner_email.eq.${currentUserEmail}`);
    } else {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) {
      return [];
    }
    return data.map(mapSupabaseRowToResource);
  } catch (err) {
    console.warn('Error fetching resources from Supabase:', err);
    return [];
  }
}

export async function insertResourceToSupabase(
  resource: AcademicResource,
  userEmail?: string | null
): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const { error } = await supabase.from('user_resources').upsert({
      id: resource.id,
      title: resource.title,
      subject: resource.subject,
      format: resource.format,
      author: resource.author,
      institution: resource.institution || null,
      reads_count: resource.readsCount || 0,
      rating: resource.rating || 5.0,
      pages: resource.pages || 1,
      summary: resource.summary || '',
      topics: resource.topics || [],
      is_public: resource.isPublic !== false,
      file_name: resource.fileName || null,
      file_size: resource.fileSize || '1.0 MB',
      file_url: resource.fileUrl || null,
      file_data: resource.fileData || null,
      file_mime_type: resource.fileMimeType || null,
      owner_email: userEmail || resource.ownerEmail || null,
    });

    if (error) {
      console.warn('Supabase insertResource error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

export async function updateResourceInSupabase(resource: AcademicResource): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: false, error: 'Supabase not ready' };

  try {
    const { error } = await supabase
      .from('user_resources')
      .update({
        title: resource.title,
        subject: resource.subject,
        format: resource.format,
        author: resource.author,
        institution: resource.institution || null,
        reads_count: resource.readsCount,
        rating: resource.rating,
        pages: resource.pages,
        summary: resource.summary,
        topics: resource.topics,
        is_public: resource.isPublic,
      })
      .eq('id', resource.id);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

export async function deleteResourceFromSupabase(resourceId: string): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: false, error: 'Supabase not ready' };

  try {
    const { error } = await supabase.from('user_resources').delete().eq('id', resourceId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

// =========================================================================
// 4. Study Tasks Persistence
// =========================================================================

export async function fetchStudyTasksFromSupabase(userEmail?: string | null): Promise<StudyTask[]> {
  if (!supabase) return [];

  try {
    let query = supabase.from('study_tasks').select('*');
    if (userEmail) {
      query = query.eq('owner_email', userEmail);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      subject: (row.subject || 'Computer Science') as SubjectType,
      dueDate: row.due_date,
      durationMinutes: row.duration_minutes || 30,
      completed: Boolean(row.completed),
      priority: row.priority || 'medium',
      userEntryId: row.user_entry_id,
    }));
  } catch (err) {
    console.warn('Error fetching study tasks from Supabase:', err);
    return [];
  }
}

export async function insertStudyTaskToSupabase(
  task: StudyTask,
  userEmail?: string | null
): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: false, error: 'Supabase not ready' };

  try {
    const { error } = await supabase.from('study_tasks').upsert({
      id: task.id,
      title: task.title,
      subject: task.subject,
      due_date: task.dueDate,
      duration_minutes: task.durationMinutes,
      completed: task.completed,
      priority: task.priority,
      owner_email: userEmail || null,
    });

    if (error) {
      console.warn('Supabase insertStudyTask error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

export async function updateStudyTaskInSupabase(task: StudyTask): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: false, error: 'Supabase not ready' };

  try {
    const { error } = await supabase
      .from('study_tasks')
      .update({
        completed: task.completed,
        title: task.title,
        subject: task.subject,
        due_date: task.dueDate,
        duration_minutes: task.durationMinutes,
        priority: task.priority,
      })
      .eq('id', task.id);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

export async function deleteStudyTaskFromSupabase(taskId: string): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: false, error: 'Supabase not ready' };

  try {
    const { error } = await supabase.from('study_tasks').delete().eq('id', taskId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

// =========================================================================
// 5. User Bookmarks Persistence
// =========================================================================

export async function fetchBookmarksFromSupabase(userEmail: string): Promise<string[]> {
  if (!supabase || !userEmail) return [];

  try {
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('resource_id')
      .eq('user_email', userEmail);

    if (error || !data) return [];
    return data.map((row) => row.resource_id);
  } catch {
    return [];
  }
}

export async function saveBookmarkToSupabase(userEmail: string, resourceId: string): Promise<boolean> {
  if (!supabase || !userEmail || !resourceId) return false;

  try {
    const { error } = await supabase.from('user_bookmarks').upsert(
      {
        user_email: userEmail,
        resource_id: resourceId,
      },
      { onConflict: 'user_email,resource_id' }
    );
    return !error;
  } catch {
    return false;
  }
}

export async function removeBookmarkFromSupabase(userEmail: string, resourceId: string): Promise<boolean> {
  if (!supabase || !userEmail || !resourceId) return false;

  try {
    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('user_email', userEmail)
      .eq('resource_id', resourceId);
    return !error;
  } catch {
    return false;
  }
}

// =========================================================================
// 6. User Feedback Persistence
// =========================================================================

export async function insertFeedbackToSupabase(feedback: {
  category: string;
  rating?: number;
  feedbackText: string;
  contactEmail?: string;
  userEmail?: string | null;
}): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: false, error: 'Supabase not ready' };

  try {
    const { error } = await supabase.from('user_feedback').insert({
      user_email: feedback.userEmail || null,
      category: feedback.category,
      rating: feedback.rating || 5,
      feedback_text: feedback.feedbackText,
      contact_email: feedback.contactEmail || null,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}
