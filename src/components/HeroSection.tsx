import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ThemeColors } from '../utils/theme.ts';

interface HeroSectionProps {
  theme: ThemeColors;
  onTryForFree: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ theme, onTryForFree }) => {
  return (
    <section className="relative pt-10 pb-8 sm:pt-16 sm:pb-12 overflow-hidden text-center">
      {/* Soft background decorative blobs */}
      <div
        className="absolute top-0 right-10 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-40 transition-colors duration-300"
        style={{ backgroundColor: '#DCD1FA' }}
      />
      <div
        className="absolute bottom-4 left-10 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-30 transition-colors duration-300"
        style={{ backgroundColor: '#BCE9D5' }}
      />
      <div
        className="absolute top-20 left-1/3 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-20 transition-colors duration-300"
        style={{ backgroundColor: '#FFD1B8' }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        {/* Motivational pill badge */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-sm transition-all"
          style={{
            backgroundColor: theme.isDark ? 'rgba(220, 209, 250, 0.15)' : '#FFF9F0',
            border: `1px solid ${theme.surfaceBorder}`,
            color: theme.isDark ? '#DCD1FA' : '#302747',
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>Over 14,800 students revising together today</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>

        {/* Headline */}
        <h1
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] mb-5"
          style={{
            color: '#302747', // Constant signature charcoal/plum colour fixed in all conditions
          }}
        >
          Make room for your <br className="hidden sm:inline" />
          <span
            className="relative inline-block px-2.5 py-0.5 rounded-xl ml-1 shadow-xs"
            style={{
              backgroundColor: '#DCD1FA', // Constant signature soft lavender fixed in all conditions
              color: '#302747', // Constant signature charcoal/plum fixed in all conditions
              border: '1px solid rgba(48, 39, 71, 0.12)',
            }}
          >
            next big idea.
          </span>
        </h1>

        {/* Supporting text */}
        <p
          className="text-base sm:text-lg lg:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-8"
          style={{ color: theme.textSecondary }}
        >
          Find the right resources, plan your revision, and grow with your community.
        </p>

        {/* Try for free button */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onTryForFree}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-sm sm:text-base shadow-md transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
            style={{
              backgroundColor: '#302747',
              color: '#FFF9F0',
            }}
          >
            <span>Try for free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
