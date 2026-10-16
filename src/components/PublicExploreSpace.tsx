import React from 'react';
import { Share2, Users, Download, ArrowUpRight, Globe2, FileText, Check } from 'lucide-react';
import { ThemeColors } from '../utils/theme.ts';
import type { AcademicResource } from '../types/index.ts';

interface PublicExploreSpaceProps {
  theme: ThemeColors;
  onBrowsePublic: () => void;
  onContributeResource: () => void;
  onSelectResource: (resource: AcademicResource) => void;
  publicResources: AcademicResource[];
}

export const PublicExploreSpace: React.FC<PublicExploreSpaceProps> = ({
  theme,
  onBrowsePublic,
  onContributeResource,
  onSelectResource,
  publicResources,
}) => {
  return (
    <section className="py-12 sm:py-16" id="public-explore">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Soft Lavender Background Surface with deliberate visual separation */}
        <div
          className="rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl"
          style={{
            backgroundColor: theme.isDark ? 'rgba(40, 32, 60, 0.85)' : '#DCD1FA',
            border: `1px solid ${theme.isDark ? 'rgba(220, 209, 250, 0.25)' : 'rgba(48, 39, 71, 0.12)'}`,
          }}
        >
          {/* Subtle background circles */}
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: '#BCE9D5' }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: '#FFD1B8' }}
          />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Tag */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 shadow-xs"
              style={{
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.8)',
                color: theme.isDark ? '#F7F5FC' : '#302747',
              }}
            >
              <Globe2 className="w-4 h-4 text-purple-600 dark:text-purple-300" />
              <span>Public Student Commons · No Account Required</span>
            </div>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4"
              style={{ color: theme.isDark ? '#F7F5FC' : '#302747' }}
            >
              Good resources deserve to be shared.
            </h2>

            <p
              className="text-base sm:text-lg font-medium leading-relaxed mb-8 opacity-90 max-w-2xl mx-auto"
              style={{ color: theme.isDark ? '#DCD1FA' : '#302747' }}
            >
              Discover public notes, useful links, and learning materials shared by students.
              Every contribution helps someone master a difficult topic before exams.
            </p>

            {/* Public Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
              <button
                type="button"
                onClick={onBrowsePublic}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-extrabold text-sm shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: '#302747',
                  color: '#FFF9F0',
                }}
              >
                <Users className="w-4 h-4" />
                <span>Browse Public Resources</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onContributeResource}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.9)',
                  color: theme.isDark ? '#FFFFFF' : '#302747',
                  border: `1px solid ${theme.surfaceBorder}`,
                }}
              >
                <Share2 className="w-4 h-4 text-purple-500" />
                <span>Contribute Notes</span>
              </button>
            </div>

            {/* Quick Public Resource Teasers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              {publicResources.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectResource(item)}
                  className="p-3.5 rounded-2xl backdrop-blur-md transition-all hover:-translate-y-1 text-left cursor-pointer group shadow-xs"
                  style={{
                    backgroundColor: theme.isDark ? 'rgba(20, 16, 30, 0.8)' : 'rgba(255, 255, 255, 0.85)',
                    border: `1px solid ${theme.surfaceBorder}`,
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                    <span style={{ color: '#8E74DB' }}>{item.subject}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px]"
                      style={{
                        backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#FFF9F0',
                        color: theme.textPrimary,
                      }}
                    >
                      {item.format}
                    </span>
                  </div>
                  <div className="font-bold text-xs line-clamp-1 group-hover:underline" style={{ color: theme.textPrimary }}>
                    {item.title}
                  </div>
                  <div className="text-[11px] flex items-center justify-between mt-2 pt-1 border-t" style={{ borderColor: theme.surfaceBorder, color: theme.textMuted }}>
                    <span>{item.author}</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-300">Free open read</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
