import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  ListTodo,
} from 'lucide-react';
import type { StudyTask } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';

export type TaskPriority = 'low' | 'medium' | 'high' | 'max';

interface WorkCalendarProps {
  theme: ThemeColors;
  tasks: StudyTask[];
}

export interface CalendarScheduledTask {
  no: number;
  id: string;
  title: string;
  time: string;
  subject: string;
  completed: boolean;
  dateStr: string; // YYYY-MM-DD
  priority: TaskPriority;
}

// Priority color configuration:
// - Low: preceding 2 days indicated by yellow
// - Medium: preceding 3 days indicated by pink
// - High: preceding 4 days indicated by orange
// - Max: preceding 5 days indicated by red
export const PRIORITY_CONFIG: Record<
  TaskPriority,
  {
    name: string;
    precedingDays: number;
    colorLabel: string;
    hex: string;
    border: string;
    bgLight: string;
    bgDark: string;
    textLight: string;
    textDark: string;
    rank: number;
  }
> = {
  low: {
    name: 'Low',
    precedingDays: 2,
    colorLabel: 'Yellow',
    hex: '#EAB308',
    border: '#EAB308',
    bgLight: '#FEF9C3', // yellow-100
    bgDark: 'rgba(234, 179, 8, 0.28)',
    textLight: '#854D0E',
    textDark: '#FEF08A',
    rank: 1,
  },
  medium: {
    name: 'Medium',
    precedingDays: 3,
    colorLabel: 'Pink',
    hex: '#EC4899',
    border: '#EC4899',
    bgLight: '#FCE7F3', // pink-100
    bgDark: 'rgba(236, 72, 153, 0.28)',
    textLight: '#9D174D',
    textDark: '#FCE7F3',
    rank: 2,
  },
  high: {
    name: 'High',
    precedingDays: 4,
    colorLabel: 'Orange',
    hex: '#F97316',
    border: '#F97316',
    bgLight: '#FFEDD5', // orange-100
    bgDark: 'rgba(249, 115, 22, 0.28)',
    textLight: '#9A3412',
    textDark: '#FED7AA',
    rank: 3,
  },
  max: {
    name: 'Max',
    precedingDays: 5,
    colorLabel: 'Red',
    hex: '#EF4444',
    border: '#EF4444',
    bgLight: '#FEE2E2', // red-100
    bgDark: 'rgba(239, 68, 68, 0.32)',
    textLight: '#991B1B',
    textDark: '#FECACA',
    rank: 4,
  },
};

export const WorkCalendar: React.FC<WorkCalendarProps> = ({ theme, tasks }) => {
  const today = useMemo(() => new Date(), []);
  const todayDateStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);

  // Convert tasks into structured scheduled items associated with calendar dates
  const scheduledTasksMap = useMemo(() => {
    const map: Record<string, CalendarScheduledTask[]> = {};

    tasks.forEach((t) => {
      let targetDateStr = todayDateStr;
      let extractedTime = '12:00 PM';

      if (t.dueDate.toLowerCase().includes('today')) {
        targetDateStr = todayDateStr;
        const match = t.dueDate.match(/\d+:\d+\s*[APMapm]+/);
        if (match) extractedTime = match[0];
      } else if (t.dueDate.toLowerCase().includes('tomorrow')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        targetDateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
        const match = t.dueDate.match(/\d+:\d+\s*[APMapm]+/);
        if (match) extractedTime = match[0];
      } else if (t.dueDate.includes('-')) {
        targetDateStr = t.dueDate.split(',')[0].split('T')[0].trim();
        const match = t.dueDate.match(/\d+:\d+\s*[APMapm]+/);
        if (match) extractedTime = match[0];
      }

      if (!map[targetDateStr]) {
        map[targetDateStr] = [];
      }
      const existing = map[targetDateStr].some((item) => item.id === t.id || item.title === t.title);
      if (!existing) {
        map[targetDateStr].push({
          no: map[targetDateStr].length + 1,
          id: t.id,
          title: t.title,
          time: extractedTime,
          subject: t.subject,
          completed: t.completed,
          dateStr: targetDateStr,
          priority: t.priority || 'medium',
        });
      }
    });

    Object.keys(map).forEach((dateKey) => {
      map[dateKey] = map[dateKey].map((item, index) => ({
        ...item,
        no: index + 1,
      }));
    });

    return map;
  }, [tasks]);

  // Dynamically compute preceding colored blocks based upon selection of date and tasks on that specific date:
  // - Low priority task on selected date: preceding 2 days indicated by yellow
  // - Medium priority task on selected date: preceding 3 days indicated by pink
  // - High priority task on selected date: preceding 4 days indicated by orange
  // - Max priority task on selected date: preceding 5 days indicated by red
  const selectedDatePrecedingMap = useMemo(() => {
    const map: Record<string, { priority: TaskPriority; daysBefore: number; colorLabel: string }> = {};
    const tasksOnSelected = scheduledTasksMap[selectedDate] || [];

    if (tasksOnSelected.length === 0) {
      return map;
    }

    const parts = selectedDate.split('-');
    if (parts.length !== 3) return map;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);

    // Find highest priority among tasks on the selected date
    let highestPriority: TaskPriority = 'low';
    let highestRank = 0;

    tasksOnSelected.forEach((t) => {
      const cfg = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.medium;
      if (cfg.rank > highestRank) {
        highestRank = cfg.rank;
        highestPriority = t.priority;
      }
    });

    const activeConfig = PRIORITY_CONFIG[highestPriority];
    const precedingCount = activeConfig.precedingDays;

    for (let i = 1; i <= precedingCount; i++) {
      const prevDate = new Date(y, m, d - i);
      const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
      map[prevKey] = {
        priority: highestPriority,
        daysBefore: i,
        colorLabel: activeConfig.colorLabel,
      };
    }

    return map;
  }, [selectedDate, scheduledTasksMap]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const selectedDateTasks = scheduledTasksMap[selectedDate] || [];

  const selectedDateLabel = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
    return selectedDate;
  }, [selectedDate]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div
      role="region"
      aria-label="Work Calendar block"
      className="mb-8 rounded-3xl transition-all duration-300 relative overflow-hidden shadow-sm select-none"
      style={{
        backgroundColor: theme.isDark ? 'rgba(32, 26, 46, 0.75)' : 'rgba(255, 255, 255, 0.9)',
        border: `1px solid ${theme.surfaceBorder}`,
      }}
    >
      {/* Calendar Header with Clean Month Navigation */}
      <div
        className="p-4 sm:p-5 flex items-center justify-between border-b relative z-10"
        style={{ borderColor: theme.surfaceBorder }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs"
            style={{
              backgroundColor: '#DCD1FA',
              color: '#302747',
            }}
          >
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight" style={{ color: theme.textPrimary }}>
            {monthName} {year}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl transition-colors cursor-pointer hover:bg-black/10 dark:hover:bg-white/10"
            style={{ color: theme.textPrimary }}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl transition-colors cursor-pointer hover:bg-black/10 dark:hover:bg-white/10"
            style={{ color: theme.textPrimary }}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Minimalist Full Month Lined Calendar */}
      <div className="p-4 sm:p-6 relative z-10">
        {/* Lined Calendar Grid Container */}
        <div
          className="rounded-2xl overflow-hidden border"
          style={{ borderColor: theme.surfaceBorder }}
        >
          {/* Days of week on top row */}
          <div
            className="grid grid-cols-7 border-b text-center text-xs font-bold"
            style={{
              backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(48, 39, 71, 0.03)',
              borderColor: theme.surfaceBorder,
              color: theme.textSecondary,
            }}
          >
            {weekDays.map((wd, i) => (
              <div
                key={wd}
                className={`py-2 text-[11px] uppercase tracking-wider font-extrabold ${
                  i < 6 ? 'border-r' : ''
                }`}
                style={{ borderColor: theme.surfaceBorder }}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Dates in small blocks with lined borders */}
          <div className="grid grid-cols-7">
            {/* Empty offset padding cells */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className={`h-14 sm:h-16 border-b ${(idx + 1) % 7 !== 0 ? 'border-r' : ''} bg-black/[0.01] dark:bg-white/[0.01] pointer-events-none`}
                style={{ borderColor: theme.surfaceBorder }}
              />
            ))}

            {/* Date cells in small lined blocks */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const dayNum = idx + 1;
              const colIndex = (firstDayIndex + idx) % 7;
              const isRightEdge = colIndex === 6;
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTasks = scheduledTasksMap[dateKey] || [];
              const taskCount = dayTasks.length;
              const isSelected = selectedDate === dateKey;
              const isToday = dateKey === todayDateStr;

              // Colour of other blocks gets decided upon selection of date and tasks on that specific date
              const dynamicPreceding = selectedDatePrecedingMap[dateKey];
              const priorityCfg = dynamicPreceding ? PRIORITY_CONFIG[dynamicPreceding.priority] : null;

              let cellBg = theme.isDark ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF';

              if (isSelected) {
                cellBg = theme.isDark ? '#3D315B' : '#ECE7F9';
              } else if (priorityCfg) {
                // Decided dynamically based upon tasks on selected date:
                // Yellow for low, Pink for medium, Orange for high, Red for max
                cellBg = theme.isDark ? priorityCfg.bgDark : priorityCfg.bgLight;
              } else if (isToday) {
                cellBg = theme.isDark ? 'rgba(220, 209, 250, 0.08)' : 'rgba(220, 209, 250, 0.2)';
              }

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => handleDateClick(dateKey)}
                  className={`h-14 sm:h-16 p-2 flex flex-col justify-between text-left transition-colors cursor-pointer border-b ${
                    !isRightEdge ? 'border-r' : ''
                  } relative`}
                  style={{
                    backgroundColor: cellBg,
                    borderColor: priorityCfg && !isSelected ? priorityCfg.border : theme.surfaceBorder,
                  }}
                >
                  {/* Top row: Date Number */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm ${
                        isSelected
                          ? 'font-black text-[#8E74DB]'
                          : isToday
                          ? 'font-black text-purple-600 dark:text-purple-300'
                          : 'font-bold'
                      }`}
                      style={{ color: !isSelected && !isToday ? theme.textPrimary : undefined }}
                    >
                      {dayNum}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8E74DB]" />
                    )}
                  </div>

                  {/* Bottom row: Value of assigned tasks on that date */}
                  <div className="w-full flex items-center justify-between">
                    <span
                      className={`text-[9.5px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        taskCount > 0
                          ? 'bg-[#BCE9D5] text-[#164E3A]'
                          : 'text-gray-400 opacity-30'
                      }`}
                    >
                      {taskCount}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Assigned Tasks for Selected Date Table */}
        <div
          className="mt-6 pt-5 border-t"
          style={{ borderColor: theme.surfaceBorder }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm sm:text-base" style={{ color: theme.textPrimary }}>
                Assigned Tasks for <span style={{ color: '#8E74DB' }}>{selectedDateLabel}</span>
              </h3>
            </div>
            <div className="text-xs font-semibold" style={{ color: theme.textMuted }}>
              {selectedDateTasks.length}{' '}
              {selectedDateTasks.length === 1 ? 'scheduled task' : 'scheduled tasks'}
            </div>
          </div>

          {selectedDateTasks.length === 0 ? (
            <div
              className="p-5 rounded-2xl text-center border border-dashed"
              style={{
                borderColor: theme.surfaceBorder,
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(48, 39, 71, 0.02)',
              }}
            >
              <p className="text-xs font-medium" style={{ color: theme.textMuted }}>
                No tasks assigned for this date.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr
                    className="border-b text-[11px] font-bold uppercase tracking-wider"
                    style={{
                      borderColor: theme.surfaceBorder,
                      color: theme.textMuted,
                    }}
                  >
                    <th scope="col" className="py-2.5 px-3 w-16">
                      No.
                    </th>
                    <th scope="col" className="py-2.5 px-3">
                      Task title
                    </th>
                    <th scope="col" className="py-2.5 px-3 w-28">
                      Priority
                    </th>
                    <th scope="col" className="py-2.5 px-3 text-right sm:text-left w-28">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: theme.surfaceBorder }}>
                  {selectedDateTasks.map((t) => {
                    const cfg = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.medium;
                    return (
                      <tr
                        key={t.id}
                        className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <td className="py-3 px-3 font-extrabold" style={{ color: '#8E74DB' }}>
                          #{t.no}
                        </td>
                        <td className="py-3 px-3 font-semibold" style={{ color: theme.textPrimary }}>
                          <div className="flex items-center gap-2">
                            {t.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                            )}
                            <span className={t.completed ? 'line-through opacity-60' : ''}>
                              {t.title}
                            </span>
                            <span
                              className="hidden sm:inline-block text-[9.5px] font-bold px-1.5 py-0.2 rounded"
                              style={{
                                backgroundColor: theme.isDark ? 'rgba(220, 209, 250, 0.15)' : 'rgba(48, 39, 71, 0.06)',
                                color: theme.textMuted,
                              }}
                            >
                              {t.subject}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-md border"
                            style={{
                              backgroundColor: cfg.bgLight,
                              borderColor: cfg.border,
                              color: cfg.textLight,
                            }}
                          >
                            <span>{cfg.name}</span>
                          </span>
                        </td>
                        <td
                          className="py-3 px-3 font-bold whitespace-nowrap text-right sm:text-left"
                          style={{ color: theme.textSecondary }}
                        >
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            <span>{t.time}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
