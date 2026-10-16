import React from 'react';
import { Terminal, Binary, Dna, TrendingUp, Layers } from 'lucide-react';
import type { SubjectType } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';

interface SubjectExplorationProps {
  theme: ThemeColors;
  selectedSubject: SubjectType | 'All';
  onSelectSubject: (subject: SubjectType | 'All') => void;
}

export const SubjectExploration: React.FC<SubjectExplorationProps> = ({
  theme,
  selectedSubject,
  onSelectSubject,
}) => {
  const subjects: {
    name: SubjectType;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    darkAccent: string;
    description: string;
    resourceCount: string;
  }[] = [
    {
      name: 'Computer Science',
      icon: Terminal,
      accentColor: '#DCD1FA', // Soft lavender
      darkAccent: 'rgba(220, 209, 250, 0.25)',
      description: 'Data structures, algorithms, system design & web dev',
      resourceCount: '180+ resources',
    },
    {
      name: 'Mathematics',
      icon: Binary,
      accentColor: '#BCE9D5', // Mint green
      darkAccent: 'rgba(188, 233, 213, 0.25)',
      description: 'Calculus, linear algebra, statistics & discrete math',
      resourceCount: '145+ resources',
    },
    {
      name: 'Biology',
      icon: Dna,
      accentColor: '#FFD1B8', // Peach
      darkAccent: 'rgba(255, 209, 184, 0.25)',
      description: 'Molecular genetics, biochemistry, cell pathways & anatomy',
      resourceCount: '120+ resources',
    },
    {
      name: 'Business',
      icon: TrendingUp,
      accentColor: '#F6EBC4', // Butter yellow
      darkAccent: 'rgba(246, 235, 196, 0.25)',
      description: 'Financial accounting, economics, marketing & management',
      resourceCount: '95+ resources',
    },
  ];

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ color: theme.textPrimary }}
            >
              Explore Subjects
            </h2>
            <p className="text-sm sm:text-base font-medium mt-1" style={{ color: theme.textSecondary }}>
              Browse curated study collections organized by academic faculty.
            </p>
          </div>

          {/* Quick filter reset / view all button */}
          {selectedSubject !== 'All' && (
            <button
              onClick={() => onSelectSubject('All')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              style={{
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(48, 39, 71, 0.08)',
                color: theme.textPrimary,
              }}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Show All Subjects (Active: {selectedSubject})</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {subjects.map((sub) => {
            const Icon = sub.icon;
            const isSelected = selectedSubject === sub.name;

            return (
              <button
                key={sub.name}
                type="button"
                onClick={() => onSelectSubject(isSelected ? 'All' : sub.name)}
                className={`group p-5 rounded-3xl text-left transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between relative overflow-hidden backdrop-blur-md ${
                  isSelected
                    ? 'ring-2 ring-[#8E74DB] shadow-lg scale-[1.02]'
                    : 'shadow-sm hover:shadow-md'
                }`}
                style={{
                  backgroundColor: isSelected
                    ? (theme.isDark ? sub.darkAccent : sub.accentColor)
                    : (theme.isDark ? 'rgba(32, 27, 46, 0.8)' : 'rgba(255, 255, 255, 0.85)'),
                  border: `1px solid ${isSelected ? '#8E74DB' : theme.surfaceBorder}`,
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs"
                      style={{
                        backgroundColor: theme.isDark ? sub.darkAccent : sub.accentColor,
                        color: '#302747',
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: theme.textMuted }}
                    >
                      {sub.resourceCount}
                    </span>
                  </div>

                  <h3
                    className="text-base sm:text-lg font-bold tracking-tight mb-1.5"
                    style={{ color: theme.textPrimary }}
                  >
                    {sub.name}
                  </h3>

                  <p
                    className="text-xs font-normal leading-relaxed mb-4"
                    style={{ color: theme.textSecondary }}
                  >
                    {sub.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t text-xs font-semibold" style={{ borderColor: theme.surfaceBorder }}>
                  <span style={{ color: isSelected ? '#8E74DB' : theme.textMuted }}>
                    {isSelected ? 'Selected (Click to reset)' : 'Filter resources'}
                  </span>
                  <span
                    className="transition-transform group-hover:translate-x-1"
                    style={{ color: theme.textPrimary }}
                  >
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
