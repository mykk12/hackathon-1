import React, { useState } from 'react';
import { FileText, Presentation, FileCode2, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';
import type { AcademicResource, SubjectType, ResourceFormat } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';

interface PopularResourcesProps {
  theme: ThemeColors;
  resources: AcademicResource[];
  bookmarks: string[];
  onToggleBookmark: (resourceId: string) => void;
  onSelectResource: (resource: AcademicResource) => void;
  activeFormatFilter: string;
  onSelectFormatFilter: (format: string) => void;
  onViewAllClick: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const PopularResources: React.FC<PopularResourcesProps> = ({
  theme,
  resources,
  onSelectResource,
  activeFormatFilter,
  onSelectFormatFilter,
  onViewAllClick,
  searchQuery = '',
  onSearchChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_INITIAL_FILES = 12; // Max 6 files per row * 2 rows = 12 files

  const getSubjectPastel = (subject: SubjectType) => {
    switch (subject) {
      case 'Computer Science':
        return { bg: '#DCD1FA', text: '#302747' };
      case 'Mathematics':
        return { bg: '#BCE9D5', text: '#164E3A' };
      case 'Biology':
        return { bg: '#FFD1B8', text: '#662E1B' };
      case 'Business':
        return { bg: '#F6EBC4', text: '#57410D' };
    }
  };

  const formats = ['All', 'PDF', 'Notes', 'Slides'];

  const visibleFiles = isExpanded ? resources : resources.slice(0, MAX_INITIAL_FILES);
  const remainingFilesCount = Math.max(0, resources.length - MAX_INITIAL_FILES);

  return (
    <section className="py-8 sm:py-12" id="popular-resources">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Block: "Resources By Peens" - Solid, non-translucent design */}
        <div
          role="region"
          aria-label="Resources By Peens block"
          className="p-6 sm:p-8 lg:p-10 rounded-3xl sm:rounded-4xl shadow-md transition-colors duration-200"
          style={{
            backgroundColor: theme.isDark ? '#201A2E' : '#FFFFFF', // Solid non-translucent surface
            border: `1px solid ${theme.isDark ? 'rgba(220, 209, 250, 0.16)' : 'rgba(48, 39, 71, 0.12)'}`,
            boxShadow: theme.isDark
              ? '0 10px 30px -5px rgba(0, 0, 0, 0.5)'
              : '0 10px 30px -5px rgba(48, 39, 71, 0.06)',
          }}
        >
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h2
                className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                style={{ color: theme.textPrimary }}
              >
                Resources By Peens
              </h2>
            </div>

            {/* Interactive Search & Format Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start md:self-auto w-full md:w-auto">
              {onSearchChange && (
                <div
                  className="flex items-center px-3 py-1.5 rounded-xl shadow-xs"
                  style={{
                    backgroundColor: theme.isDark ? '#2A233C' : '#F7F6FB',
                    border: `1px solid ${theme.surfaceBorder}`,
                  }}
                >
                  <Search className="w-3.5 h-3.5 mr-2 text-purple-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Filter files..."
                    className="bg-transparent text-xs focus:outline-none w-36 sm:w-44 font-medium"
                    style={{ color: theme.textPrimary }}
                    aria-label="Filter resources by keyword"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => onSearchChange('')}
                      className="text-[10px] text-gray-400 hover:text-gray-600 ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}

              <div
                className="flex items-center gap-1.5 p-1 rounded-xl overflow-x-auto"
                style={{
                  backgroundColor: theme.isDark ? '#2A233C' : '#F7F6FB',
                  border: `1px solid ${theme.surfaceBorder}`,
                }}
              >
                <Filter className="w-3.5 h-3.5 ml-2 mr-1 opacity-60 shrink-0" style={{ color: theme.textMuted }} />
                {formats.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => onSelectFormatFilter(fmt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeFormatFilter === fmt ? 'shadow-xs' : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: activeFormatFilter === fmt
                        ? (theme.isDark ? '#DCD1FA' : '#302747')
                        : 'transparent',
                      color: activeFormatFilter === fmt
                        ? (theme.isDark ? '#302747' : '#FFF9F0')
                        : theme.textSecondary,
                    }}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Files Grid: Max 6 files in a row, max 3 rows initially (18 files max) */}
          {resources.length === 0 ? (
            <div
              className="p-12 text-center rounded-2xl"
              style={{
                backgroundColor: theme.isDark ? '#282138' : '#F7F6FB',
                border: `1px solid ${theme.surfaceBorder}`,
              }}
            >
              <p className="text-sm font-semibold" style={{ color: theme.textSecondary }}>
                No academic files found matching your current filter.
              </p>
              <button
                onClick={onViewAllClick}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                style={{ backgroundColor: '#DCD1FA', color: '#302747' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {visibleFiles.map((item) => {
                const subjectBadge = getSubjectPastel(item.subject);

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectResource(item)}
                    className="group flex flex-col h-[270px] rounded-2xl p-2.5 transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1 select-none text-left overflow-hidden"
                    style={{
                      backgroundColor: theme.isDark ? '#282138' : '#F9F8FD',
                      border: `1px solid ${theme.isDark ? 'rgba(220, 209, 250, 0.14)' : 'rgba(48, 39, 71, 0.08)'}`,
                    }}
                  >
                    {/* 1. File Preview: Exactly 50% of card */}
                    <div className="h-1/2 w-full pb-1.5">
                      <div
                        className="relative h-full w-full rounded-xl overflow-hidden p-2 flex flex-col justify-between shadow-xs border transition-transform duration-200 group-hover:scale-[1.02] bg-white text-[#302747]"
                        style={{
                          borderColor: 'rgba(48, 39, 71, 0.1)',
                        }}
                      >
                        {/* Document Sheet Content */}
                        <div>
                          {/* First Page Title Heading */}
                          <div className="text-[10px] font-extrabold leading-tight text-gray-900 line-clamp-2 mb-1.5 pb-1 border-b border-gray-100">
                            {item.title}
                          </div>

                          {/* First Page Simulated Content Preview */}
                          <div className="space-y-0.5">
                            {item.subject === 'Computer Science' && (
                              <div className="p-1 rounded bg-purple-50/70 border border-purple-100/80 font-mono text-[6.5px] text-purple-900 leading-snug">
                                <div>class Node &#123;</div>
                                <div className="pl-1">val: Int; next: Node;</div>
                                <div>&#125;</div>
                              </div>
                            )}
                            {item.subject === 'Mathematics' && (
                              <div className="p-1 rounded bg-emerald-50/70 border border-emerald-100/80 font-serif text-[7px] text-emerald-950 leading-snug text-center">
                                <div>&int; f(x)dx = F(b) - F(a)</div>
                                <div className="text-[6px] text-emerald-700">&Sigma; a_n (x - c)^n</div>
                              </div>
                            )}
                            {item.subject === 'Biology' && (
                              <div className="p-1 rounded bg-amber-50/70 border border-amber-100/80 text-[6.5px] text-amber-950 leading-snug">
                                <div className="font-semibold">&bull; Lipid Bilayer &bull;</div>
                                <div className="text-[6px] text-amber-800">ATP &rarr; ADP + Pi</div>
                              </div>
                            )}
                            {item.subject === 'Business' && (
                              <div className="p-1 rounded bg-yellow-50/70 border border-yellow-100/80 text-[6.5px] text-yellow-950 leading-snug">
                                <div className="font-semibold flex justify-between">
                                  <span>Assets</span>
                                  <span>= L + E</span>
                                </div>
                                <div className="text-[6px] text-yellow-800">Operating Margin</div>
                              </div>
                            )}

                            {/* Simulated Body Skeleton Lines */}
                            <div className="space-y-0.5 pt-0.5">
                              <div className="h-0.5 bg-gray-200/80 rounded-full w-full" />
                              <div className="h-0.5 bg-gray-200/60 rounded-full w-4/5" />
                            </div>
                          </div>
                        </div>

                        {/* First Page Watermark / Footer */}
                        <div className="pt-0.5 border-t border-gray-100 flex items-center justify-between text-[6.5px] font-semibold text-gray-400">
                          <span>Doc Page 1</span>
                          <span className="text-gray-600 font-bold">1 of {item.pages || 1}</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. File Details: Exactly 50% of card (else area used for other details) */}
                    <div className="h-1/2 w-full flex flex-col justify-between pt-1 px-1 pb-0.5">
                      {/* Name (File Title) */}
                      <div>
                        <h3
                          className="text-xs sm:text-[13px] font-bold leading-snug line-clamp-1"
                          style={{ color: theme.textPrimary }}
                          title={item.title}
                        >
                          {item.title}
                        </h3>

                        {/* Subject */}
                        <div className="text-[11px] font-semibold mt-0.5 flex items-center gap-1.5" style={{ color: '#8E74DB' }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subjectBadge.text }} />
                          <span className="truncate">{item.subject}</span>
                        </div>

                        {/* Uploader Name (with the exact same settings as file name) */}
                        <div
                          className="text-xs sm:text-[13px] font-bold leading-snug truncate mt-0.5"
                          style={{ color: theme.textPrimary }}
                          title={`Uploaded by ${item.author}`}
                        >
                          {item.author}
                        </div>
                      </div>

                      {/* Type of file & Pages details */}
                      <div
                        className="flex items-center justify-between text-[10.5px] font-medium pt-2 border-t mt-auto"
                        style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
                      >
                        <span
                          className="font-bold px-2 py-0.5 rounded-md text-[9.5px] uppercase tracking-wide"
                          style={{
                            backgroundColor: subjectBadge.bg,
                            color: subjectBadge.text,
                          }}
                        >
                          {item.format}
                        </span>
                        <span className="font-semibold">{item.pages ? `${item.pages} pages` : '1 page'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Explore All Academic Resources Button & Residing Files Control */}
          <div className="mt-8 text-center flex flex-col items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (remainingFilesCount > 0) {
                  setIsExpanded(!isExpanded);
                } else {
                  onViewAllClick();
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
              style={{
                backgroundColor: '#302747',
                color: '#FFF9F0',
              }}
            >
              <span>
                {isExpanded
                  ? 'Show Less Files'
                  : `Explore All Academic Resources (${resources.length} available)`}
              </span>
              {remainingFilesCount > 0 && (
                isExpanded ? <ChevronUp className="w-4 h-4 text-purple-300" /> : <ChevronDown className="w-4 h-4 text-purple-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
