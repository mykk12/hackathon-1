import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  ArrowLeft,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import type { StudyTask, SubjectType } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';

export interface TimerPreset {
  id: string;
  minutes: number;
  label: string;
  isPinned: boolean;
}

const INITIAL_PRESETS: TimerPreset[] = [
  { id: 'preset-5', minutes: 5, label: '5 mins', isPinned: false },
  { id: 'preset-15', minutes: 15, label: '15 mins', isPinned: false },
  { id: 'preset-30', minutes: 30, label: '30 mins', isPinned: false },
  { id: 'preset-60', minutes: 60, label: '60 mins', isPinned: false },
];

const RESERVE_PRESET_MINUTES = [10, 20, 25, 45, 90, 120];

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
  // Focus Timer state (Default at 00:00)
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timerDirection, setTimerDirection] = useState<'down' | 'up'>('down');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // Editable Timer Display State
  const [isEditingTimer, setIsEditingTimer] = useState(false);
  const [inputMinutes, setInputMinutes] = useState('0');
  const [inputSeconds, setInputSeconds] = useState('0');

  // Presets State (Default: 5, 15, 30, 60 mins)
  const [presets, setPresets] = useState<TimerPreset[]>(INITIAL_PRESETS);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editPresetMinutes, setEditPresetMinutes] = useState<number>(15);

  // Custom preset creation
  const [isAddingCustomPreset, setIsAddingCustomPreset] = useState(false);
  const [customPresetMinutes, setCustomPresetMinutes] = useState('25');

  // Task creation
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newSubject, setNewSubject] = useState<SubjectType>('Computer Science');
  const [newDuration, setNewDuration] = useState('30');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'max'>('medium');
  const [newDueDate, setNewDueDate] = useState('2026-10-21');
  const [newDueTime, setNewDueTime] = useState('4:00 PM');
  const [isAdding, setIsAdding] = useState(true);

  // Timer interval effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (timerDirection === 'down') {
            if (prev <= 1) {
              setIsRunning(false);
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerDirection]);

  const handleStartPause = () => {
    if (!isRunning) {
      if (timerSeconds === 0) {
        setTimerDirection('up');
      } else {
        setTimerDirection('down');
      }
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimerSeconds(0);
    setTimerDirection('down');
    setSelectedPresetId(null);
  };

  const handleSelectPreset = (preset: TimerPreset) => {
    setIsRunning(false);
    setTimerSeconds(preset.minutes * 60);
    setTimerDirection('down');
    setSelectedPresetId(preset.id);
    setIsEditingTimer(false);
  };

  const handleStartEditTimer = () => {
    setIsRunning(false);
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    setInputMinutes(m.toString());
    setInputSeconds(s.toString().padStart(2, '0'));
    setIsEditingTimer(true);
  };

  const handleSaveTimer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const mins = Math.max(0, parseInt(inputMinutes, 10) || 0);
    const secs = Math.max(0, Math.min(59, parseInt(inputSeconds, 10) || 0));
    const total = mins * 60 + secs;
    setTimerSeconds(total);
    setTimerDirection(total > 0 ? 'down' : 'up');
    setIsRunning(false);
    setIsEditingTimer(false);
    setSelectedPresetId(null);
  };

  // Pin preset: if pinned add another not available default option after the pinned ones
  const handleTogglePin = (id: string) => {
    setPresets((prev) => {
      const target = prev.find((p) => p.id === id);
      if (!target) return prev;

      const willBePinned = !target.isPinned;
      let updated = prev.map((p) => (p.id === id ? { ...p, isPinned: willBePinned } : p));

      if (willBePinned) {
        const existingMinutes = new Set(updated.map((p) => p.minutes));
        const nextMinute = RESERVE_PRESET_MINUTES.find((m) => !existingMinutes.has(m));
        if (nextMinute) {
          const newPreset: TimerPreset = {
            id: `preset-${nextMinute}-${Date.now()}`,
            minutes: nextMinute,
            label: `${nextMinute} mins`,
            isPinned: false,
          };
          const pinned = updated.filter((p) => p.isPinned);
          const unpinned = updated.filter((p) => !p.isPinned);
          return [...pinned, newPreset, ...unpinned];
        }
      }

      const pinned = updated.filter((p) => p.isPinned);
      const unpinned = updated.filter((p) => !p.isPinned);
      return [...pinned, ...unpinned];
    });
  };

  const handleStartEditPreset = (preset: TimerPreset) => {
    setEditingPresetId(preset.id);
    setEditPresetMinutes(preset.minutes);
  };

  const handleSavePresetEdit = (id: string) => {
    if (editPresetMinutes <= 0) return;
    setPresets((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              minutes: editPresetMinutes,
              label: `${editPresetMinutes} mins`,
            }
          : p
      )
    );
    if (selectedPresetId === id) {
      setTimerSeconds(editPresetMinutes * 60);
    }
    setEditingPresetId(null);
  };

  const handleDeletePreset = (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
    if (selectedPresetId === id) {
      setSelectedPresetId(null);
    }
  };

  const handleAddCustomPreset = () => {
    const mins = parseInt(customPresetMinutes, 10);
    if (!mins || mins <= 0) return;
    const newPreset: TimerPreset = {
      id: `preset-custom-${Date.now()}`,
      minutes: mins,
      label: `${mins} mins`,
      isPinned: false,
    };
    setPresets((prev) => [...prev, newPreset]);
    setIsAddingCustomPreset(false);
    setCustomPresetMinutes('25');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: StudyTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newSubject,
      dueDate: `${newDueDate}, ${newDueTime}`,
      durationMinutes: parseInt(newDuration, 10) || 30,
      completed: false,
      priority: newPriority,
    };

    onAddTask(task);
    setNewTaskTitle('');
  };

  const formatTimer = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [taskStatusTab, setTaskStatusTab] = useState<'completed' | 'expired'>('completed');

  const completedCount = tasks.filter((t) => t.completed).length;
  const completedTasks = tasks.filter((t) => t.completed);
  const expiredTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: theme.textPrimary }}>
            Study Plan & Focus Timer
          </h1>
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
            {/* Top Header Row with Focus Timer Status */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: theme.surfaceBorder }}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="font-extrabold text-xs" style={{ color: theme.textPrimary }}>Focus & Study Timer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: isRunning
                      ? 'rgba(239, 68, 68, 0.15)'
                      : timerSeconds === 0
                      ? 'rgba(142, 116, 219, 0.15)'
                      : 'rgba(16, 185, 129, 0.15)',
                    color: isRunning
                      ? '#EF4444'
                      : timerSeconds === 0
                      ? '#8E74DB'
                      : '#10B981',
                  }}
                >
                  {isRunning ? 'Running' : timerSeconds === 0 ? 'Ready (00:00)' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Presets Header & Add Custom Preset Button */}
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-70" style={{ color: theme.textSecondary }}>
                Time Presets
              </span>
              <button
                type="button"
                onClick={() => setIsAddingCustomPreset(!isAddingCustomPreset)}
                className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Preset</span>
              </button>
            </div>

            {/* Quick Inline Custom Preset Addition */}
            {isAddingCustomPreset && (
              <div
                className="p-3 rounded-2xl border mb-3 flex items-center justify-between gap-2 animate-in fade-in"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F9F8FD',
                  borderColor: theme.surfaceBorder,
                }}
              >
                <span className="text-xs font-bold" style={{ color: theme.textPrimary }}>New preset duration:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={customPresetMinutes}
                    onChange={(e) => setCustomPresetMinutes(e.target.value)}
                    placeholder="Mins"
                    className="w-16 px-2 py-1 text-xs font-mono font-bold rounded-lg border text-center"
                    style={{ backgroundColor: theme.cardBg, color: theme.textPrimary, borderColor: theme.surfaceBorder }}
                    autoFocus
                  />
                  <span className="text-xs font-medium opacity-70">mins</span>
                  <button
                    type="button"
                    onClick={handleAddCustomPreset}
                    className="p-1.5 rounded-lg bg-purple-600 text-white cursor-pointer hover:bg-purple-700"
                    title="Add"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomPreset(false)}
                    className="p-1.5 rounded-lg bg-gray-500 text-white cursor-pointer hover:bg-gray-600"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 4 Default Time Presets: 5, 15, 30, 60 mins & dynamic pinned additions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {presets.map((preset) => {
                const isSelected = selectedPresetId === preset.id || timerSeconds === preset.minutes * 60;
                const isEditingThis = editingPresetId === preset.id;

                if (isEditingThis) {
                  return (
                    <div
                      key={preset.id}
                      className="p-2 rounded-2xl border flex flex-col gap-1.5 shadow-sm"
                      style={{
                        backgroundColor: theme.isDark ? '#2D2540' : '#F4F2FB',
                        borderColor: '#8E74DB',
                      }}
                    >
                      <div className="text-[10px] font-black uppercase text-purple-500">Edit Mins</div>
                      <input
                        type="number"
                        min="1"
                        max="360"
                        value={editPresetMinutes}
                        onChange={(e) => setEditPresetMinutes(parseInt(e.target.value, 10) || 1)}
                        className="w-full text-xs font-mono font-bold px-1.5 py-1 rounded-lg border text-center"
                        style={{ backgroundColor: theme.cardBg, color: theme.textPrimary }}
                        autoFocus
                      />
                      <div className="flex items-center gap-1 justify-center">
                        <button
                          type="button"
                          onClick={() => handleSavePresetEdit(preset.id)}
                          className="p-1 rounded-lg bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPresetId(null)}
                          className="p-1 rounded-lg bg-gray-500 text-white cursor-pointer hover:bg-gray-600"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={preset.id}
                    className={`relative p-2.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'ring-2 ring-purple-500 shadow-md scale-102'
                        : 'hover:border-purple-400/50 hover:shadow-xs'
                    }`}
                    style={{
                      backgroundColor: isSelected
                        ? theme.isDark
                          ? '#2E2644'
                          : '#DCD1FA'
                        : theme.isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(48, 39, 71, 0.04)',
                      borderColor: preset.isPinned
                        ? '#F59E0B'
                        : isSelected
                        ? '#8E74DB'
                        : theme.surfaceBorder,
                    }}
                  >
                    {/* Pinned indicator badge */}
                    {preset.isPinned && (
                      <div
                        className="absolute -top-2 left-2 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-xs"
                        style={{ backgroundColor: '#F59E0B', color: '#FFFFFF' }}
                      >
                        <Pin className="w-2.5 h-2.5 fill-current" />
                        <span>Pinned</span>
                      </div>
                    )}

                    {/* Preset click button to load time */}
                    <button
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="w-full text-left cursor-pointer pt-0.5"
                    >
                      <div
                        className="font-black text-sm tracking-tight"
                        style={{ color: isSelected ? (theme.isDark ? '#FFFFFF' : '#302747') : theme.textPrimary }}
                      >
                        {preset.label}
                      </div>
                      <div className="text-[10px] font-mono opacity-70" style={{ color: theme.textSecondary }}>
                        {preset.minutes} min
                      </div>
                    </button>

                    {/* Action Icons Row: Pin, Edit, Delete with Hover Tooltips */}
                    <div className="flex items-center justify-end gap-1 mt-2 pt-1.5 border-t border-black/5 dark:border-white/10">
                      {/* Pin icon with hover tooltip */}
                      <div className="relative group/btn flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin(preset.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            preset.isPinned
                              ? 'text-amber-500 hover:bg-amber-500/15'
                              : 'text-gray-400 hover:text-amber-500 hover:bg-amber-500/10'
                          }`}
                          aria-label={preset.isPinned ? 'Unpin Preset' : 'Pin Preset'}
                        >
                          {preset.isPinned ? (
                            <PinOff className="w-3.5 h-3.5" />
                          ) : (
                            <Pin className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <div
                          role="tooltip"
                          className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 scale-90 group-hover/btn:scale-100 transition-all duration-200 pointer-events-none px-2 py-0.5 rounded-lg text-[10px] font-black whitespace-nowrap shadow-xl z-30"
                          style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
                        >
                          {preset.isPinned ? 'Unpin Preset' : 'Pin Preset'}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-[#302747]" />
                        </div>
                      </div>

                      {/* Edit icon with hover tooltip */}
                      <div className="relative group/btn flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditPreset(preset);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                          aria-label="Edit Preset"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <div
                          role="tooltip"
                          className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 scale-90 group-hover/btn:scale-100 transition-all duration-200 pointer-events-none px-2 py-0.5 rounded-lg text-[10px] font-black whitespace-nowrap shadow-xl z-30"
                          style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
                        >
                          Edit Preset
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-[#302747]" />
                        </div>
                      </div>

                      {/* Delete icon with hover tooltip */}
                      <div className="relative group/btn flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePreset(preset.id);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          aria-label="Delete Preset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div
                          role="tooltip"
                          className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 scale-90 group-hover/btn:scale-100 transition-all duration-200 pointer-events-none px-2 py-0.5 rounded-lg text-[10px] font-black whitespace-nowrap shadow-xl z-30"
                          style={{ backgroundColor: '#BE123C', color: '#FFFFFF' }}
                        >
                          Delete Preset
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-[#BE123C]" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Big Timer Display (Default at 00:00 & Editable) */}
            <div className="my-6">
              {isEditingTimer ? (
                <div
                  className="p-4 rounded-3xl border max-w-sm mx-auto shadow-inner animate-in fade-in zoom-in-95"
                  style={{
                    backgroundColor: theme.isDark ? 'rgba(0,0,0,0.25)' : 'rgba(48,39,71,0.04)',
                    borderColor: theme.surfaceBorder,
                  }}
                >
                  <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-75" style={{ color: theme.textSecondary }}>
                    Edit Timer Duration
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        min="0"
                        max="999"
                        value={inputMinutes}
                        onChange={(e) => setInputMinutes(e.target.value)}
                        className="w-20 text-3xl font-mono font-black text-center py-2 px-1 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                        style={{ backgroundColor: theme.cardBg, color: theme.textPrimary, borderColor: theme.surfaceBorder }}
                        autoFocus
                      />
                      <span className="text-[10px] font-black mt-1 opacity-60">MINUTES</span>
                    </div>
                    <span className="text-3xl font-mono font-black opacity-40 -mt-4">:</span>
                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={inputSeconds}
                        onChange={(e) => setInputSeconds(e.target.value)}
                        className="w-20 text-3xl font-mono font-black text-center py-2 px-1 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                        style={{ backgroundColor: theme.cardBg, color: theme.textPrimary, borderColor: theme.surfaceBorder }}
                      />
                      <span className="text-[10px] font-black mt-1 opacity-60">SECONDS</span>
                    </div>
                  </div>

                  {/* Quick Steppers */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
                    <button
                      type="button"
                      onClick={() => setInputMinutes((prev) => Math.max(0, (parseInt(prev, 10) || 0) + 1).toString())}
                      className="px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ borderColor: theme.surfaceBorder }}
                    >
                      +1m
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMinutes((prev) => Math.max(0, (parseInt(prev, 10) || 0) + 5).toString())}
                      className="px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ borderColor: theme.surfaceBorder }}
                    >
                      +5m
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMinutes((prev) => Math.max(0, (parseInt(prev, 10) || 0) + 15).toString())}
                      className="px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ borderColor: theme.surfaceBorder }}
                    >
                      +15m
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputMinutes('0');
                        setInputSeconds('0');
                      }}
                      className="px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 text-rose-500"
                      style={{ borderColor: theme.surfaceBorder }}
                    >
                      00:00
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveTimer}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Set Timer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingTimer(false)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative inline-block group">
                  <button
                    type="button"
                    onClick={handleStartEditTimer}
                    className="text-6xl sm:text-7xl font-mono font-black tracking-tight cursor-pointer hover:opacity-85 transition-all inline-flex items-center gap-3 group-hover:scale-102"
                    style={{ color: theme.textPrimary }}
                    title="Click to edit timer"
                  >
                    <span>{formatTimer(timerSeconds)}</span>
                    <div className="relative group/editbtn opacity-60 group-hover:opacity-100 transition-opacity">
                      <span className="p-2 rounded-2xl border flex items-center justify-center text-xs shadow-xs" style={{ borderColor: theme.surfaceBorder, backgroundColor: theme.cardBg }}>
                        <Edit3 className="w-4 h-4 text-purple-500" />
                      </span>
                      <div
                        role="tooltip"
                        className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/editbtn:opacity-100 scale-90 group-hover/editbtn:scale-100 transition-all duration-200 pointer-events-none px-2 py-0.5 rounded-lg text-[10px] font-black whitespace-nowrap shadow-xl z-30"
                        style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
                      >
                        Edit Timer
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-[#302747]" />
                      </div>
                    </div>
                  </button>

                  <p
                    className="text-xs font-semibold mt-2 cursor-pointer hover:underline"
                    onClick={handleStartEditTimer}
                    style={{ color: theme.textMuted }}
                  >
                    {timerSeconds === 0
                      ? 'Default (00:00) · Click to edit or select a preset'
                      : isRunning
                      ? (timerDirection === 'down' ? 'Focus countdown running · Click to edit' : 'Stopwatch tracking · Click to edit')
                      : 'Ready to start · Click to edit'}
                  </p>
                </div>
              )}
            </div>

            {/* Timer Controls (Start/Pause, Reset, Edit) */}
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
                    <span>{timerSeconds === 0 ? 'Start Timer' : 'Start Session'}</span>
                  </>
                )}
              </button>

              <div className="relative group/btn flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-3 rounded-2xl border transition-all cursor-pointer hover:opacity-80"
                  style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
                  aria-label="Reset timer to 00:00"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div
                  role="tooltip"
                  className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 scale-90 group-hover/btn:scale-100 transition-all duration-200 pointer-events-none px-2 py-0.5 rounded-lg text-[10px] font-black whitespace-nowrap shadow-xl z-30"
                  style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
                >
                  Reset (00:00)
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-[#302747]" />
                </div>
              </div>

              <div className="relative group/btn flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleStartEditTimer}
                  className="p-3 rounded-2xl border transition-all cursor-pointer hover:opacity-80"
                  style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
                  aria-label="Edit Timer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <div
                  role="tooltip"
                  className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 scale-90 group-hover/btn:scale-100 transition-all duration-200 pointer-events-none px-2 py-0.5 rounded-lg text-[10px] font-black whitespace-nowrap shadow-xl z-30"
                  style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
                >
                  Edit Timer
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-[#302747]" />
                </div>
              </div>
            </div>
          </div>

          {/* Task Status Block with Completed & Expired Tabs */}
          <div
            className="p-5 sm:p-6 rounded-3xl backdrop-blur-xl shadow-sm border transition-all"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.surfaceBorder,
            }}
          >
            {/* Header & Tabs */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm tracking-tight" style={{ color: theme.textPrimary }}>
                  Task Archive & Status
                </h3>
                <span className="text-[11px] font-semibold" style={{ color: theme.textMuted }}>
                  {tasks.length} total tasks
                </span>
              </div>

              {/* Tabs Container */}
              <div
                className="flex items-center p-1 rounded-2xl gap-1.5"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(48, 39, 71, 0.06)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setTaskStatusTab('completed')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    taskStatusTab === 'completed' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor:
                      taskStatusTab === 'completed'
                        ? (theme.isDark ? '#2D2540' : '#FFFFFF')
                        : 'transparent',
                    color:
                      taskStatusTab === 'completed'
                        ? (theme.isDark ? '#FFFFFF' : '#302747')
                        : theme.textSecondary,
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Completed tasks</span>
                  <span
                    className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.25)' : '#DCFCE7',
                      color: theme.isDark ? '#6EE7B7' : '#166534',
                    }}
                  >
                    {completedTasks.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTaskStatusTab('expired')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    taskStatusTab === 'expired' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor:
                      taskStatusTab === 'expired'
                        ? (theme.isDark ? '#2D2540' : '#FFFFFF')
                        : 'transparent',
                    color:
                      taskStatusTab === 'expired'
                        ? (theme.isDark ? '#FFFFFF' : '#302747')
                        : theme.textSecondary,
                  }}
                >
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>Expired tasks</span>
                  <span
                    className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: theme.isDark ? 'rgba(244, 63, 94, 0.25)' : '#FFE4E6',
                      color: theme.isDark ? '#FDA4AF' : '#9F1239',
                    }}
                  >
                    {expiredTasks.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Tab 1: Completed Tasks (stores tasks completed by user) */}
            {taskStatusTab === 'completed' && (
              <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                {completedTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs space-y-1" style={{ color: theme.textMuted }}>
                    <p className="font-semibold">No completed tasks yet</p>
                    <p className="text-[11px]">Mark tasks as finished in your task queue to archive them here.</p>
                  </div>
                ) : (
                  completedTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onToggleTask(task.id)}
                      className="p-3 rounded-2xl flex items-center justify-between border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 group"
                      style={{
                        backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(48, 39, 71, 0.02)',
                        borderColor: theme.surfaceBorder,
                      }}
                      title="Click to toggle status"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <p
                            className="text-xs font-bold line-through truncate opacity-75"
                            style={{ color: theme.textPrimary }}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: theme.textMuted }}>
                            <span>{task.subject}</span>
                            <span>•</span>
                            <span>{task.durationMinutes}m</span>
                          </div>
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0"
                        style={{
                          backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.2)' : '#E6F4EA',
                          color: theme.isDark ? '#6EE7B7' : '#137333',
                        }}
                      >
                        Completed
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Expired Tasks (stores tasks not completed by user) */}
            {taskStatusTab === 'expired' && (
              <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                {expiredTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs space-y-1" style={{ color: theme.textMuted }}>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">All caught up! 🎉</p>
                    <p className="text-[11px]">No expired or uncompleted tasks remaining.</p>
                  </div>
                ) : (
                  expiredTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onToggleTask(task.id)}
                      className="p-3 rounded-2xl flex items-center justify-between border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 group"
                      style={{
                        backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(48, 39, 71, 0.02)',
                        borderColor: theme.surfaceBorder,
                      }}
                      title="Click to mark complete"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Circle
                          className="w-4 h-4 shrink-0 transition-colors group-hover:text-emerald-500"
                          style={{ color: theme.textMuted }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color: theme.textPrimary }}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: theme.textMuted }}>
                            <span>{task.subject}</span>
                            <span>•</span>
                            <span>Due: {task.dueDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className="text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded border"
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
                          {task.priority}
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: theme.isDark ? 'rgba(244, 63, 94, 0.2)' : '#FFE4E6',
                            color: theme.isDark ? '#FDA4AF' : '#9F1239',
                          }}
                        >
                          Expired
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
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
              <form onSubmit={handleCreateTask} className="p-4 sm:p-5 rounded-2xl mb-4 space-y-4 bg-black/5 dark:bg-white/5 border" style={{ borderColor: theme.surfaceBorder }}>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                      Target Due Date (Syncs with Calendar)
                    </label>
                    <input
                      type="date"
                      required
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs border"
                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                      Target Time
                    </label>
                    <input
                      type="text"
                      value={newDueTime}
                      onChange={(e) => setNewDueTime(e.target.value)}
                      placeholder="e.g. 4:00 PM"
                      className="w-full px-3 py-2 rounded-xl text-xs border"
                      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}
                    />
                  </div>
                </div>

                {/* Priority Option: 4 options "low, medium, high, max" */}
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textPrimary }}>
                    Priority
                  </label>

                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {(['low', 'medium', 'high', 'max'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPriority(p)}
                        className={`py-2 px-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          newPriority === p
                            ? 'ring-2 ring-[#8E74DB] shadow-xs'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor:
                            newPriority === p
                              ? (theme.isDark ? 'rgba(220, 209, 250, 0.2)' : '#DCD1FA')
                              : (theme.isDark ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF'),
                          borderColor: newPriority === p ? '#8E74DB' : theme.surfaceBorder,
                          color: newPriority === p ? (theme.isDark ? '#FFF' : '#302747') : theme.textPrimary,
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high' | 'max')}
                    className="w-full px-3 py-2 rounded-xl text-xs border"
                    style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }}
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                    <option value="max">max</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: theme.surfaceBorder }}>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                    style={{ color: theme.textMuted }}
                  >
                    Close Form
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:opacity-95 active:scale-95 transition-all"
                    style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
                  >
                    Save & Schedule Task
                  </button>
                </div>
              </form>
            )}

            {/* Tasks List */}
            <div className="space-y-2.5">
              {tasks.map((task) => {
                const priorityBadge =
                  task.priority === 'max'
                    ? { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444', label: 'Max (5d)', emoji: '🔴' }
                    : task.priority === 'high'
                    ? { bg: '#FFEDD5', text: '#9A3412', border: '#F97316', label: 'High (4d)', emoji: '🟠' }
                    : task.priority === 'medium'
                    ? { bg: '#FCE7F3', text: '#9D174D', border: '#EC4899', label: 'Med (3d)', emoji: '🌸' }
                    : { bg: '#FEF9C3', text: '#854D0E', border: '#EAB308', label: 'Low (2d)', emoji: '🟡' };

                return (
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
                        <div className="flex items-center gap-2">
                          <span className={`text-xs sm:text-sm font-bold ${task.completed ? 'line-through opacity-60' : ''}`} style={{ color: theme.textPrimary }}>
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] mt-0.5" style={{ color: theme.textMuted }}>
                          <span className="font-semibold">{task.subject}</span>
                          <span>•</span>
                          <span>{task.durationMinutes} minutes</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: priorityBadge.bg,
                          color: priorityBadge.text,
                          borderColor: priorityBadge.border,
                        }}
                      >
                        {priorityBadge.emoji} {priorityBadge.label}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10" style={{ color: theme.textPrimary }}>
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
