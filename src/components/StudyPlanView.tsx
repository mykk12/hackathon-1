import React, { useState, useEffect } from 'react';
import { CalendarClock, Play, Pause, RotateCcw, Plus, CheckCircle2, Circle, Clock, Flame, ArrowLeft } from 'lucide-react';
import type { StudyTask, SubjectType } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';

interface StudyPlanViewProps {
  theme: ThemeColors;
  tasks: StudyTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: StudyTask) => void;
  onGoToHome: () => void;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  theme,
  tasks,
  onToggleTask,
  onAddTask,
  onGoToHome,
}) => {
  // Focus Timer state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'study' | 'break'>('study');

  // Task creation
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newSubject, setNewSubject] = useState<SubjectType>('Computer Science');
  const [newDuration, setNewDuration] = useState('30');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerSeconds]);

  const handleStartPause = () => setIsRunning(!isRunning);
  const handleReset = (mode: 'study' | 'break') => {
    setIsRunning(false);
    setTimerMode(mode);
    setTimerSeconds(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: StudyTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newSubject,
      dueDate: 'Today, 8:00 PM',
      durationMinutes: parseInt(newDuration, 10) || 30,
      completed: false,
      priority: 'medium',
    };

    onAddTask(task);
    setNewTaskTitle('');
    setIsAdding(false);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8E74DB' }}>
            <span>Smart Revision Planner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: theme.textPrimary }}>
            Study Plan & Focus Timer
          </h1>
          <p className="text-sm font-medium mt-1" style={{ color: theme.textSecondary }}>
            Structure your syllabus into manageable intervals with distraction-free focus blocks.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToHome}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer hover:opacity-80 self-start sm:self-auto"
          style={{ borderColor: theme.surfaceBorder, color: theme.textPrimary }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Homepage</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Pomodoro Focus Session Timer */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className="p-6 sm:p-8 rounded-3xl text-center backdrop-blur-xl shadow-lg relative overflow-hidden"
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.surfaceBorder}`,
            }}
          >
            <div className="flex justify-center gap-2 mb-6">
              <button
                type="button"
                onClick={() => handleReset('study')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timerMode === 'study' ? 'bg-[#DCD1FA] text-[#302747] shadow-xs' : 'opacity-70'
                }`}
                style={{ color: timerMode === 'study' ? '#302747' : theme.textPrimary }}
              >
                Focus Session (25m)
              </button>
              <button
                type="button"
                onClick={() => handleReset('break')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timerMode === 'break' ? 'bg-[#BCE9D5] text-[#164E3A] shadow-xs' : 'opacity-70'
                }`}
                style={{ color: timerMode === 'break' ? '#164E3A' : theme.textPrimary }}
              >
                Quick Break (5m)
              </button>
            </div>

            {/* Big Timer Display */}
            <div className="my-6">
              <div
                className="text-6xl sm:text-7xl font-mono font-black tracking-tight"
                style={{ color: theme.textPrimary }}
              >
                {formatTimer(timerSeconds)}
              </div>
              <p className="text-xs font-semibold mt-2" style={{ color: theme.textMuted }}>
                {timerMode === 'study' ? 'Deep Work Interval' : 'Rest your eyes & hydrate'}
              </p>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleStartPause}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: isRunning ? '#EF4444' : '#302747',
                  color: '#FFF9F0',
                }}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Session</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleReset(timerMode)}
                className="p-3 rounded-2xl border transition-all cursor-pointer hover:opacity-80"
                style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
                aria-label="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick study tips */}
          <div
            className="p-5 rounded-3xl backdrop-blur-md text-xs space-y-2"
            style={{
              backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.04)' : '#FFF9F0',
              border: `1px solid ${theme.surfaceBorder}`,
            }}
          >
            <div className="flex items-center gap-2 font-bold" style={{ color: theme.textPrimary }}>
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Spaced Repetition Tip</span>
            </div>
            <p className="leading-relaxed" style={{ color: theme.textSecondary }}>
              Review notes 1 day after reading, then 3 days later, then 7 days later.
              Short 25-minute sprints reduce cognitive fatigue by 40%.
            </p>
          </div>
        </div>

        {/* Right: Revision Tasks Checklist & Creation */}
        <div className="lg:col-span-7">
          <div
            className="p-6 rounded-3xl backdrop-blur-xl shadow-sm"
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.surfaceBorder}`,
            }}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: theme.surfaceBorder }}>
              <div>
                <h2 className="font-bold text-base" style={{ color: theme.textPrimary }}>
                  Revision Task Queue
                </h2>
                <span className="text-xs" style={{ color: theme.textMuted }}>
                  {completedCount} of {tasks.length} tasks completed
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer hover:opacity-90"
                style={{ backgroundColor: '#DCD1FA', color: '#302747' }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Revision Task</span>
              </button>
            </div>

            {/* Add Task Form */}
            {isAdding && (
              <form onSubmit={handleCreateTask} className="p-4 rounded-2xl mb-4 space-y-3 bg-black/5 dark:bg-white/5 border" style={{ borderColor: theme.surfaceBorder }}>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                    Task Title / Chapter
                  </label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Practice Euler's formula differential exercises"
                    className="w-full px-3 py-2 rounded-xl text-xs border focus:outline-none"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                      Subject
                    </label>
                    <select
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value as SubjectType)}
                      className="w-full px-3 py-2 rounded-xl text-xs border"
                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Biology">Biology</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="180"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs border"
                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                    style={{ color: theme.textMuted }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
                  >
                    Save Task
                  </button>
                </div>
              </form>
            )}

            {/* Tasks List */}
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className="p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer hover:translate-x-1"
                  style={{
                    backgroundColor: task.completed
                      ? (theme.isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(48, 39, 71, 0.02)')
                      : (theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(48, 39, 71, 0.04)'),
                    border: `1px solid ${theme.surfaceBorder}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="shrink-0"
                      aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="w-5 h-5" style={{ color: theme.textMuted }} />
                      )}
                    </button>

                    <div>
                      <span className={`text-xs sm:text-sm font-bold ${task.completed ? 'line-through opacity-60' : ''}`} style={{ color: theme.textPrimary }}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] mt-0.5" style={{ color: theme.textMuted }}>
                        <span className="font-semibold">{task.subject}</span>
                        <span>•</span>
                        <span>{task.durationMinutes} minutes</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10" style={{ color: theme.textPrimary }}>
                    {task.dueDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
