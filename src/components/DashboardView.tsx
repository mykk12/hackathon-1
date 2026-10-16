import React from 'react';
import { LayoutDashboard, BookOpen, Clock, Trophy, Flame, Bookmark, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { AcademicResource, StudyTask } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';
import { WorkCalendar } from './WorkCalendar.tsx';

interface DashboardViewProps {
  theme: ThemeColors;
  savedResources: AcademicResource[];
  tasks: StudyTask[];
  onOpenResource: (resource: AcademicResource) => void;
  onGoToPlanner: () => void;
  onGoToHome: () => void;
  onOpenUpload?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  theme,
  savedResources,
  tasks,
  onOpenResource,
  onGoToPlanner,
  onGoToHome,
  onOpenUpload,
}) => {
  const completedTasks = tasks.filter((t) => t.completed).length;

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: theme.textPrimary }}>
            Student Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenUpload && (
            <button
              type="button"
              onClick={onOpenUpload}
              className="px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer hover:opacity-90 flex items-center gap-1.5"
              style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
            >
              <span>+ Upload Study Material</span>
            </button>
          )}
          <button
            type="button"
            onClick={onGoToHome}
            className="px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer hover:opacity-80"
            style={{ borderColor: theme.surfaceBorder, color: theme.textPrimary }}
          >
            ← Back to Homepage
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          className="p-5 rounded-3xl backdrop-blur-md shadow-xs"
          style={{
            backgroundColor: theme.isDark ? 'rgba(220, 209, 250, 0.12)' : 'rgba(220, 209, 250, 0.5)',
            border: `1px solid ${theme.surfaceBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: theme.textPrimary }}>Study Streak</span>
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black" style={{ color: theme.textPrimary }}>
            {completedTasks > 0 ? '1 Day' : '0 Days'}
          </div>
          <div className="text-[11px] font-medium mt-1" style={{ color: theme.textMuted }}>
            {completedTasks > 0 ? 'Active revision streak' : 'Start a task to build streak'}
          </div>
        </div>

        <div
          className="p-5 rounded-3xl backdrop-blur-md shadow-xs"
          style={{
            backgroundColor: theme.isDark ? 'rgba(188, 233, 213, 0.12)' : 'rgba(188, 233, 213, 0.5)',
            border: `1px solid ${theme.surfaceBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: theme.textPrimary }}>Tasks Done</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black" style={{ color: theme.textPrimary }}>
            {completedTasks} / {tasks.length}
          </div>
          <div className="text-[11px] font-medium mt-1" style={{ color: theme.textMuted }}>
            Target completion rate {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
          </div>
        </div>

        <div
          className="p-5 rounded-3xl backdrop-blur-md shadow-xs"
          style={{
            backgroundColor: theme.isDark ? 'rgba(246, 235, 196, 0.15)' : 'rgba(246, 235, 196, 0.5)',
            border: `1px solid ${theme.surfaceBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: theme.textPrimary }}>Saved Decks</span>
            <Bookmark className="w-5 h-5 text-amber-600 fill-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black" style={{ color: theme.textPrimary }}>
            {savedResources.length}
          </div>
          <div className="text-[11px] font-medium mt-1" style={{ color: theme.textMuted }}>
            Ready for offline revision
          </div>
        </div>

        <div
          className="p-5 rounded-3xl backdrop-blur-md shadow-xs"
          style={{
            backgroundColor: theme.isDark ? 'rgba(255, 209, 184, 0.12)' : 'rgba(255, 209, 184, 0.5)',
            border: `1px solid ${theme.surfaceBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: theme.textPrimary }}>Focus Hours</span>
            <Clock className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black" style={{ color: theme.textPrimary }}>
            {completedTasks > 0 ? `${(completedTasks * 0.75).toFixed(1)} hrs` : '0.0 hrs'}
          </div>
          <div className="text-[11px] font-medium mt-1" style={{ color: theme.textMuted }}>
            Logged this week
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Work Calendar & Saved Materials Quick Access */}
        <div className="lg:col-span-7 space-y-6">
          {/* Work Calendar: Above bookmarked block in dashboard section only */}
          <WorkCalendar theme={theme} tasks={tasks} />

          <div
            className="p-6 rounded-3xl backdrop-blur-xl shadow-sm"
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.surfaceBorder}`,
            }}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: theme.surfaceBorder }}>
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                <h2 className="font-bold text-base" style={{ color: theme.textPrimary }}>
                  Bookmarked Academic Decks ({savedResources.length})
                </h2>
              </div>
            </div>

            {savedResources.length === 0 ? (
              <p className="text-xs py-8 text-center" style={{ color: theme.textMuted }}>
                No materials saved yet. Explore popular resources on the homepage and click the bookmark icon!
              </p>
            ) : (
              <div className="space-y-3">
                {savedResources.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => onOpenResource(res)}
                    className="p-3.5 rounded-2xl flex items-center justify-between transition-all hover:-translate-y-0.5 cursor-pointer group"
                    style={{
                      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFF9F0',
                      border: `1px solid ${theme.surfaceBorder}`,
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold mb-1">
                        <span className="px-2 py-0.5 rounded bg-[#DCD1FA] text-[#302747]">{res.subject}</span>
                        <span style={{ color: theme.textMuted }}>{res.format}</span>
                      </div>
                      <h3 className="font-bold text-sm group-hover:underline" style={{ color: theme.textPrimary }}>
                        {res.title}
                      </h3>
                      <p className="text-xs line-clamp-1 mt-0.5" style={{ color: theme.textSecondary }}>
                        {res.summary}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: theme.textMuted }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Upcoming Targets & Planner quick link */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className="p-6 rounded-3xl backdrop-blur-xl shadow-sm"
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.surfaceBorder}`,
            }}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: theme.surfaceBorder }}>
              <h2 className="font-bold text-base" style={{ color: theme.textPrimary }}>
                Upcoming Revision Schedule
              </h2>
              <button
                type="button"
                onClick={onGoToPlanner}
                className="text-xs font-bold hover:underline cursor-pointer"
                style={{ color: '#8E74DB' }}
              >
                Open Planner →
              </button>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl flex items-center justify-between text-xs"
                  style={{
                    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(48, 39, 71, 0.02)',
                    border: `1px solid ${theme.surfaceBorder}`,
                  }}
                >
                  <div>
                    <span className={`font-semibold ${task.completed ? 'line-through opacity-60' : ''}`} style={{ color: theme.textPrimary }}>
                      {task.title}
                    </span>
                    <div className="text-[11px] mt-0.5" style={{ color: theme.textMuted }}>
                      {task.subject} · {task.durationMinutes} mins
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor:
                          task.priority === 'max'
                            ? '#FEE2E2'
                            : task.priority === 'high'
                            ? '#FFEDD5'
                            : task.priority === 'medium'
                            ? '#FCE7F3'
                            : '#FEF9C3',
                        borderColor:
                          task.priority === 'max'
                            ? '#EF4444'
                            : task.priority === 'high'
                            ? '#F97316'
                            : task.priority === 'medium'
                            ? '#EC4899'
                            : '#EAB308',
                        color:
                          task.priority === 'max'
                            ? '#991B1B'
                            : task.priority === 'high'
                            ? '#9A3412'
                            : task.priority === 'medium'
                            ? '#9D174D'
                            : '#854D0E',
                      }}
                    >
                      {task.priority === 'max' ? '🔴 Max' : task.priority === 'high' ? '🟠 High' : task.priority === 'medium' ? '🌸 Med' : '🟡 Low'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/10" style={{ color: theme.textPrimary }}>
                      {task.dueDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Option of Medium Size: Upload & Share Study Material */}
          {onOpenUpload && (
            <div
              onClick={onOpenUpload}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenUpload();
                }
              }}
              className="p-5 rounded-3xl backdrop-blur-xl border-2 transition-all cursor-pointer group shadow-sm hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#8E74DB]"
              style={{
                backgroundColor: theme.isDark ? 'rgba(220, 209, 250, 0.08)' : 'rgba(220, 209, 250, 0.25)',
                borderColor: '#DCD1FA',
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-110"
                    style={{ backgroundColor: '#DCD1FA', color: '#302747' }}
                  >
                    +
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base group-hover:underline" style={{ color: theme.textPrimary }}>
                      Upload Study Deck
                    </h3>
                    <p className="text-[11px] font-medium" style={{ color: theme.textSecondary }}>
                      PPT, DOC, PDF, Photo, Sheets, Notes
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  Interactive
                </span>
              </div>

              <p className="text-xs leading-relaxed mb-4" style={{ color: theme.textSecondary }}>
                Upload notes and revision sheets. Previews are generated instantly, and you can share publicly with peers or save privately to My Uploaded Decks.
              </p>

              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: theme.surfaceBorder }}>
                <span className="text-[11px] font-bold text-[#8E74DB] group-hover:underline">
                  Click to select file format & upload →
                </span>
                <span
                  className="px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs"
                  style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
                >
                  Upload Material
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
