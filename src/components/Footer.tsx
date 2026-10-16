import React from 'react';
import type { SidebarTab } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';
import { BookOpen, Heart } from 'lucide-react';

interface FooterProps {
  theme: ThemeColors;
  onNavigate: (tab: SidebarTab) => void;
  onOpenResourceDiscovery: () => void;
  onOpenFeedback: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  theme,
  onNavigate,
  onOpenResourceDiscovery,
  onOpenFeedback,
}) => {
  return (
    <footer
      className="mt-12 border-t pt-12 pb-10 transition-colors duration-200"
      style={{
        backgroundColor: theme.isDark ? 'rgba(16, 13, 24, 0.95)' : 'rgba(255, 249, 240, 0.85)',
        borderColor: theme.surfaceBorder,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Mission Statement */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-base shadow-sm"
                style={{
                  backgroundColor: '#DCD1FA',
                  color: '#302747',
                  border: '1px solid rgba(48, 39, 71, 0.12)',
                }}
              >
                S
              </div>
              <span className="font-extrabold text-xl tracking-tight" style={{ color: theme.textPrimary }}>
                StudySpace
              </span>
            </div>

            <p className="text-sm font-medium leading-relaxed max-w-sm mb-4" style={{ color: theme.textSecondary }}>
              An academic resource discovery and revision planning platform crafted for students.
              Study calmer, retain concepts deeper, and collaborate freely with peers.
            </p>

            <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
              <span>Built with care for learners worldwide</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: theme.textPrimary }}>
              Navigation
            </h3>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:underline transition-colors cursor-pointer"
                  style={{ color: theme.textSecondary }}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="hover:underline transition-colors cursor-pointer"
                  style={{ color: theme.textSecondary }}
                >
                  Student Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('manage')}
                  className="hover:underline transition-colors cursor-pointer"
                  style={{ color: theme.textSecondary }}
                >
                  Manage Materials
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('study-plan')}
                  className="hover:underline transition-colors cursor-pointer"
                  style={{ color: theme.textSecondary }}
                >
                  Study Plan & Focus
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('feedback')}
                  className="hover:underline transition-colors cursor-pointer"
                  style={{ color: theme.textSecondary }}
                >
                  Student Feedback
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Platform Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: theme.textPrimary }}>
              Resources & Planning
            </h3>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <button
                  type="button"
                  onClick={onOpenResourceDiscovery}
                  className="hover:underline transition-colors cursor-pointer text-left"
                  style={{ color: theme.textSecondary }}
                >
                  Resource Discovery Hub
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('study-plan')}
                  className="hover:underline transition-colors cursor-pointer text-left"
                  style={{ color: theme.textSecondary }}
                >
                  Revision Schedule Planner
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenFeedback}
                  className="hover:underline transition-colors cursor-pointer text-left"
                  style={{ color: theme.textSecondary }}
                >
                  Request a Resource / Subject
                </button>
              </li>
              <li>
                <span className="text-xs opacity-70 block pt-1" style={{ color: theme.textMuted }}>
                  Zero Ads · Open Knowledge
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and accessibility statement */}
        <div
          className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-3"
          style={{ borderColor: theme.surfaceBorder, color: theme.textMuted }}
        >
          <p>© {new Date().getFullYear()} StudySpace. All academic materials are shared for educational demonstration.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Student Privacy</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Terms of Academic Integrity</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Community Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
