import type { AcademicResource, StudyTask, SubjectType } from '../types/index.ts';

// Clean dataset: No sample or placeholder academic resources
export const INITIAL_RESOURCES: AcademicResource[] = [];

// Clean dataset: No sample study planner tasks
export const INITIAL_STUDY_TASKS: StudyTask[] = [];

export const BOOKMARKS_STORAGE_KEY = 'studyspace_bookmarks';

export function loadSavedBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveBookmarks(bookmarks: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // ignore
  }
}

export function filterAcademicResources(
  resources: AcademicResource[],
  query: string,
  selectedSubject?: SubjectType | 'All',
  selectedFormat?: string
): AcademicResource[] {
  const cleanQuery = query.trim().toLowerCase();

  return resources.filter((res) => {
    // Subject filter
    if (selectedSubject && selectedSubject !== 'All' && res.subject !== selectedSubject) {
      return false;
    }
    // Format filter
    if (selectedFormat && selectedFormat !== 'All' && res.format !== selectedFormat) {
      return false;
    }
    // Query search
    if (cleanQuery) {
      const matchTitle = res.title.toLowerCase().includes(cleanQuery);
      const matchSubject = res.subject.toLowerCase().includes(cleanQuery);
      const matchTopics = res.topics.some((t) => t.toLowerCase().includes(cleanQuery));
      const matchAuthor = res.author.toLowerCase().includes(cleanQuery);
      const matchSummary = res.summary.toLowerCase().includes(cleanQuery);
      return matchTitle || matchSubject || matchTopics || matchAuthor || matchSummary;
    }
    return true;
  });
}
