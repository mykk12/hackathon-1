import React from 'react';
import { X, Bookmark, Download, Star, Share2, Check, BookOpen, Layers } from 'lucide-react';
import type { AcademicResource } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';

interface ResourceDetailModalProps {
  resource: AcademicResource | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  theme: ThemeColors;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  onClose,
  isBookmarked,
  onToggleBookmark,
  theme,
}) => {
  const [downloaded, setDownloaded] = React.useState(false);

  if (!resource) return null;

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: theme.isDark ? 'rgba(28, 24, 40, 0.96)' : 'rgba(255, 255, 255, 0.96)',
          border: `1px solid ${theme.surfaceBorder}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close resource modal"
          className="absolute top-5 right-5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          style={{ color: theme.textSecondary }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{
              backgroundColor: '#DCD1FA',
              color: '#302747',
            }}
          >
            {resource.subject}
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-md"
            style={{
              backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(48, 39, 71, 0.08)',
              color: theme.textPrimary,
            }}
          >
            {resource.format}
          </span>
          <span className="text-xs font-medium" style={{ color: theme.textMuted }}>
            Added {resource.dateAdded}
          </span>
        </div>

        {/* Title */}
        <h2
          id="resource-modal-title"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug mb-3"
          style={{ color: theme.textPrimary }}
        >
          {resource.title}
        </h2>

        {/* Author & Metrics */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium pb-4 mb-4 border-b" style={{ borderColor: theme.surfaceBorder }}>
          <div className="flex items-center gap-1.5" style={{ color: theme.textSecondary }}>
            <span className="font-bold" style={{ color: theme.textPrimary }}>Curated by:</span>
            <span>{resource.author}</span>
            {resource.institution && <span className="opacity-75">({resource.institution})</span>}
          </div>
          <div className="flex items-center gap-1" style={{ color: '#F59E0B' }}>
            <Star className="w-4 h-4 fill-amber-500" />
            <span className="font-bold">{resource.rating}</span>
            <span className="text-[11px] opacity-75">({resource.readsCount} readers)</span>
          </div>
          {resource.pages && (
            <span style={{ color: theme.textMuted }}>{resource.pages} document pages</span>
          )}
        </div>

        {/* Demonstration Note */}
        <div
          className="p-3.5 rounded-2xl text-xs mb-5 flex items-start gap-2.5"
          style={{
            backgroundColor: theme.isDark ? 'rgba(246, 235, 196, 0.12)' : '#FFF9F0',
            border: `1px solid ${theme.surfaceBorder}`,
            color: theme.isDark ? '#FEF3C7' : '#57410D',
          }}
        >
          <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <strong>Demonstration Resource:</strong> StudySpace provides peer-verified study structures and curated cheat sheets.
            You can bookmark this item into your local revision deck or export the syllabus roadmap.
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.textMuted }}>
            Overview & Key Takeaways
          </h3>
          <p className="text-sm font-medium leading-relaxed" style={{ color: theme.textSecondary }}>
            {resource.summary}
          </p>
        </div>

        {/* Core Topics Covered */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: theme.textMuted }}>
            Core Syllabus Concepts
          </h3>
          <div className="flex flex-wrap gap-2">
            {resource.topics.map((topic, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(48, 39, 71, 0.06)',
                  color: theme.textPrimary,
                  border: `1px solid ${theme.surfaceBorder}`,
                }}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t" style={{ borderColor: theme.surfaceBorder }}>
          <button
            type="button"
            onClick={() => onToggleBookmark(resource.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isBookmarked ? 'bg-[#F6EBC4] text-[#57410D]' : 'border'
            }`}
            style={{
              borderColor: theme.surfaceBorder,
              color: isBookmarked ? '#57410D' : theme.textPrimary,
            }}
          >
            <Bookmark className="w-4 h-4" fill={isBookmarked ? '#57410D' : 'none'} />
            <span>{isBookmarked ? 'Saved to Your Library' : 'Save to Study List'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
              style={{
                backgroundColor: '#302747',
                color: '#FFF9F0',
              }}
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Downloaded Note Sheet</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download {resource.format}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
