import {
  Share2,
  Users,
  Download,
  ArrowUpRight,
  Globe2,
  FileText,
  Check,
  Medal,
  Crown,
  Trophy,
  Award,
  Sparkles,
} from 'lucide-react';
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

            {/* Action CTA to Contribute */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <button
                type="button"
                onClick={onContributeResource}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-extrabold text-sm shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: '#302747',
                  color: '#FFF9F0',
                }}
              >
                <Share2 className="w-4 h-4 text-purple-300" />
                <span>Contribute Notes & Join Leaderboard</span>
                <ArrowUpRight className="w-4 h-4 text-purple-300" />
              </button>
            </div>

            {/* Top Contributors Header */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span
                className="text-xs sm:text-sm font-extrabold tracking-wider uppercase"
                style={{ color: theme.isDark ? '#F7F5FC' : '#302747' }}
              >
                Top Community Contributors
              </span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>

            {/* Top Contributors Podium: 2nd (Medium), 1st (Large), 3rd (Small) */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-4 sm:gap-5 w-full">
              {/* 2nd Place - Size: Medium */}
              <div
                className="order-2 sm:order-1 w-full sm:w-[31%] rounded-3xl p-5 sm:p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 shadow-md flex flex-col items-center text-center justify-between min-h-[250px] sm:min-h-[270px] relative group"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(28, 22, 42, 0.88)' : 'rgba(255, 255, 255, 0.9)',
                  border: `2px solid ${theme.isDark ? 'rgba(203, 213, 225, 0.4)' : 'rgba(148, 163, 184, 0.5)'}`,
                }}
              >
                {/* Silver Rank Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-xs mb-3 bg-slate-200/90 dark:bg-slate-700/80 text-slate-800 dark:text-slate-100">
                  <Medal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                  <span>2nd Place</span>
                </div>

                {/* Medium Profile Photo */}
                <div className="relative mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=320&h=320&fit=crop&crop=face&auto=format&q=80"
                    alt="Elena Rostova"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-slate-300 dark:ring-slate-500 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-slate-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                    #2
                  </span>
                </div>

                {/* Contributor Info */}
                <div className="space-y-1 mb-3">
                  <h3
                    className="text-base sm:text-lg font-black tracking-tight"
                    style={{ color: theme.isDark ? '#F7F5FC' : '#302747' }}
                  >
                    Elena Rostova
                  </h3>
                  <p className="text-xs font-medium text-purple-600 dark:text-purple-300">
                    Biology & Pre-Med
                  </p>
                </div>

                {/* Files Uploaded Count */}
                <div
                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold"
                  style={{
                    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(48, 39, 71, 0.06)',
                    color: theme.textPrimary,
                  }}
                >
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                  <span>
                    {38 + publicResources.filter((r) => r.author.toLowerCase().includes('elena')).length} files uploaded
                  </span>
                </div>
              </div>

              {/* 1st Place - Size: Large (Tallest, elevated, prominent gold accent) */}
              <div
                className="order-1 sm:order-2 w-full sm:w-[38%] rounded-3xl p-6 sm:p-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 shadow-xl sm:-translate-y-3 flex flex-col items-center text-center justify-between min-h-[300px] sm:min-h-[330px] relative group"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(38, 28, 58, 0.95)' : 'rgba(255, 255, 255, 0.98)' ,
                  border: '2px solid rgba(245, 158, 11, 0.85)',
                  boxShadow: '0 20px 35px -10px rgba(245, 158, 11, 0.25)',
                }}
              >
                {/* Floating Gold Crown */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 fill-amber-950" />
                  <span>Top Contributor</span>
                </div>

                {/* Gold Rank Badge */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black shadow-xs mb-3 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 mt-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300 fill-amber-400" />
                  <span>1st Place</span>
                </div>

                {/* Large Profile Photo */}
                <div className="relative mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&h=320&fit=crop&crop=face&auto=format&q=80"
                    alt="Aria Chen"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-amber-400 dark:ring-amber-300 shadow-xl group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-amber-950 text-xs font-black px-2 py-0.5 rounded-full shadow-sm">
                    #1
                  </span>
                </div>

                {/* Contributor Info */}
                <div className="space-y-1 mb-3">
                  <h3
                    className="text-lg sm:text-xl font-black tracking-tight"
                    style={{ color: theme.isDark ? '#FFF9F0' : '#302747' }}
                  >
                    Aria Chen
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-purple-600 dark:text-purple-300">
                    Computer Science & Math
                  </p>
                </div>

                {/* Files Uploaded Count - Highlighted */}
                <div
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-black shadow-xs"
                  style={{
                    backgroundColor: theme.isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                    color: theme.isDark ? '#FDE68A' : '#92400E',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                  }}
                >
                  <FileText className="w-4 h-4 text-amber-600 dark:text-amber-300" />
                  <span>
                    {54 + publicResources.filter((r) => r.author.toLowerCase().includes('aria')).length} files uploaded
                  </span>
                </div>
              </div>

              {/* 3rd Place - Size: Small (Compact) */}
              <div
                className="order-3 sm:order-3 w-full sm:w-[31%] rounded-3xl p-4 sm:p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 shadow-xs flex flex-col items-center text-center justify-between min-h-[220px] sm:min-h-[240px] relative group"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(24, 18, 36, 0.82)' : 'rgba(255, 255, 255, 0.85)',
                  border: `1.5px solid ${theme.isDark ? 'rgba(180, 83, 9, 0.35)' : 'rgba(217, 119, 6, 0.3)'}`,
                }}
              >
                {/* Bronze Rank Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs mb-2 bg-amber-900/10 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                  <Award className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>3rd Place</span>
                </div>

                {/* Small Profile Photo */}
                <div className="relative mb-2">
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=320&h=320&fit=crop&crop=face&auto=format&q=80"
                    alt="Marcus Vance"
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-3 ring-amber-700/50 shadow-xs group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-amber-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                    #3
                  </span>
                </div>

                {/* Contributor Info */}
                <div className="space-y-0.5 mb-2.5">
                  <h3
                    className="text-sm sm:text-base font-extrabold tracking-tight"
                    style={{ color: theme.isDark ? '#F7F5FC' : '#302747' }}
                  >
                    Marcus Vance
                  </h3>
                  <p className="text-[11px] font-medium text-purple-600 dark:text-purple-300">
                    Business & Software Systems
                  </p>
                </div>

                {/* Files Uploaded Count */}
                <div
                  className="w-full inline-flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-xl text-[11px] font-bold"
                  style={{
                    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(48, 39, 71, 0.05)',
                    color: theme.textPrimary,
                  }}
                >
                  <FileText className="w-3 h-3 text-purple-500" />
                  <span>
                    {26 + publicResources.filter((r) => r.author.toLowerCase().includes('marcus')).length} files uploaded
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
