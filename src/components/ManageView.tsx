import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Bookmark,
  Globe,
  Lock,
  Trash2,
  Edit3,
  Eye,
  Plus,
  ArrowLeft,
  Check,
  FileText,
  X,
  Share2,
  Sparkles,
  AlertTriangle,
  LayoutGrid,
  List,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Download,
  Calendar,
  Layers,
  HardDrive,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import type { AcademicResource, ResourceFormat, SubjectType } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';

interface ManageViewProps {
  theme: ThemeColors;
  resources: AcademicResource[];
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  onOpenResource: (resource: AcademicResource) => void;
  onOpenShareModal: () => void;
  onGoToHome: () => void;
  onBrowsePublic?: () => void;
  onDeleteResource?: (id: string) => void;
  onUpdateResource?: (resource: AcademicResource) => void;
}

type ManageTab = 'my-uploaded' | 'bookmark-items' | 'public-saved';
type ViewMode = 'grid' | 'list';
type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'type';

export interface FileTypeMeta {
  label: string;
  tag: string;
  accentColor: string;
  iconBgHex: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardTopBorder: string;
}

export const getFileTypeMeta = (format: ResourceFormat, fileName?: string): FileTypeMeta => {
  const ext = fileName ? fileName.split('.').pop()?.toUpperCase() : format;
  switch (format) {
    case 'PDF':
      return {
        label: 'PDF Document',
        tag: ext || 'PDF',
        accentColor: '#EF4444',
        iconBgHex: 'rgba(239, 68, 68, 0.14)',
        borderColor: 'rgba(239, 68, 68, 0.35)',
        badgeBg: 'bg-rose-500/15 dark:bg-rose-500/25',
        badgeText: 'text-rose-600 dark:text-rose-300',
        badgeBorder: 'border-rose-500/30',
        cardTopBorder: 'from-rose-500 via-rose-500/40 to-transparent',
      };
    case 'DOC':
      return {
        label: 'Word Document',
        tag: ext || 'DOCX',
        accentColor: '#3B82F6',
        iconBgHex: 'rgba(59, 130, 246, 0.14)',
        borderColor: 'rgba(59, 130, 246, 0.35)',
        badgeBg: 'bg-blue-500/15 dark:bg-blue-500/25',
        badgeText: 'text-blue-600 dark:text-blue-300',
        badgeBorder: 'border-blue-500/30',
        cardTopBorder: 'from-blue-500 via-blue-500/40 to-transparent',
      };
    case 'Slides':
    case 'PPT':
      return {
        label: 'Slide Deck',
        tag: ext || 'PPTX',
        accentColor: '#F97316',
        iconBgHex: 'rgba(249, 115, 22, 0.14)',
        borderColor: 'rgba(249, 115, 22, 0.35)',
        badgeBg: 'bg-orange-500/15 dark:bg-orange-500/25',
        badgeText: 'text-orange-600 dark:text-orange-300',
        badgeBorder: 'border-orange-500/30',
        cardTopBorder: 'from-orange-500 via-orange-500/40 to-transparent',
      };
    case 'Spreadsheet':
      return {
        label: 'Spreadsheet',
        tag: ext || 'XLSX',
        accentColor: '#10B981',
        iconBgHex: 'rgba(16, 185, 129, 0.14)',
        borderColor: 'rgba(16, 185, 129, 0.35)',
        badgeBg: 'bg-emerald-500/15 dark:bg-emerald-500/25',
        badgeText: 'text-emerald-600 dark:text-emerald-300',
        badgeBorder: 'border-emerald-500/30',
        cardTopBorder: 'from-emerald-500 via-emerald-500/40 to-transparent',
      };
    case 'Photo':
      return {
        label: 'Photo / Whiteboard',
        tag: ext || 'IMG',
        accentColor: '#14B8A6',
        iconBgHex: 'rgba(20, 184, 166, 0.14)',
        borderColor: 'rgba(20, 184, 166, 0.35)',
        badgeBg: 'bg-teal-500/15 dark:bg-teal-500/25',
        badgeText: 'text-teal-600 dark:text-teal-300',
        badgeBorder: 'border-teal-500/30',
        cardTopBorder: 'from-teal-500 via-teal-500/40 to-transparent',
      };
    default:
      return {
        label: 'Study Notes',
        tag: ext || 'NOTES',
        accentColor: '#8E74DB',
        iconBgHex: 'rgba(142, 116, 219, 0.14)',
        borderColor: 'rgba(142, 116, 219, 0.35)',
        badgeBg: 'bg-purple-500/15 dark:bg-purple-500/25',
        badgeText: 'text-purple-600 dark:text-purple-300',
        badgeBorder: 'border-purple-500/30',
        cardTopBorder: 'from-purple-500 via-purple-500/40 to-transparent',
      };
  }
};

export const formatDateDDMMYY = (dateStr?: string): string => {
  if (!dateStr) {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = String(now.getFullYear()).slice(-2);
    return `${d}-${m}-${y}`;
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parts[0].slice(-2);
    const m = parts[1].padStart(2, '0');
    const d = parts[2].slice(0, 2).padStart(2, '0');
    return `${d}-${m}-${y}`;
  }
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = String(date.getFullYear()).slice(-2);
      return `${d}-${m}-${y}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
};

export const ManageView: React.FC<ManageViewProps> = ({
  theme,
  resources,
  bookmarks,
  onToggleBookmark,
  onOpenResource,
  onOpenShareModal,
  onGoToHome,
  onBrowsePublic,
  onDeleteResource,
  onUpdateResource,
}) => {
  // 1. Navigation & View Layout State
  const [activeTab, setActiveTab] = useState<ManageTab>('my-uploaded');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // 2. Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('All');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [privacyFilter, setPrivacyFilter] = useState<'All' | 'public' | 'private'>('All');
  const [bookmarkedOnly, setBookmarkedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // 3. Dropdown Menu State for List View & Visibility Picker
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [privacyMenuId, setPrivacyMenuId] = useState<string | null>(null);

  // 4. Edit Details Modal State
  const [editingResource, setEditingResource] = useState<AcademicResource | null>(null);
  const [editFileName, setEditFileName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editFormat, setEditFormat] = useState<ResourceFormat>('PDF');
  const [editSubject, setEditSubject] = useState<SubjectType>('Computer Science');
  const [editIsPublic, setEditIsPublic] = useState(true);

  // 5. Delete Confirmation Modal State
  const [deletingResource, setDeletingResource] = useState<AcademicResource | null>(null);

  // 6. Success Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.action-menu-container')) {
        setOpenMenuId(null);
      }
      if (!(e.target as HTMLElement).closest('.privacy-menu-container')) {
        setPrivacyMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Compute Base Collections for Tabs
  const myUploadedBase = useMemo(
    () => resources.filter((r) => r.id.startsWith('user-res-') || r.author.toLowerCase().includes('you')),
    [resources]
  );
  const bookmarkItemsBase = useMemo(
    () => resources.filter((r) => bookmarks.includes(r.id)),
    [resources, bookmarks]
  );
  const publicSavedBase = useMemo(
    () => resources.filter((r) => r.isPublic && bookmarks.includes(r.id)),
    [resources, bookmarks]
  );

  // Determine current active list based on selected Tab
  const currentTabBaseList = useMemo(() => {
    switch (activeTab) {
      case 'my-uploaded':
        return myUploadedBase;
      case 'bookmark-items':
        return bookmarkItemsBase;
      case 'public-saved':
        return publicSavedBase;
    }
  }, [activeTab, myUploadedBase, bookmarkItemsBase, publicSavedBase]);

  // Apply Search, Filters, and Sorting to current collection
  const filteredAndSortedList = useMemo(() => {
    let result = [...currentTabBaseList];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((r) => {
        const name = (r.fileName || '').toLowerCase();
        const title = r.title.toLowerCase();
        const subject = r.subject.toLowerCase();
        const author = r.author.toLowerCase();
        const summary = r.summary.toLowerCase();
        return name.includes(q) || title.includes(q) || subject.includes(q) || author.includes(q) || summary.includes(q);
      });
    }

    // Format filter
    if (formatFilter !== 'All') {
      result = result.filter((r) => r.format === formatFilter);
    }

    // Subject filter
    if (subjectFilter !== 'All') {
      result = result.filter((r) => r.subject === subjectFilter);
    }

    // Privacy filter
    if (privacyFilter === 'public') {
      result = result.filter((r) => r.isPublic === true);
    } else if (privacyFilter === 'private') {
      result = result.filter((r) => r.isPublic === false);
    }

    // Bookmarked-only filter
    if (bookmarkedOnly) {
      result = result.filter((r) => bookmarks.includes(r.id));
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return (b.dateAdded || '').localeCompare(a.dateAdded || '');
        case 'date-asc':
          return (a.dateAdded || '').localeCompare(b.dateAdded || '');
        case 'name-asc':
          return (a.fileName || a.title).localeCompare(b.fileName || b.title);
        case 'name-desc':
          return (b.fileName || b.title).localeCompare(a.fileName || a.title);
        case 'type':
          return a.format.localeCompare(b.format);
        default:
          return 0;
      }
    });

    return result;
  }, [currentTabBaseList, searchQuery, formatFilter, subjectFilter, privacyFilter, bookmarkedOnly, sortBy, bookmarks]);

  // Handle Edit details modal open
  const handleOpenEdit = (res: AcademicResource) => {
    setEditingResource(res);
    setEditFileName(res.fileName || `${res.title.replace(/\s+/g, '_')}.${res.format.toLowerCase()}`);
    setEditTitle(res.title);
    setEditFormat(res.format);
    setEditSubject(res.subject);
    setEditIsPublic(res.isPublic);
    setOpenMenuId(null);
  };

  // Handle Save Edit details
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;

    const updated: AcademicResource = {
      ...editingResource,
      fileName: editFileName.trim() || editingResource.fileName,
      title: editTitle.trim() || editingResource.title,
      format: editFormat,
      subject: editSubject,
      isPublic: editIsPublic,
    };

    onUpdateResource?.(updated);
    setEditingResource(null);
    showToast('File details updated successfully!');
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = () => {
    if (!deletingResource) return;
    onDeleteResource?.(deletingResource.id);
    showToast(`Deleted "${deletingResource.fileName || deletingResource.title}"`);
    setDeletingResource(null);
    setOpenMenuId(null);
  };

  // Handle Public/Private Visibility 1-Click Toggle
  const handleTogglePrivacy = (res: AcademicResource) => {
    const updated: AcademicResource = {
      ...res,
      isPublic: !res.isPublic,
    };
    onUpdateResource?.(updated);
    showToast(`Visibility updated to ${!res.isPublic ? 'Public 🌐' : 'Private 🔒'}`);
  };

  // Handle Setting Explicit Visibility (Public or Private)
  const handleSetPrivacy = (res: AcademicResource, isPublic: boolean) => {
    const updated: AcademicResource = {
      ...res,
      isPublic,
    };
    onUpdateResource?.(updated);
    showToast(`Visibility set to ${isPublic ? 'Public 🌐' : 'Private 🔒'}`);
    setPrivacyMenuId(null);
  };

  // Handle File Download Action
  const handleDownloadFile = (res: AcademicResource) => {
    const name = res.fileName || `${res.title.replace(/\s+/g, '_')}.${res.format.toLowerCase()}`;
    const content = res.fileData || `STUDYSPACE ACADEMIC NOTE\n\nTitle: ${res.title}\nSubject: ${res.subject}\nAuthor: ${res.author}\nDate: ${res.dateAdded}\nSummary: ${res.summary}\n`;
    const blob = new Blob([content], { type: res.fileMimeType || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${name}`);
    setOpenMenuId(null);
  };

  // Clear all filters
  const hasActiveFilters = searchQuery !== '' || formatFilter !== 'All' || subjectFilter !== 'All' || privacyFilter !== 'All' || bookmarkedOnly;
  const handleClearFilters = () => {
    setSearchQuery('');
    setFormatFilter('All');
    setSubjectFilter('All');
    setPrivacyFilter('All');
    setBookmarkedOnly(false);
  };

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl animate-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
              StudySpace Storage
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: theme.textPrimary }}>
            Manage Materials
          </h1>
          <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: theme.textSecondary }}>
            Organize personal uploads, bookmarked decks, and peer-contributed study documents
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={onOpenShareModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
          >
            <Plus className="w-4 h-4" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={onGoToHome}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: theme.surfaceBorder, color: theme.textPrimary }}
          >
            ← Home
          </button>
        </div>
      </div>

      {/* 5. Existing Library Tabs */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 border-b pb-4" style={{ borderColor: theme.surfaceBorder }}>
        {/* Tab 1: My Uploaded Files */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('my-uploaded');
            setOpenMenuId(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'my-uploaded' ? 'shadow-md scale-102 ring-1 ring-purple-400/40' : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: activeTab === 'my-uploaded' ? '#DCD1FA' : 'transparent',
            color: activeTab === 'my-uploaded' ? '#302747' : theme.textSecondary,
            border: `1.5px solid ${activeTab === 'my-uploaded' ? '#DCD1FA' : theme.surfaceBorder}`,
          }}
        >
          <UploadCloud className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>My Uploaded Files</span>
          <span
            className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black"
            style={{
              backgroundColor: activeTab === 'my-uploaded' ? '#302747' : theme.surfaceBorder,
              color: activeTab === 'my-uploaded' ? '#FFF9F0' : theme.textPrimary,
            }}
          >
            {myUploadedBase.length}
          </span>
        </button>

        {/* Tab 2: Bookmark Items */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('bookmark-items');
            setOpenMenuId(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'bookmark-items' ? 'shadow-md scale-102 ring-1 ring-amber-400/40' : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: activeTab === 'bookmark-items' ? '#DCD1FA' : 'transparent',
            color: activeTab === 'bookmark-items' ? '#302747' : theme.textSecondary,
            border: `1.5px solid ${activeTab === 'bookmark-items' ? '#DCD1FA' : theme.surfaceBorder}`,
          }}
        >
          <Bookmark className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>Bookmark Items</span>
          <span
            className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black"
            style={{
              backgroundColor: activeTab === 'bookmark-items' ? '#302747' : theme.surfaceBorder,
              color: activeTab === 'bookmark-items' ? '#FFF9F0' : theme.textPrimary,
            }}
          >
            {bookmarkItemsBase.length}
          </span>
        </button>

        {/* Tab 3: Public Saved */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('public-saved');
            setOpenMenuId(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'public-saved' ? 'shadow-md scale-102 ring-1 ring-emerald-400/40' : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: activeTab === 'public-saved' ? '#DCD1FA' : 'transparent',
            color: activeTab === 'public-saved' ? '#302747' : theme.textSecondary,
            border: `1.5px solid ${activeTab === 'public-saved' ? '#DCD1FA' : theme.surfaceBorder}`,
          }}
        >
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>Public Saved</span>
          <span
            className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black"
            style={{
              backgroundColor: activeTab === 'public-saved' ? '#302747' : theme.surfaceBorder,
              color: activeTab === 'public-saved' ? '#FFF9F0' : theme.textPrimary,
            }}
          >
            {publicSavedBase.length}
          </span>
        </button>
      </div>

      {/* 4. Toolbar: Search, Filters, Sorting & Grid/List View Switch */}
      <div
        className="rounded-3xl p-3.5 sm:p-4 mb-6 backdrop-blur-2xl shadow-sm border transition-all"
        style={{
          backgroundColor: theme.isDark ? 'rgba(28, 22, 42, 0.75)' : 'rgba(255, 255, 255, 0.82)',
          borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(48, 39, 71, 0.12)',
        }}
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by filename, subject, or title..."
              className="w-full text-xs pl-9 pr-8 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8E74DB] transition-all"
              style={{
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9F8FD',
                border: `1px solid ${theme.surfaceBorder}`,
                color: theme.textPrimary,
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns and Quick Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Format Filter */}
            <div className="relative">
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                aria-label="Filter by file format"
                className="text-xs px-3 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8E74DB] font-bold cursor-pointer transition-all pr-7 appearance-none"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9F8FD',
                  border: `1px solid ${theme.surfaceBorder}`,
                  color: theme.textPrimary,
                }}
              >
                <option value="All">All Formats</option>
                <option value="PDF">PDF Documents</option>
                <option value="DOC">Word / DOC</option>
                <option value="Slides">Slide Decks</option>
                <option value="PPT">PPT Presentations</option>
                <option value="Notes">Study Notes</option>
                <option value="Spreadsheet">Spreadsheets</option>
                <option value="Photo">Photos</option>
              </select>
              <Filter className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
            </div>

            {/* Subject Filter */}
            <div className="relative">
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                aria-label="Filter by subject"
                className="text-xs px-3 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8E74DB] font-bold cursor-pointer transition-all pr-7 appearance-none"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9F8FD',
                  border: `1px solid ${theme.surfaceBorder}`,
                  color: theme.textPrimary,
                }}
              >
                <option value="All">All Subjects</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
                <option value="Business">Business</option>
              </select>
              <Layers className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
            </div>

            {/* Privacy Filter (All, Public, Private) */}
            <div className="relative">
              <select
                value={privacyFilter}
                onChange={(e) => setPrivacyFilter(e.target.value as 'All' | 'public' | 'private')}
                aria-label="Filter by visibility"
                className="text-xs px-3 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8E74DB] font-bold cursor-pointer transition-all pr-7 appearance-none"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9F8FD',
                  border: `1px solid ${theme.surfaceBorder}`,
                  color: theme.textPrimary,
                }}
              >
                <option value="All">All Visibility</option>
                <option value="public">🌐 Public Only</option>
                <option value="private">🔒 Private Only</option>
              </select>
              <Globe className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
            </div>

            {/* Bookmarked Only Quick Toggle */}
            <button
              type="button"
              onClick={() => setBookmarkedOnly((prev) => !prev)}
              title={bookmarkedOnly ? 'Show all files' : 'Show only bookmarked files'}
              className={`p-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                bookmarkedOnly
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40 ring-2 ring-amber-400/40'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-500'
              }`}
              style={{ borderColor: bookmarkedOnly ? undefined : theme.surfaceBorder }}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarkedOnly ? 'fill-amber-400 text-amber-500' : ''}`} />
              <span className="hidden sm:inline">Bookmarked</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort files"
                className="text-xs px-3 py-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8E74DB] font-bold cursor-pointer transition-all pr-7 appearance-none"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9F8FD',
                  border: `1px solid ${theme.surfaceBorder}`,
                  color: theme.textPrimary,
                }}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="type">File Format</option>
              </select>
              <ArrowUpDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
            </div>

            {/* Clear Filters Reset */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all"
              >
                Reset
              </button>
            )}

            {/* 3. View Switcher Toggle: Minimalist Grid / List Switch */}
            <div
              className="flex items-center p-1 rounded-2xl border ml-auto"
              style={{
                backgroundColor: theme.isDark ? 'rgba(20, 16, 30, 0.6)' : 'rgba(48, 39, 71, 0.05)',
                borderColor: theme.surfaceBorder,
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  viewMode === 'grid'
                    ? 'shadow-xs scale-105'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: viewMode === 'grid' ? (theme.isDark ? 'rgba(255, 255, 255, 0.18)' : '#302747') : 'transparent',
                  color: viewMode === 'grid' ? '#FFF9F0' : theme.textSecondary,
                }}
                title="Switch to Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  viewMode === 'list'
                    ? 'shadow-xs scale-105'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: viewMode === 'list' ? (theme.isDark ? 'rgba(255, 255, 255, 0.18)' : '#302747') : 'transparent',
                  color: viewMode === 'list' ? '#FFF9F0' : theme.textSecondary,
                }}
                title="Switch to List View"
                aria-label="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main File Listing: Empty State or Grid/List Render */}
      {filteredAndSortedList.length === 0 ? (
        <div
          className="p-12 text-center rounded-3xl backdrop-blur-2xl border transition-all"
          style={{
            backgroundColor: theme.isDark ? 'rgba(28, 22, 42, 0.65)' : 'rgba(255, 255, 255, 0.75)',
            borderColor: theme.surfaceBorder,
          }}
        >
          <UploadCloud className="w-12 h-12 mx-auto mb-3 opacity-40 text-purple-400" />
          <h3 className="font-black text-base" style={{ color: theme.textPrimary }}>
            {hasActiveFilters ? 'No files match your filters' : 'No items in this collection'}
          </h3>
          <p className="text-xs max-w-sm mx-auto mt-1 mb-5" style={{ color: theme.textSecondary }}>
            {hasActiveFilters
              ? 'Try resetting your search query, subject filter, or visibility parameters.'
              : activeTab === 'my-uploaded'
              ? 'Upload revision decks, notes, PDFs, or photos. You can choose whether each item is Public or Private.'
              : 'Bookmark resources from the public peer commons to organize them here.'}
          </p>

          <div className="flex items-center justify-center gap-2">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                style={{ borderColor: theme.surfaceBorder, color: theme.textPrimary }}
              >
                Clear All Filters
              </button>
            ) : activeTab === 'my-uploaded' ? (
              <button
                type="button"
                onClick={onOpenShareModal}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
              >
                <Plus className="w-4 h-4" />
                <span>Upload First File</span>
              </button>
            ) : onBrowsePublic ? (
              <button
                type="button"
                onClick={onBrowsePublic}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
              >
                <Globe className="w-4 h-4" />
                <span>Explore Public Resources</span>
              </button>
            ) : null}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* 1. GRID VIEW — DEFAULT */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedList.map((res) => {
            const isSaved = bookmarks.includes(res.id);
            const displayFileName = res.fileName || `${res.title.replace(/\s+/g, '_')}.${res.format.toLowerCase()}`;
            const fileMeta = getFileTypeMeta(res.format, res.fileName);
            const fileSize = res.fileSize || `${(res.pages ? res.pages * 0.16 + 0.4 : 1.2).toFixed(1)} MB`;

            return (
              <div
                key={res.id}
                className="rounded-3xl p-5 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl border relative overflow-hidden group"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(28, 22, 42, 0.75)' : 'rgba(255, 255, 255, 0.88)',
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(48, 39, 71, 0.12)',
                }}
              >
                {/* Top File-Type Color Accent Glow Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${fileMeta.cardTopBorder}`} />

                <div>
                  {/* 1. Type of file icon, name of file beside it */}
                  <div className="flex items-center gap-3 mb-3.5">
                    {/* Type of file icon */}
                    <div
                      className="w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-black text-xs shadow-xs relative transition-transform duration-200 group-hover:scale-105 shrink-0"
                      style={{
                        backgroundColor: fileMeta.iconBgHex,
                        border: `1.5px solid ${fileMeta.borderColor}`,
                      }}
                    >
                      <FileText className="w-5 h-5" style={{ color: fileMeta.accentColor }} />
                      <span
                        className="text-[8px] font-black tracking-tighter leading-none mt-0.5 uppercase"
                        style={{ color: fileMeta.accentColor }}
                      >
                        {fileMeta.tag}
                      </span>
                    </div>

                    {/* Name of file beside it - clean file name only with increased size for clear reading */}
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-base sm:text-[17px] font-extrabold tracking-tight truncate leading-snug"
                        style={{ color: theme.textPrimary }}
                        title={displayFileName}
                      >
                        {displayFileName}
                      </div>
                    </div>
                  </div>

                  {/* 2. No. of pages, size of file (in bracket), date(dd-mm-yy, left corner) */}
                  <div
                    className="flex items-center justify-between text-[11px] py-2 px-3 rounded-2xl border mb-3.5 backdrop-blur-sm"
                    style={{
                      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(48, 39, 71, 0.03)',
                      borderColor: theme.surfaceBorder,
                      color: theme.textMuted,
                    }}
                  >
                    {/* date(dd-mm-yy, left corner) */}
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold" title="Upload Date (dd-mm-yy)">
                      <Calendar className="w-3.5 h-3.5 opacity-65 text-purple-400" />
                      <span>{formatDateDDMMYY(res.dateAdded)}</span>
                    </div>

                    {/* no. of pages, size of file (in bracket) */}
                    <div className="flex items-center gap-1 font-semibold text-xs">
                      <span>{res.pages ? `${res.pages} pages` : '1 page'}</span>
                      <span className="font-bold opacity-80">({fileSize})</span>
                    </div>
                  </div>

                  {/* 3. Visibility: Two visible options (Private and Public) that react as specified */}
                  <div className="mb-3.5">
                    <div
                      className="inline-flex items-center p-0.5 rounded-xl border backdrop-blur-sm shadow-2xs transition-all"
                      style={{
                        backgroundColor: theme.isDark ? 'rgba(20, 16, 30, 0.65)' : 'rgba(48, 39, 71, 0.05)',
                        borderColor: theme.surfaceBorder,
                      }}
                      role="group"
                      aria-label="Visibility options"
                    >
                      {/* Private Option */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (res.isPublic) {
                            handleSetPrivacy(res, false);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                          !res.isPublic
                            ? 'shadow-xs scale-102 font-extrabold'
                            : 'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 font-semibold'
                        }`}
                        style={{
                          backgroundColor: !res.isPublic
                            ? (theme.isDark ? 'rgba(16, 185, 129, 0.22)' : '#ECFDF5')
                            : 'transparent',
                          color: !res.isPublic
                            ? (theme.isDark ? '#6EE7B7' : '#047857')
                            : theme.textSecondary,
                          border: !res.isPublic
                            ? (theme.isDark ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(16, 185, 129, 0.35)')
                            : '1px solid transparent',
                        }}
                        title="Set to Private only (visible only to you)"
                        aria-pressed={!res.isPublic}
                      >
                        <Lock className={`w-3.5 h-3.5 ${!res.isPublic ? 'text-emerald-500' : ''}`} />
                        <span>Private</span>
                        {!res.isPublic && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
                        )}
                      </button>

                      {/* Public Option */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!res.isPublic) {
                            handleSetPrivacy(res, true);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                          res.isPublic
                            ? 'shadow-xs scale-102 font-extrabold'
                            : 'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 font-semibold'
                        }`}
                        style={{
                          backgroundColor: res.isPublic
                            ? (theme.isDark ? 'rgba(168, 85, 247, 0.22)' : '#F3E8FF')
                            : 'transparent',
                          color: res.isPublic
                            ? (theme.isDark ? '#D8B4FE' : '#6B21A8')
                            : theme.textSecondary,
                          border: res.isPublic
                            ? (theme.isDark ? '1px solid rgba(168, 85, 247, 0.45)' : '1px solid rgba(168, 85, 247, 0.35)')
                            : '1px solid transparent',
                        }}
                        title="Set to Public only (visible to peers & community)"
                        aria-pressed={res.isPublic}
                      >
                        <Globe className={`w-3.5 h-3.5 ${res.isPublic ? 'text-purple-500' : ''}`} />
                        <span>Public</span>
                        {res.isPublic && (
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions: Icon-only buttons with animated pop-up tooltips on hover */}
                <div className="pt-3 border-t flex items-center justify-between gap-1" style={{ borderColor: theme.surfaceBorder }}>
                  {/* View / Open */}
                  <div className="relative group/btn flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => onOpenResource(res)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-115 active:scale-95 hover:bg-purple-500/10 cursor-pointer"
                      style={{ color: theme.textPrimary }}
                      aria-label="Preview Document"
                    >
                      <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400 transition-transform group-hover/btn:rotate-6" />
                    </button>
                    <div
                      role="tooltip"
                      className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 scale-90 group-hover/btn:scale-100 group-hover/btn:-translate-y-1 transition-all duration-200 pointer-events-none px-2.5 py-1 rounded-xl text-[10px] font-black whitespace-nowrap shadow-xl z-30"
                      style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
                    >
                      Preview Document
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#302747]" />
                    </div>
                  </div>

                  {/* Bookmark Option */}
                  <div className="relative group/btn flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        onToggleBookmark(res.id);
                        showToast(isSaved ? 'Removed from bookmarks' : 'Added to bookmarks ⭐');
                      }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-115 active:scale-95 hover:bg-amber-500/10 cursor-pointer"
                      style={{ color: isSaved ? '#F59E0B' : theme.textMuted }}
                      aria-label={isSaved ? 'Remove Bookmark' : 'Add Bookmark'}
                    >
                      <Bookmark
                        className={`w-4 h-4 transition-all ${
                          isSaved
                            ? 'fill-amber-400 text-amber-500 scale-105'
                            : 'text-gray-400 hover:text-amber-500'
                        }`}
                      />
                    </button>
                    <div
                      role="tooltip"
                      className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 scale-90 group-hover/btn:scale-100 group-hover/btn:-translate-y-1 transition-all duration-200 pointer-events-none px-2.5 py-1 rounded-xl text-[10px] font-black whitespace-nowrap shadow-xl z-30"
                      style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
                    >
                      {isSaved ? 'Bookmarked' : 'Add Bookmark'}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#302747]" />
                    </div>
                  </div>

                  {/* Download Option */}
                  <div className="relative group/btn flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(res)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-115 active:scale-95 hover:bg-emerald-500/10 cursor-pointer text-emerald-600 dark:text-emerald-400"
                      aria-label="Download File"
                    >
                      <Download className="w-4 h-4 transition-transform group-hover/btn:translate-y-0.5" />
                    </button>
                    <div
                      role="tooltip"
                      className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 scale-90 group-hover/btn:scale-100 group-hover/btn:-translate-y-1 transition-all duration-200 pointer-events-none px-2.5 py-1 rounded-xl text-[10px] font-black whitespace-nowrap shadow-xl z-30"
                      style={{ backgroundColor: '#059669', color: '#FFFFFF' }}
                    >
                      Download File
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#059669]" />
                    </div>
                  </div>

                  {/* Edit Details Option */}
                  <div className="relative group/btn flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(res)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-115 active:scale-95 hover:bg-indigo-500/10 cursor-pointer text-indigo-600 dark:text-indigo-400"
                      aria-label="Edit Details"
                    >
                      <Edit3 className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
                    </button>
                    <div
                      role="tooltip"
                      className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 scale-90 group-hover/btn:scale-100 group-hover/btn:-translate-y-1 transition-all duration-200 pointer-events-none px-2.5 py-1 rounded-xl text-[10px] font-black whitespace-nowrap shadow-xl z-30"
                      style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
                    >
                      Edit Details
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#302747]" />
                    </div>
                  </div>

                  {/* Delete Option */}
                  <div className="relative group/btn flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setDeletingResource(res)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-115 active:scale-95 hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                      aria-label="Delete File"
                    >
                      <Trash2 className="w-4 h-4 transition-transform group-hover/btn:-rotate-12" />
                    </button>
                    <div
                      role="tooltip"
                      className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 scale-90 group-hover/btn:scale-100 group-hover/btn:-translate-y-1 transition-all duration-200 pointer-events-none px-2.5 py-1 rounded-xl text-[10px] font-black whitespace-nowrap shadow-xl z-30"
                      style={{ backgroundColor: '#BE123C', color: '#FFFFFF' }}
                    >
                      Delete File
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#BE123C]" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 2. LIST VIEW — HORIZONTAL COMPACT ROWS */
        <div className="space-y-2.5">
          {/* Header Row for List View (desktop) */}
          <div
            className="hidden md:flex items-center justify-between px-5 py-2.5 rounded-2xl text-[11px] font-black tracking-wider uppercase opacity-70"
            style={{ color: theme.textMuted }}
          >
            <div className="flex-1 min-w-[260px]">File & Name</div>
            <div className="w-32 text-left">Subject</div>
            <div className="w-24 text-left">Size / Pgs</div>
            <div className="w-28 text-left">Date</div>
            <div className="w-36 text-left">Visibility</div>
            <div className="w-28 text-right pr-2">Actions</div>
          </div>

          {filteredAndSortedList.map((res) => {
            const isSaved = bookmarks.includes(res.id);
            const displayFileName = res.fileName || `${res.title.replace(/\s+/g, '_')}.${res.format.toLowerCase()}`;
            const fileMeta = getFileTypeMeta(res.format, res.fileName);
            const fileSize = res.fileSize || `${(res.pages ? res.pages * 0.16 + 0.4 : 1.2).toFixed(1)} MB`;
            const isMenuOpen = openMenuId === res.id;

            return (
              <div
                key={res.id}
                className="rounded-2xl p-3 sm:p-4 backdrop-blur-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs hover:shadow-md group"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(28, 22, 42, 0.72)' : 'rgba(255, 255, 255, 0.88)',
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(48, 39, 71, 0.12)',
                }}
              >
                {/* 1. File Icon & Filename Column */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex flex-col items-center justify-center font-black text-xs shadow-2xs shrink-0"
                    style={{
                      backgroundColor: fileMeta.iconBgHex,
                      border: `1.5px solid ${fileMeta.borderColor}`,
                    }}
                  >
                    <FileText className="w-4 h-4" style={{ color: fileMeta.accentColor }} />
                    <span className="text-[7px] font-black uppercase mt-0.5" style={{ color: fileMeta.accentColor }}>
                      {fileMeta.tag}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="text-sm sm:text-base font-extrabold tracking-tight truncate leading-snug"
                      style={{ color: theme.textPrimary }}
                      title={displayFileName}
                    >
                      {displayFileName}
                    </div>
                  </div>
                </div>

                {/* 2. Subject Column */}
                <div className="w-full md:w-32 flex items-center justify-between md:justify-start">
                  <span className="md:hidden text-[10px] font-bold" style={{ color: theme.textMuted }}>Subject:</span>
                  <span
                    className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider"
                    style={{ backgroundColor: '#DCD1FA', color: '#302747' }}
                  >
                    {res.subject}
                  </span>
                </div>

                {/* 3. Size / Pages Column */}
                <div className="w-full md:w-32 flex items-center justify-between md:justify-start text-xs font-semibold" style={{ color: theme.textMuted }}>
                  <span className="md:hidden text-[10px] font-bold">Size:</span>
                  <span>{res.pages ? `${res.pages} pages` : '1 page'} <span className="opacity-80 font-bold">({fileSize})</span></span>
                </div>

                {/* 4. Upload Date Column */}
                <div className="w-full md:w-28 flex items-center justify-between md:justify-start text-xs font-medium" style={{ color: theme.textMuted }}>
                  <span className="md:hidden text-[10px] font-bold">Uploaded:</span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                    <Calendar className="w-3.5 h-3.5 opacity-65 text-purple-400" />
                    <span>{formatDateDDMMYY(res.dateAdded)}</span>
                  </span>
                </div>

                {/* 5. Visibility Column (Two visible options: Private and Public) */}
                <div className="w-full md:w-36 flex items-center justify-between md:justify-start">
                  <span className="md:hidden text-[10px] font-bold" style={{ color: theme.textMuted }}>Visibility:</span>
                  <div
                    className="inline-flex items-center p-0.5 rounded-xl border backdrop-blur-sm"
                    style={{
                      backgroundColor: theme.isDark ? 'rgba(20, 16, 30, 0.65)' : 'rgba(48, 39, 71, 0.05)',
                      borderColor: theme.surfaceBorder,
                    }}
                    role="group"
                    aria-label="Visibility options"
                  >
                    {/* Private Option */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (res.isPublic) handleSetPrivacy(res, false);
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        !res.isPublic
                          ? 'shadow-xs font-extrabold'
                          : 'opacity-60 hover:opacity-100 font-semibold'
                      }`}
                      style={{
                        backgroundColor: !res.isPublic
                          ? (theme.isDark ? 'rgba(16, 185, 129, 0.22)' : '#ECFDF5')
                          : 'transparent',
                        color: !res.isPublic
                          ? (theme.isDark ? '#6EE7B7' : '#047857')
                          : theme.textSecondary,
                        border: !res.isPublic
                          ? (theme.isDark ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(16, 185, 129, 0.35)')
                          : '1px solid transparent',
                      }}
                      title="Set to Private only"
                      aria-pressed={!res.isPublic}
                    >
                      <Lock className={`w-3 h-3 ${!res.isPublic ? 'text-emerald-500' : ''}`} />
                      <span>Private</span>
                    </button>

                    {/* Public Option */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!res.isPublic) handleSetPrivacy(res, true);
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                        res.isPublic
                          ? 'shadow-xs font-extrabold'
                          : 'opacity-60 hover:opacity-100 font-semibold'
                      }`}
                      style={{
                        backgroundColor: res.isPublic
                          ? (theme.isDark ? 'rgba(168, 85, 247, 0.22)' : '#F3E8FF')
                          : 'transparent',
                        color: res.isPublic
                          ? (theme.isDark ? '#D8B4FE' : '#6B21A8')
                          : theme.textSecondary,
                        border: res.isPublic
                          ? (theme.isDark ? '1px solid rgba(168, 85, 247, 0.45)' : '1px solid rgba(168, 85, 247, 0.35)')
                          : '1px solid transparent',
                      }}
                      title="Set to Public only"
                      aria-pressed={res.isPublic}
                    >
                      <Globe className={`w-3 h-3 ${res.isPublic ? 'text-purple-500' : ''}`} />
                      <span>Public</span>
                    </button>
                  </div>
                </div>

                {/* 6. Action Controls & Three-Dot Dropdown Menu */}
                <div className="w-full md:w-28 flex items-center justify-end gap-1.5 pt-2 md:pt-0 border-t md:border-t-0" style={{ borderColor: theme.surfaceBorder }}>
                  {/* Bookmark Toggle Icon */}
                  <button
                    type="button"
                    onClick={() => {
                      onToggleBookmark(res.id);
                      showToast(isSaved ? 'Removed from bookmarks' : 'Added to bookmarks ⭐');
                    }}
                    className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    style={{ color: isSaved ? '#F59E0B' : theme.textMuted }}
                    title={isSaved ? 'Bookmarked' : 'Add Bookmark'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-500' : ''}`} />
                  </button>

                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={() => onOpenResource(res)}
                    className="p-2 rounded-xl hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 transition-colors cursor-pointer"
                    title="Preview file"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Three-Dot Menu Container */}
                  <div className="relative action-menu-container">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : res.id);
                      }}
                      className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      style={{ color: theme.textSecondary }}
                      title="More actions"
                      aria-label="More actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div
                        className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl p-1.5 shadow-2xl border z-40 animate-in fade-in zoom-in-95 backdrop-blur-2xl"
                        style={{
                          backgroundColor: theme.isDark ? '#261F36' : '#FFFFFF',
                          borderColor: theme.surfaceBorder,
                          color: theme.textPrimary,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onOpenResource(res);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold hover:bg-purple-500/15 cursor-pointer text-left"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-500" />
                          <span>Preview File</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadFile(res)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 cursor-pointer text-left"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download File</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(res)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 cursor-pointer text-left"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleTogglePrivacy(res);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-left"
                        >
                          {res.isPublic ? <Lock className="w-3.5 h-3.5 text-emerald-500" /> : <Globe className="w-3.5 h-3.5 text-purple-500" />}
                          <span>Make {res.isPublic ? 'Private' : 'Public'}</span>
                        </button>

                        <div className="my-1 border-t" style={{ borderColor: theme.surfaceBorder }} />

                        <button
                          type="button"
                          onClick={() => {
                            setDeletingResource(res);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold hover:bg-rose-500/15 text-rose-500 cursor-pointer text-left"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete File</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT DETAILS MODAL */}
      {editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl border animate-in zoom-in-95 backdrop-blur-2xl"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.surfaceBorder,
              color: theme.textPrimary,
            }}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: theme.surfaceBorder }}>
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-black text-base">Edit File Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingResource(null)}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* File Name */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                  File Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFileName}
                  onChange={(e) => setEditFileName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8E74DB]"
                  style={{
                    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9F8FD',
                    border: `1px solid ${theme.surfaceBorder}`,
                    color: theme.textPrimary,
                  }}
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                  Display Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8E74DB]"
                  style={{
                    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9F8FD',
                    border: `1px solid ${theme.surfaceBorder}`,
                    color: theme.textPrimary,
                  }}
                />
              </div>

              {/* Type / Format & Subject */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                    File Type
                  </label>
                  <select
                    value={editFormat}
                    onChange={(e) => setEditFormat(e.target.value as ResourceFormat)}
                    className="w-full text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8E74DB]"
                    style={{
                      backgroundColor: theme.isDark ? '#2D2540' : '#F9F8FD',
                      border: `1px solid ${theme.surfaceBorder}`,
                      color: theme.textPrimary,
                    }}
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOC">DOC / Word</option>
                    <option value="Notes">Notes</option>
                    <option value="Slides">Slides</option>
                    <option value="PPT">PPT Presentation</option>
                    <option value="Spreadsheet">Spreadsheet</option>
                    <option value="Photo">Photo / Whiteboard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                    Subject
                  </label>
                  <select
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value as SubjectType)}
                    className="w-full text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8E74DB]"
                    style={{
                      backgroundColor: theme.isDark ? '#2D2540' : '#F9F8FD',
                      border: `1px solid ${theme.surfaceBorder}`,
                      color: theme.textPrimary,
                    }}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              {/* Privacy Setting: Public / Private ONLY */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textPrimary }}>
                  Privacy Setting
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditIsPublic(true)}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      editIsPublic ? 'ring-2 ring-purple-500 bg-purple-500/15' : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={{ borderColor: theme.surfaceBorder }}
                  >
                    <Globe className="w-3.5 h-3.5 text-purple-600" />
                    <span>Public</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditIsPublic(false)}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      !editIsPublic ? 'ring-2 ring-emerald-500 bg-emerald-500/15' : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={{ borderColor: theme.surfaceBorder }}
                  >
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Private</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t" style={{ borderColor: theme.surfaceBorder }}>
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-sm rounded-3xl p-6 shadow-2xl border text-center animate-in zoom-in-95 backdrop-blur-2xl"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.surfaceBorder,
              color: theme.textPrimary,
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-black text-lg mb-1">Delete File?</h3>
            <p className="text-xs mb-5" style={{ color: theme.textSecondary }}>
              Are you sure you want to delete <span className="font-bold underline">{deletingResource.fileName || deletingResource.title}</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingResource(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-md cursor-pointer hover:bg-rose-700 transition-colors"
              >
                Yes, Delete File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
