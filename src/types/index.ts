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
}

export interface StudyTask {
  id: string;
  title: string;
  subject: SubjectType;
  dueDate: string;
  durationMinutes: number;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'max';
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
