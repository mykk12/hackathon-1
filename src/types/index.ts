export type SubjectType = 'Computer Science' | 'Mathematics' | 'Biology' | 'Business';

export type ResourceFormat = 'PDF' | 'Notes' | 'Slides' | 'PPT' | 'DOC' | 'Photo' | 'Spreadsheet';

export interface AcademicResource {
  id: string;
  title: string;
  subject: SubjectType;
  format: ResourceFormat;
  author: string;
  institution?: string;
  readsCount: number;
  rating: number;
  pages?: number;
  summary: string;
  topics: string[];
  isPublic: boolean;
  dateAdded: string;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  fileData?: string;
  fileMimeType?: string;
  ownerEmail?: string;
  userEntryId?: string;
}

export interface StudyTask {
  id: string;
  title: string;
  subject: SubjectType;
  dueDate: string;
  durationMinutes: number;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'max';
  userEntryId?: string;
}

export type SidebarTab = 'home' | 'dashboard' | 'manage' | 'study-plan' | 'feedback';

export interface UserRegistrationData {
  fullName: string;
  age: string;
  educationLevel: 'school' | 'college' | '';
  schoolClass?: string;
  collegeName?: string;
  collegeCourse?: string;
  collegeYear?: string;
  collegeSemester?: string;
  email: string;
  mobile: string;
  otp?: string;
}

export interface UserEntry {
  id: string;
  userEmail: string;
  fullName: string;
  mobile?: string;
  age?: string;
  educationLevel?: 'school' | 'college' | '';
  schoolClass?: string;
  collegeName?: string;
  collegeCourse?: string;
  collegeYear?: string;
  collegeSemester?: string;
  entryType?: string;
  notes?: string;
  createdAt: string;
}
