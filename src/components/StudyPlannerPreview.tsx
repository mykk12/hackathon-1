import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Calendar, ArrowRight, Play, Sparkles } from 'lucide-react';
import type { StudyTask } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';

interface StudyPlannerPreviewProps {
  theme: ThemeColors;
  initialTasks: StudyTask[];
  onOpenPlanner: () => void;
  userEmail?: string | null;
}

export const StudyPlannerPreview: React.FC<StudyPlannerPreviewProps> = ({
  theme,
  initialTasks,
  onOpenPlanner,
  userEmail,
}) => {
  const [tasks, setTasks] = useState<StudyTask[]>(initialTasks);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const username = userEmail ? userEmail.split('@')[0] : 'Scholar';

  return (
    <section className="py-6 sm:py-10" id="personal-study-planner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl p-6 sm:p-10 lg:p-12 backdrop-blur-xl relative overflow-hidden shadow-lg"
          style={{
            backgroundColor: theme.isDark ? 'rgba(30, 25, 42, 0.75)' : '#FFF9F0',
            border: `1px solid ${theme.surfaceBorder}`,
          }}
        >
          {/* Subtle decorative background gradient */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: '#BCE9D5' }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left copy & CTA */}
            <div className="lg:col-span-5 text-left">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-xs"
                style={{
                  backgroundColor: '#BCE9D5',
                  color: '#164E3A',
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personal Study Workspace · {userEmail}</span>
              </div>

              <h2
                className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-2"
                style={{ color: theme.textPrimary }}
              >
                Welcome back, {username}!
              </h2>

              <p
                className="text-sm sm:text-base font-medium leading-relaxed mb-6"
                style={{ color: theme.textSecondary }}
              >
                Your private revision sprint and daily progress targets synced with <strong>{userEmail}</strong>.
              </p>

              {/* Progress summary widget */}
              <div
                className="p-4 rounded-2xl mb-6 backdrop-blur-sm"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                  border: `1px solid ${theme.surfaceBorder}`,
                }}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span style={{ color: theme.textPrimary }}>Today's Target Progress</span>
                  <span style={{ color: '#164E3A' }}>
                    {completedCount} of {tasks.length} completed ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: '#BCE9D5',
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenPlanner}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: '#302747',
                  color: '#FFF9F0',
                }}
              >
                <span>Open Full Study Planner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:col-span-7">
              <div
                className="rounded-2xl p-5 sm:p-6 shadow-md backdrop-blur-md"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(20, 16, 30, 0.85)' : 'rgba(255, 255, 255, 0.92)',
                  border: `1px solid ${theme.surfaceBorder}`,
                }}
              >
                {/* Header with Pomodoro / Focus Timer preview */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b gap-3" style={{ borderColor: theme.surfaceBorder }}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-sm" style={{ color: theme.textPrimary }}>
                      Today's Revision Agenda
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold self-start sm:self-auto"
                    style={{
                      backgroundColor: theme.isDark ? 'rgba(188, 233, 213, 0.15)' : '#BCE9D5',
                      color: theme.isDark ? '#D1FAE5' : '#164E3A',
                    }}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Focus Block: {formatTimer(focusSeconds)}</span>
                    <button
                      type="button"
                      onClick={() => setIsFocusRunning(!isFocusRunning)}
                      className="ml-1 p-1 rounded hover:bg-black/10 transition-colors"
                      aria-label={isFocusRunning ? 'Pause timer' : 'Start timer'}
                    >
                      <Play className={`w-3 h-3 ${isFocusRunning ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Interactive Task Checklist */}
                <div className="space-y-2.5">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      role="checkbox"
                      aria-checked={task.completed}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          toggleTask(task.id);
                        }
                      }}
                      className="p-3 rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer hover:translate-x-1"
                      style={{
                        backgroundColor: task.completed
                          ? (theme.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(48, 39, 71, 0.03)')
                          : (theme.isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(48, 39, 71, 0.04)'),
                        border: `1px solid ${theme.surfaceBorder}`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="shrink-0 transition-transform active:scale-90"
                          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                          ) : (
                            <Circle className="w-5 h-5" style={{ color: theme.textMuted }} />
                          )}
                        </button>

                        <div>
                          <span
                            className={`text-xs sm:text-sm font-semibold transition-all ${
                              task.completed ? 'line-through opacity-60' : ''
                            }`}
                            style={{ color: theme.textPrimary }}
                          >
                            {task.title}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] mt-0.5" style={{ color: theme.textMuted }}>
                            <span>{task.subject}</span>
                            <span>•</span>
                            <span>{task.durationMinutes} mins</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
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
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                            color: theme.textSecondary,
                          }}
                        >
                          {task.dueDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t text-center" style={{ borderColor: theme.surfaceBorder }}>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    💡 Tip: Click any task above to test live checklist completion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
