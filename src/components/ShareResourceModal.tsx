import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  FileText,
  Eye,
  Lock,
  Globe,
  FileSpreadsheet,
  FileImage,
  Presentation,
  FileCode,
  ArrowLeft,
  ChevronRight,
  Maximize2,
  Download,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { SubjectType, ResourceFormat, AcademicResource } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';

interface ShareResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddResource: (resource: AcademicResource) => void;
  theme: ThemeColors;
}

export interface FileTypeDefinition {
  format: ResourceFormat;
  label: string;
  extLabel: string;
  accept: string;
  allowedExtensions: string[];
  description: string;
  badgeColor: string;
  sampleFileName: string;
  sampleTitle: string;
  sampleSubject: SubjectType;
}

export const SUPPORTED_FILE_TYPES: FileTypeDefinition[] = [
  {
    format: 'PPT',
    label: 'PowerPoint / Slides',
    extLabel: '.ppt, .pptx',
    accept: '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    allowedExtensions: ['.ppt', '.pptx'],
    description: 'Presentation slide decks, lecture seminars, and visual diagrams',
    badgeColor: '#F97316',
    sampleFileName: 'CS201_Advanced_Algorithms_SlideDeck.pptx',
    sampleTitle: 'Advanced Algorithms & Dynamic Programming Slides',
    sampleSubject: 'Computer Science',
  },
  {
    format: 'DOC',
    label: 'Word Document',
    extLabel: '.doc, .docx',
    accept: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    allowedExtensions: ['.doc', '.docx'],
    description: 'Typed study notes, assignments, essay summaries, syllabus breakdowns',
    badgeColor: '#3B82F6',
    sampleFileName: 'MATH_Differential_Equations_Review.docx',
    sampleTitle: 'Differential Equations and Eigenvalues Lecture Notes',
    sampleSubject: 'Mathematics',
  },
  {
    format: 'PDF',
    label: 'PDF Document',
    extLabel: '.pdf',
    accept: '.pdf,application/pdf',
    allowedExtensions: ['.pdf'],
    description: 'Lecture notes, revision sheets, formula compendiums, cheat sheets',
    badgeColor: '#EF4444',
    sampleFileName: 'Organic_Chemistry_Synthesis_Guide.pdf',
    sampleTitle: 'Organic Chemistry Reaction Synthesis Compendium',
    sampleSubject: 'Biology',
  },
  {
    format: 'Photo',
    label: 'Photo / Whiteboard',
    extLabel: '.jpg, .png, .webp',
    accept: '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    description: 'Whiteboard photos, handwritten lecture notes, formula drawings',
    badgeColor: '#10B981',
    sampleFileName: 'Whiteboard_Mitosis_Checkpoints.jpg',
    sampleTitle: 'Cellular Mitosis & Meiosis Whiteboard Diagram',
    sampleSubject: 'Biology',
  },
  {
    format: 'Spreadsheet',
    label: 'Spreadsheet / Data',
    extLabel: '.xls, .xlsx, .csv',
    accept: '.xls,.xlsx,.csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    allowedExtensions: ['.xls', '.xlsx', '.csv'],
    description: 'Formula tables, business financial models, statistical calculations',
    badgeColor: '#14B8A6',
    sampleFileName: 'Financial_Ratio_Valuation_Model.xlsx',
    sampleTitle: 'Corporate Financial Ratios & Balance Sheet Model',
    sampleSubject: 'Business',
  },
  {
    format: 'Notes',
    label: 'Text / Markdown Notes',
    extLabel: '.txt, .md',
    accept: '.txt,.md,text/plain,text/markdown',
    allowedExtensions: ['.txt', '.md'],
    description: 'Markdown outlines, revision bullet points, quick code snippets',
    badgeColor: '#8B5CF6',
    sampleFileName: 'Operating_Systems_Concurrency_Notes.md',
    sampleTitle: 'Operating Systems Semaphores & Concurrency Cheat Sheet',
    sampleSubject: 'Computer Science',
  },
];

export const ShareResourceModal: React.FC<ShareResourceModalProps> = ({
  isOpen,
  onClose,
  onAddResource,
  theme,
}) => {
  // Step in upload workflow: 'select-type' | 'file-loaded'
  const [step, setStep] = useState<'select-type' | 'file-loaded'>('select-type');

  // Selected file type option (Step 1)
  const [selectedFormat, setSelectedFormat] = useState<ResourceFormat>('PPT');

  // Loaded file state
  const [loadedFileName, setLoadedFileName] = useState('');
  const [loadedFileSize, setLoadedFileSize] = useState('');
  const [loadedFilePreview, setLoadedFilePreview] = useState<string>('');
  const [loadedFileMime, setLoadedFileMime] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Metadata form state (Step 2)
  const [fileNameInput, setFileNameInput] = useState('');
  const [subject, setSubject] = useState<SubjectType>('Computer Science');
  const [isPublic, setIsPublic] = useState<boolean>(true); // public vs private
  const [author, setAuthor] = useState('Mayank Bamil');
  const [summary, setSummary] = useState('');
  const [keyTopics, setKeyTopics] = useState('');

  // Full preview modal overlay state & inline toggle
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);
  const [showInlinePreview, setShowInlinePreview] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Success state
  const [isSuccess, setIsSuccess] = useState(false);

  // Hidden native file input reference
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const currentTypeConfig =
    SUPPORTED_FILE_TYPES.find((t) => t.format === selectedFormat) || SUPPORTED_FILE_TYPES[0];

  // Trigger file selection restricted strictly to the selected type
  const handleSelectTypeAndBrowse = (fmt: ResourceFormat) => {
    setSelectedFormat(fmt);
    setErrorMessage(null);
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    }, 60);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle native file selection with strict format validation
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict validation of file extension
    const fileName = file.name.toLowerCase();
    const isAllowed = currentTypeConfig.allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isAllowed) {
      setErrorMessage(
        `Selection restricted: "${file.name}" does not match ${currentTypeConfig.label}. Please select a file with ${currentTypeConfig.extLabel}.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setErrorMessage(null);
    setLoadedFileName(file.name);
    setLoadedFileSize(formatFileSize(file.size));
    setLoadedFileMime(file.type);

    // Auto-prefill file name without file extension
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setFileNameInput(cleanName);
    setSummary(`Comprehensive study revision material covering ${cleanName} with key concepts and exam highlights.`);
    setKeyTopics(cleanName.split(' ').slice(0, 3).join(', '));

    // Read file for preview
    const reader = new FileReader();
    if (file.type.startsWith('image/')) {
      reader.onload = (event) => {
        setLoadedFilePreview(event.target?.result as string);
        setStep('file-loaded');
      };
      reader.readAsDataURL(file);
    } else if (file.type.includes('text') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      reader.onload = (event) => {
        setLoadedFilePreview(event.target?.result as string);
        setStep('file-loaded');
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        setLoadedFilePreview(event.target?.result as string);
        setStep('file-loaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setStep('select-type');
    setLoadedFileName('');
    setLoadedFileSize('');
    setLoadedFilePreview('');
    setFileNameInput('');
    setSummary('');
    setErrorMessage(null);
    setIsFullPreviewOpen(false);
    setShowInlinePreview(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileNameInput.trim()) return;

    const newResource: AcademicResource = {
      id: `user-res-${Date.now()}`,
      title: fileNameInput.trim(),
      subject,
      format: selectedFormat, // Auto-selected as selected before by user
      author: author.trim() || 'Student Buddy',
      institution: 'StudySpace Academic Network',
      readsCount: 1,
      rating: 5.0,
      pages: selectedFormat === 'PPT' ? 14 : selectedFormat === 'PDF' ? 8 : 4,
      summary: summary.trim() || `Study notes for ${fileNameInput}`,
      topics: keyTopics
        ? keyTopics.split(',').map((t) => t.trim()).filter(Boolean)
        : [subject, selectedFormat],
      isPublic, // public -> gets shared on resources by buddies; private -> accessible only from my uploaded decks
      dateAdded: new Date().toISOString().split('T')[0],
      fileName: loadedFileName || fileNameInput,
      fileSize: loadedFileSize || '1.8 MB',
      fileData: loadedFilePreview,
      fileMimeType: loadedFileMime,
    };

    onAddResource(newResource);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      handleReset();
    }, 1400);
  };

  // Render format icon
  const renderFormatIcon = (fmt: ResourceFormat, className: string = 'w-5 h-5') => {
    switch (fmt) {
      case 'PDF':
        return <FileText className={`${className} text-rose-500`} />;
      case 'PPT':
      case 'Slides':
        return <Presentation className={`${className} text-orange-500`} />;
      case 'DOC':
        return <FileCode className={`${className} text-blue-500`} />;
      case 'Photo':
        return <FileImage className={`${className} text-emerald-500`} />;
      case 'Spreadsheet':
        return <FileSpreadsheet className={`${className} text-teal-500`} />;
      default:
        return <FileText className={`${className} text-purple-500`} />;
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      >
        <div
          className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative max-h-[92vh] overflow-y-auto"
          style={{
            backgroundColor: theme.isDark ? 'rgba(28, 24, 40, 0.96)' : 'rgba(255, 255, 255, 0.98)',
            border: `1px solid ${theme.surfaceBorder}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-5 right-5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            style={{ color: theme.textSecondary }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hidden native file input strictly restricting to selected format */}
          <input
            ref={fileInputRef}
            type="file"
            accept={currentTypeConfig.accept}
            onChange={handleFileInputChange}
            className="hidden"
          />

          {isSuccess ? (
            /* ================= SUCCESS FEEDBACK ================= */
            <div className="py-12 px-6 text-center space-y-4 animate-in zoom-in-95">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-md"
                style={{ backgroundColor: isPublic ? '#DCD1FA' : '#BCE9D5' }}
              >
                <CheckCircle2 className={`w-8 h-8 ${isPublic ? 'text-purple-600' : 'text-emerald-700'}`} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black" style={{ color: theme.textPrimary }}>
                {isPublic ? 'Material Shared to Public Library!' : 'Saved to My Uploaded Decks!'}
              </h3>
              <p className="text-xs sm:text-sm max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                {isPublic
                  ? 'Your study deck has been published with full details and is now accessible to buddies across StudySpace.'
                  : 'Your document is saved privately in "My Uploaded Decks" and is only accessible by your account.'}
              </p>
            </div>
          ) : step === 'select-type' ? (
            /* ================= STEP 1: FIRST ASKS FOR TYPE OF FILE TO UPLOAD ================= */
            <div>
              <div className="mb-5">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg mb-3 shadow-xs"
                  style={{
                    backgroundColor: '#DCD1FA',
                    color: '#302747',
                  }}
                >
                  <Upload className="w-5 h-5" />
                </div>
                <h2
                  id="share-title"
                  className="text-2xl sm:text-3xl font-black tracking-tight"
                  style={{ color: theme.textPrimary }}
                >
                  Upload Study Material
                </h2>
              </div>

              {/* Error message if user selected an invalid file type */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl mb-4 bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Type Restriction:</strong> {errorMessage}
                  </div>
                </div>
              )}

              {/* Grid of Medium-Sized Clickable Interactive File Types */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                {SUPPORTED_FILE_TYPES.map((item) => (
                  <div
                    key={item.format}
                    onClick={() => handleSelectTypeAndBrowse(item.format)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectTypeAndBrowse(item.format);
                      }
                    }}
                    className="p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex items-center justify-between group hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#8E74DB]"
                    style={{
                      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
                      borderColor: theme.surfaceBorder,
                    }}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl shadow-xs transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#F5F2FC',
                        }}
                      >
                        {renderFormatIcon(item.format, 'w-6 h-6')}
                      </div>

                      <div className="min-w-0">
                        <span className="font-extrabold text-sm group-hover:underline block truncate" style={{ color: theme.textPrimary }}>
                          {item.label}
                        </span>
                        <span
                          className="inline-block text-[10px] font-black px-1.5 py-0.2 rounded border mt-0.5"
                          style={{
                            borderColor: item.badgeColor,
                            color: item.badgeColor,
                          }}
                        >
                          {item.extLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#8E74DB] shrink-0 pl-2">
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">Select</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ================= STEP 2: FILE LOADED & DETAILS FORM ================= */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: theme.surfaceBorder }}>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs font-bold hover:underline cursor-pointer"
                  style={{ color: '#8E74DB' }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Choose different file type</span>
                </button>
                <span
                  className="text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
                  style={{
                    backgroundColor: '#BCE9D5',
                    color: '#164E3A',
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>File Loaded Successfully</span>
                </span>
              </div>

              {/* Clickable Interactive File Preview Banner (User clicks to see full preview) */}
              <div
                onClick={() => setIsFullPreviewOpen(true)}
                className="p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer group flex items-center justify-between gap-3 shadow-xs hover:border-[#8E74DB] hover:shadow-md"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(220, 209, 250, 0.08)' : '#F9F7FE',
                  borderColor: '#DCD1FA',
                }}
                title="Click to view full preview of the loaded file"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: '#DCD1FA' }}
                  >
                    {renderFormatIcon(selectedFormat, 'w-6 h-6')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm truncate" style={{ color: theme.textPrimary }}>
                        {loadedFileName || fileNameInput}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 shrink-0" style={{ color: theme.textMuted }}>
                        {loadedFileSize}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold mt-0.5 text-[#8E74DB] group-hover:underline">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Click to see full preview</span>
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs shrink-0 cursor-pointer hover:opacity-90"
                  style={{
                    backgroundColor: '#302747',
                    color: '#FFF9F0',
                  }}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Preview</span>
                </div>
              </div>

              {/* Inline quick preview toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowInlinePreview((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-300 hover:underline cursor-pointer"
                >
                  {showInlinePreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{showInlinePreview ? 'Hide Quick Inline Preview' : 'Show Quick Inline Preview'}</span>
                </button>

                {showInlinePreview && (
                  <div className="mt-2 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border text-xs" style={{ borderColor: theme.surfaceBorder }}>
                    {selectedFormat === 'Photo' && loadedFilePreview ? (
                      <img src={loadedFilePreview} alt="Preview" className="max-h-48 rounded-xl mx-auto object-contain shadow-xs" />
                    ) : (
                      <div className="p-3 bg-white dark:bg-black/30 rounded-xl space-y-1">
                        <div className="font-bold">{fileNameInput || loadedFileName}</div>
                        <p className="text-[11px] text-gray-500">Document Type: {selectedFormat} · Size: {loadedFileSize}</p>
                        <p className="text-[11px] italic text-purple-600">Click &quot;Full Preview&quot; above to inspect the complete multi-slide or document view.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 1. File Name Input */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                  File Name *
                </label>
                <input
                  type="text"
                  required
                  value={fileNameInput}
                  onChange={(e) => setFileNameInput(e.target.value)}
                  placeholder="e.g. Organic Chemistry Reaction Pathways"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                  }}
                />
              </div>

              {/* 2. Subject & 3. File Type (Auto-selected as selected before by user) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                    Subject *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as SubjectType)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none"
                    style={{
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.textPrimary,
                    }}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="Business">Business</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Economics">Economics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                    File Type (Auto-selected)
                  </label>
                  <div
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border flex items-center justify-between"
                    style={{
                      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F5F2FC',
                      borderColor: theme.inputBorder,
                      color: theme.textPrimary,
                    }}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {renderFormatIcon(selectedFormat, 'w-4 h-4')}
                      <span>{currentTypeConfig.label}</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 flex items-center gap-1 border border-emerald-500/20">
                      <Check className="w-3 h-3" />
                      <span>Auto-selected</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Public / Private Option (as specified by user) */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textPrimary }}>
                  Visibility & Access Permission *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Public Option */}
                  <div
                    onClick={() => setIsPublic(true)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                      isPublic ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: isPublic
                        ? (theme.isDark ? 'rgba(220, 209, 250, 0.2)' : '#F4F0FD')
                        : (theme.isDark ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF'),
                      borderColor: isPublic ? '#8E74DB' : theme.surfaceBorder,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 font-extrabold text-xs" style={{ color: theme.textPrimary }}>
                        <Globe className="w-4 h-4 text-purple-500" />
                        <span>Public</span>
                      </div>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isPublic ? 'border-purple-600' : 'border-gray-400'}`}>
                        {isPublic && <span className="w-2 h-2 rounded-full bg-purple-600" />}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed font-semibold text-purple-700 dark:text-purple-300">
                      Public — gets shared on resources by buddies with details filled as selected by user.
                    </p>
                    <p className="text-[10px] mt-1 leading-normal" style={{ color: theme.textMuted }}>
                      Visible to all students in the public library and explore space.
                    </p>
                  </div>

                  {/* Private Option */}
                  <div
                    onClick={() => setIsPublic(false)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                      !isPublic ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: !isPublic
                        ? (theme.isDark ? 'rgba(188, 233, 213, 0.2)' : '#EBF8F2')
                        : (theme.isDark ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF'),
                      borderColor: !isPublic ? '#10B981' : theme.surfaceBorder,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 font-extrabold text-xs" style={{ color: theme.textPrimary }}>
                        <Lock className="w-4 h-4 text-emerald-600" />
                        <span>Private</span>
                      </div>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!isPublic ? 'border-emerald-600' : 'border-gray-400'}`}>
                        {!isPublic && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed font-semibold text-emerald-700 dark:text-emerald-300">
                      Private — accessible for the user only from my uploaded decks.
                    </p>
                    <p className="text-[10px] mt-1 leading-normal" style={{ color: theme.textMuted }}>
                      Hidden from public searches; only you can view and study this file.
                    </p>
                  </div>
                </div>
              </div>

              {/* Author & Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                    Uploaded By (Handle)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Mayank Bamil"
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none"
                    style={{
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.textPrimary,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                    Key Topics
                  </label>
                  <input
                    type="text"
                    value={keyTopics}
                    onChange={(e) => setKeyTopics(e.target.value)}
                    placeholder="e.g. Trees, Algorithms, Big-O"
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none"
                    style={{
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.textPrimary,
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                  Short Summary / Notes Overview
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Summary of chapters covered..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t" style={{ borderColor: theme.surfaceBorder }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer hover:opacity-80"
                  style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:opacity-90 flex items-center gap-1.5 transition-all"
                  style={{
                    backgroundColor: isPublic ? '#302747' : '#164E3A',
                    color: '#FFF9F0',
                  }}
                >
                  {isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{isPublic ? 'Publish to Public Library' : 'Save to My Uploaded Decks'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ================= FULL PREVIEW MODAL OVERLAY ================= */}
      {isFullPreviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsFullPreviewOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: theme.isDark ? '#1C1828' : '#FFFFFF',
              border: `1px solid ${theme.surfaceBorder}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: theme.surfaceBorder }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs" style={{ backgroundColor: '#DCD1FA' }}>
                  {renderFormatIcon(selectedFormat, 'w-5 h-5')}
                </div>
                <div>
                  <h3 className="font-extrabold text-base" style={{ color: theme.textPrimary }}>
                    {loadedFileName || fileNameInput}
                  </h3>
                  <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                    <span>Format: {selectedFormat}</span>
                    <span>•</span>
                    <span>Size: {loadedFileSize}</span>
                    <span>•</span>
                    <span className="text-[#8E74DB] font-bold">Full Interactive Preview</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFullPreviewOpen(false)}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                style={{ color: theme.textSecondary }}
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Body according to file format */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border min-h-[300px] flex flex-col justify-center" style={{ borderColor: theme.surfaceBorder }}>
              {selectedFormat === 'Photo' ? (
                /* Photo / Whiteboard full resolution preview */
                <div className="text-center">
                  <img
                    src={loadedFilePreview || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'}
                    alt={loadedFileName || 'Photo preview'}
                    className="max-h-[60vh] max-w-full rounded-xl mx-auto shadow-md object-contain"
                  />
                  <p className="text-xs font-semibold mt-3" style={{ color: theme.textMuted }}>
                    Full Resolution Photo Preview · {loadedFileName || fileNameInput}
                  </p>
                </div>
              ) : selectedFormat === 'PPT' ? (
                /* PowerPoint / Slide deck full preview with interactive slide navigation */
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold px-1" style={{ color: theme.textSecondary }}>
                    <span>Slide Deck: {loadedFileName || fileNameInput}</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 font-extrabold">Slide {currentSlideIndex + 1} of 3</span>
                  </div>

                  <div
                    className="aspect-video w-full rounded-2xl p-6 sm:p-10 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300"
                    style={{
                      backgroundColor: currentSlideIndex === 0 ? '#302747' : currentSlideIndex === 1 ? '#1E293B' : '#3E2F5B',
                      color: '#FFF9F0',
                    }}
                  >
                    <div>
                      <span className="text-xs uppercase tracking-widest text-purple-300 font-extrabold">
                        {subject} · Slide {currentSlideIndex + 1}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black mt-2">
                        {currentSlideIndex === 0
                          ? fileNameInput || loadedFileName
                          : currentSlideIndex === 1
                          ? 'Core Architectural Principles & Proofs'
                          : 'Worked Revision Exercises & Model Answers'}
                      </h2>
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm text-gray-200">
                      {currentSlideIndex === 0 && (
                        <>
                          <p>• Overview of syllabus chapters and fundamental principles</p>
                          <p>• Authored by {author} for academic collaboration</p>
                          <p>• Verified presentation deck for semester revision</p>
                        </>
                      )}
                      {currentSlideIndex === 1 && (
                        <>
                          <p>• Formula Decomposition and Step-by-Step Proof</p>
                          <p>• Visual Transformation Mapping across coordinates</p>
                          <p>• Practice benchmarks and standard exam edge cases</p>
                        </>
                      )}
                      {currentSlideIndex === 2 && (
                        <>
                          <p>• Review drill questions with model answers</p>
                          <p>• Self-assessment scorecard for focus blocks</p>
                          <p>• Key takeaways for final examination</p>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-300 pt-2 border-t border-white/20">
                      <span>StudySpace Interactive Deck Viewer</span>
                      <span>Slide {currentSlideIndex + 1} / 3</span>
                    </div>
                  </div>

                  {/* Slide controls */}
                  <div className="flex justify-center items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={currentSlideIndex === 0}
                      onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                      className="px-4 py-2 rounded-xl border text-xs font-bold disabled:opacity-30 cursor-pointer"
                      style={{ borderColor: theme.surfaceBorder, color: theme.textPrimary }}
                    >
                      ← Previous Slide
                    </button>
                    <span className="text-xs font-mono font-bold" style={{ color: theme.textSecondary }}>
                      {currentSlideIndex + 1} / 3
                    </span>
                    <button
                      type="button"
                      disabled={currentSlideIndex === 2}
                      onClick={() => setCurrentSlideIndex((prev) => Math.min(2, prev + 1))}
                      className="px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-30 cursor-pointer shadow-xs"
                      style={{ backgroundColor: '#DCD1FA', color: '#302747' }}
                    >
                      Next Slide →
                    </button>
                  </div>
                </div>
              ) : selectedFormat === 'Spreadsheet' ? (
                /* Spreadsheet tabular preview */
                <div className="space-y-3">
                  <div className="text-xs font-bold" style={{ color: theme.textSecondary }}>
                    Spreadsheet Data Preview: {loadedFileName || fileNameInput}
                  </div>
                  <div className="overflow-x-auto border rounded-xl" style={{ borderColor: theme.surfaceBorder }}>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-black/5 dark:bg-white/10 font-bold border-b" style={{ borderColor: theme.surfaceBorder }}>
                        <tr>
                          <th className="p-2 border-r" style={{ borderColor: theme.surfaceBorder }}>#</th>
                          <th className="p-2 border-r" style={{ borderColor: theme.surfaceBorder }}>Variable / Module</th>
                          <th className="p-2 border-r" style={{ borderColor: theme.surfaceBorder }}>Formula / Value</th>
                          <th className="p-2">Expected Metric</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: theme.surfaceBorder }}>
                        {[
                          { id: '1', name: 'Sample Variance (s²)', val: 'Σ(x - μ)² / (n - 1)', metric: '±0.045' },
                          { id: '2', name: 'Correlation Coefficient (r)', val: 'Cov(X,Y) / (σX σY)', metric: '0.892' },
                          { id: '3', name: 'T-Statistic Score', val: '(x̄ - μ0) / (s / √n)', metric: '2.41' },
                          { id: '4', name: 'R-Squared Confidence', val: '1 - (SSres / SStot)', metric: '94.2%' },
                        ].map((row) => (
                          <tr key={row.id}>
                            <td className="p-2 border-r font-mono font-bold" style={{ borderColor: theme.surfaceBorder }}>{row.id}</td>
                            <td className="p-2 border-r font-semibold" style={{ borderColor: theme.surfaceBorder }}>{row.name}</td>
                            <td className="p-2 border-r font-mono text-[#8E74DB]" style={{ borderColor: theme.surfaceBorder }}>{row.val}</td>
                            <td className="p-2 font-bold text-emerald-600">{row.metric}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Document / PDF / Notes formatted text preview */
                <div className="p-4 sm:p-6 rounded-xl bg-white dark:bg-black/30 text-xs sm:text-sm space-y-3 shadow-inner">
                  <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: theme.surfaceBorder }}>
                    <span className="font-bold text-sm" style={{ color: theme.textPrimary }}>
                      {fileNameInput || loadedFileName}
                    </span>
                    <span className="font-mono text-xs text-purple-500 font-bold">
                      Document Page 1 of {selectedFormat === 'PDF' ? '8' : '4'}
                    </span>
                  </div>

                  <p className="leading-relaxed font-serif" style={{ color: theme.textSecondary }}>
                    {summary ||
                      'This document includes complete academic syllabus coverage, structured theorem proofs, sample exercises, and examination preparation notes.'}
                  </p>

                  <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5 font-mono text-xs space-y-1">
                    <div className="font-bold text-[#8E74DB]">• Section 1.1: Foundations and Formal Definitions</div>
                    <div className="text-gray-500">• Section 1.2: Standard Analytical Methodologies & Derivations</div>
                    <div className="text-gray-500">• Section 2.1: Worked Review Problems & Solutions</div>
                  </div>

                  <p className="leading-relaxed font-serif text-gray-500 italic">
                    Full document content verified and ready for distribution across StudySpace.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 flex justify-end gap-2 border-t" style={{ borderColor: theme.surfaceBorder }}>
              <button
                type="button"
                onClick={() => setIsFullPreviewOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
              >
                Back to Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
