import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Clock,
  CheckCircle2,
  ListTodo,
  CalendarDays,
} from 'lucide-react';
import type { StudyTask } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';

interface WorkCalendarProps {
  theme: ThemeColors;
  tasks: StudyTask[];
}

interface CalendarScheduledTask {
  no: number;
  id: string;
  title: string;
  time: string;
  subject: string;
  completed: boolean;
  dateStr: string; // YYYY-MM-DD
}

export const WorkCalendar: React.FC<WorkCalendarProps> = ({ theme, tasks }) => {
  const [isEnlarged, setIsEnlarged] = useState(false);

  // Default to October 2026 (or current date in 2026)
  const today = useMemo(() => new Date(2026, 9, 16), []); // Oct 16, 2026
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-16');

  // Format date helper YYYY-MM-DD
  const formatDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Convert tasks into structured scheduled items associated with calendar dates
  const scheduledTasksMap = useMemo(() => {
    const map: Record<string, CalendarScheduledTask[]> = {};

    // Initial base tasks mapping for rich demo experience
    const initialCalendarTasks: CalendarScheduledTask[] = [
      {
        no: 1,
        id: 'cal-task-1',
        title: 'Review Data Structures Binary Tree traversals',
        time: '4:00 PM',
        subject: 'Computer Science',
        completed: true,
        dateStr: '2026-10-16',
      },
      {
        no: 2,
        id: 'cal-task-2',
        title: 'Work through Calculus integration by parts worksheet',
        time: '7:30 PM',
        subject: 'Mathematics',
        completed: false,
        dateStr: '2026-10-16',
      },
      {
        no: 1,
        id: 'cal-task-3',
        title: 'Memorize Cell Biology mitochondrial respiration stages',
        time: '10:00 AM',
        subject: 'Biology',
        completed: false,
        dateStr: '2026-10-17',
      },
      {
        no: 2,
        id: 'cal-task-4',
        title: 'Draft Financial Accounting ratio analysis summary',
        time: '3:00 PM',
        subject: 'Business',
        completed: false,
        dateStr: '2026-10-17',
      },
      {
        no: 1,
        id: 'cal-task-5',
        title: 'Discrete Probability & Combinatorics Practice Exam',
        time: '2:00 PM',
        subject: 'Mathematics',
        completed: false,
        dateStr: '2026-10-19',
      },
      {
        no: 2,
        id: 'cal-task-6',
        title: 'Object-Oriented Design Pattern Architecture Review',
        time: '5:30 PM',
        subject: 'Computer Science',
        completed: false,
        dateStr: '2026-10-19',
      },
      {
        no: 1,
        id: 'cal-task-7',
        title: 'Cardiovascular Circulation System Slides Recap',
        time: '11:00 AM',
        subject: 'Biology',
        completed: false,
        dateStr: '2026-10-22',
      },
      {
        no: 1,
        id: 'cal-task-8',
        title: 'Midterm Formula Sheet Revision & Self-Quiz',
        time: '4:30 PM',
        subject: 'Mathematics',
        completed: false,
        dateStr: '2026-10-26',
      },
      {
        no: 2,
        id: 'cal-task-9',
        title: 'Operating Systems Concurrency & Threads Drill',
        time: '7:00 PM',
        subject: 'Computer Science',
        completed: false,
        dateStr: '2026-10-26',
      },
    ];

    // Populate initial calendar tasks
    initialCalendarTasks.forEach((t) => {
      if (!map[t.dateStr]) map[t.dateStr] = [];
      map[t.dateStr].push(t);
    });

    // Also integrate any dynamic tasks passed from props
    tasks.forEach((t) => {
      let targetDateStr = '2026-10-16';
      let extractedTime = '4:00 PM';

      if (t.dueDate.toLowerCase().includes('today')) {
        targetDateStr = '2026-10-16';
        const match = t.dueDate.match(/\d+:\d+\s*[APMapm]+/);
        if (match) extractedTime = match[0];
      } else if (t.dueDate.toLowerCase().includes('tomorrow')) {
        targetDateStr = '2026-10-17';
        const match = t.dueDate.match(/\d+:\d+\s*[APMapm]+/);
        if (match) extractedTime = match[0];
      } else if (t.dueDate.includes('-')) {
        targetDateStr = t.dueDate.split('T')[0];
      }

      // Check if already in map
      if (!map[targetDateStr]) {
        map[targetDateStr] = [];
      }
      const existing = map[targetDateStr].some((item) => item.title === t.title);
      if (!existing) {
        map[targetDateStr].push({
          no: map[targetDateStr].length + 1,
          id: t.id,
          title: t.title,
          time: extractedTime,
          subject: t.subject,
          completed: t.completed,
          dateStr: targetDateStr,
        });
      }
    });

    // Ensure consecutive No. numbering
    Object.keys(map).forEach((dateKey) => {
      map[dateKey] = map[dateKey].map((item, index) => ({
        ...item,
        no: index + 1,
      }));
    });

    return map;
  }, [tasks]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long' });

  // First day of current month (0-6)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (dateStr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(dateStr);
  };

  // Assigned tasks for the currently selected date
  const selectedDateTasks = scheduledTasksMap[selectedDate] || [];

  // Formatted human-readable label for selected date
  const selectedDateLabel = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
    return selectedDate;
  }, [selectedDate]);

  // Days of week short headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Minimalist strip dates (focused on current active week around October 16)
  const minimalistDays = useMemo(() => {
    const days = [];
    for (let dayNum = 14; dayNum <= 20; dayNum++) {
      const dStr = `2026-10-${String(dayNum).padStart(2, '0')}`;
      const d = new Date(2026, 9, dayNum);
      const dayName = d.toLocaleDateString('default', { weekday: 'short' });
      const taskCount = scheduledTasksMap[dStr]?.length || 0;
      days.push({
        dayNum,
        dayName,
        dateStr: dStr,
        taskCount,
        isToday: dStr === '2026-10-16',
      });
    }
    return days;
  }, [scheduledTasksMap]);

  return (
    <div
      role="region"
      aria-label="Work Calendar block"
      className="mb-8 rounded-3xl transition-all duration-300 relative overflow-hidden shadow-lg select-none"
      style={{
        // Glassmorphism styling when enlarged or minimalist
        backgroundColor: theme.isDark
          ? isEnlarged
            ? 'rgba(32, 26, 46, 0.85)'
            : 'rgba(32, 26, 46, 0.65)'
          : isEnlarged
          ? 'rgba(255, 255, 255, 0.88)'
          : 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${
          theme.isDark ? 'rgba(220, 209, 250, 0.22)' : 'rgba(48, 39, 71, 0.12)'
        }`,
        boxShadow: isEnlarged
          ? theme.isDark
            ? '0 24px 50px -10px rgba(0, 0, 0, 0.7), 0 0 24px rgba(220, 209, 250, 0.12)'
            : '0 24px 50px -10px rgba(48, 39, 71, 0.18), 0 0 24px rgba(188, 233, 213, 0.25)'
          : theme.isDark
          ? '0 10px 30px -5px rgba(0, 0, 0, 0.5)'
          : '0 10px 30px -5px rgba(48, 39, 71, 0.08)',
      }}
    >
      {/* Decorative ambient glass glow */}
      <div
        className="absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: '#DCD1FA' }}
      />
      <div
        className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: '#BCE9D5' }}
      />

      {/* Calendar Header Bar */}
      <div
        className="p-5 sm:p-6 flex items-center justify-between border-b cursor-pointer relative z-10"
        style={{ borderColor: theme.surfaceBorder }}
        onClick={() => setIsEnlarged(!isEnlarged)}
        title={isEnlarged ? 'Click to minimize Work Calendar' : 'Click to enlarge Work Calendar'}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs"
            style={{
              backgroundColor: '#DCD1FA',
              color: '#302747',
            }}
          >
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight" style={{ color: theme.textPrimary }}>
                Work Calendar
              </h2>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(220, 209, 250, 0.15)' : 'rgba(48, 39, 71, 0.06)',
                  color: '#8E74DB',
                }}
              >
                {isEnlarged ? 'Full View · Glassmorphism' : 'Minimalist View'}
              </span>
            </div>
            <p className="text-xs font-medium mt-0.5" style={{ color: theme.textSecondary }}>
              {isEnlarged
                ? 'Full interactive monthly scheduler. Click any date to view scheduled assignments.'
                : 'Scheduled task count per date. Click card to enlarge into full glassmorphism calendar.'}
            </p>
          </div>
        </div>

        {/* Enlarge / Minimize Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsEnlarged(!isEnlarged);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer shadow-xs hover:scale-105 active:scale-95"
          style={{
            backgroundColor: isEnlarged ? '#302747' : '#DCD1FA',
            color: isEnlarged ? '#FFF9F0' : '#302747',
          }}
          aria-label={isEnlarged ? 'Minimize Work Calendar' : 'Enlarge Work Calendar'}
        >
          {isEnlarged ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Minimize</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Enlarge</span>
            </>
          )}
        </button>
      </div>

      {/* Calendar Body: Minimalist vs Enlarged Full Block */}
      <div className="p-5 sm:p-6 relative z-10">
        {!isEnlarged ? (
          /* ================= MINIMALIST CALENDAR VIEW ================= */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold" style={{ color: theme.textSecondary }}>
              <span>October 2026 (Focus Week)</span>
              <span className="text-[11px] font-medium" style={{ color: '#8E74DB' }}>
                Tip: Click any day to inspect tasks
              </span>
            </div>

            {/* Minimalist Date Strip showing scheduled task number on specific dates */}
            <div className="grid grid-cols-7 gap-2">
              {minimalistDays.map((item) => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={(e) => handleDateClick(item.dateStr, e)}
                    className={`flex flex-col items-center justify-between p-2.5 rounded-2xl transition-all duration-200 cursor-pointer relative text-center border ${
                      isSelected
                        ? 'shadow-md scale-105'
                        : 'hover:scale-[1.02] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={{
                      backgroundColor: isSelected
                        ? '#302747'
                        : item.isToday
                        ? theme.isDark
                          ? 'rgba(220, 209, 250, 0.12)'
                          : '#F1ECFD'
                        : theme.isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(255, 255, 255, 0.7)',
                      borderColor: isSelected
                        ? '#DCD1FA'
                        : item.isToday
                        ? '#8E74DB'
                        : theme.surfaceBorder,
                      color: isSelected ? '#FFF9F0' : theme.textPrimary,
                    }}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isSelected ? 'text-[#DCD1FA]' : 'text-gray-400'
                      }`}
                    >
                      {item.dayName}
                    </span>
                    <span className="text-base sm:text-lg font-black my-0.5">
                      {item.dayNum}
                    </span>

                    {/* Display scheduled task number on specific dates */}
                    {item.taskCount > 0 ? (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs"
                        style={{
                          backgroundColor: isSelected ? '#DCD1FA' : '#BCE9D5',
                          color: '#164E3A',
                        }}
                      >
                        {item.taskCount} {item.taskCount === 1 ? 'task' : 'tasks'}
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium opacity-40">0 tasks</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ================= ENLARGED FULL CALENDAR (GLASSMORPHISM BLOCK) ================= */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Month Navigation Row */}
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: theme.surfaceBorder }}>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-black" style={{ color: theme.textPrimary }}>
                  {monthName} {year}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl transition-colors cursor-pointer hover:bg-black/10 dark:hover:bg-white/10"
                  style={{ color: theme.textPrimary }}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl transition-colors cursor-pointer hover:bg-black/10 dark:hover:bg-white/10"
                  style={{ color: theme.textPrimary }}
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold" style={{ color: theme.textMuted }}>
              {weekDays.map((wd) => (
                <div key={wd} className="py-1 uppercase tracking-wider text-[11px]">
                  {wd}
                </div>
              ))}
            </div>

            {/* 7x5 Month Grid with scheduled task number on specific dates */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Padding empty cells for first week */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="h-16 sm:h-20 rounded-2xl opacity-20 border border-dashed border-gray-300 dark:border-gray-700 pointer-events-none"
                />
              ))}

              {/* Day Cells */}
              {Array.from({ length: totalDays }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayTasks = scheduledTasksMap[dateKey] || [];
                const taskCount = dayTasks.length;
                const isSelected = selectedDate === dateKey;
                const isToday = dateKey === '2026-10-16';

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={(e) => handleDateClick(dateKey, e)}
                    className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-2xl flex flex-col justify-between text-left transition-all duration-200 cursor-pointer border relative ${
                      isSelected
                        ? 'ring-2 ring-[#8E74DB] shadow-md scale-[1.02]'
                        : 'hover:scale-[1.02] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    style={{
                      backgroundColor: isSelected
                        ? theme.isDark
                          ? '#382D54'
                          : '#ECE7F9'
                        : isToday
                        ? theme.isDark
                          ? 'rgba(220, 209, 250, 0.12)'
                          : '#F6F3FE'
                        : theme.isDark
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(255, 255, 255, 0.65)',
                      borderColor: isSelected
                        ? '#8E74DB'
                        : isToday
                        ? '#DCD1FA'
                        : theme.surfaceBorder,
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs sm:text-sm font-black ${
                          isSelected
                            ? 'text-[#8E74DB]'
                            : isToday
                            ? 'text-purple-600 dark:text-purple-300'
                            : ''
                        }`}
                        style={{ color: !isSelected && !isToday ? theme.textPrimary : undefined }}
                      >
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Today" />
                      )}
                    </div>

                    {/* Display scheduled task number on specific dates */}
                    {taskCount > 0 ? (
                      <div className="w-full">
                        <span
                          className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md block text-center truncate shadow-2xs"
                          style={{
                            backgroundColor: '#BCE9D5',
                            color: '#164E3A',
                          }}
                        >
                          {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-gray-400 opacity-30 text-right w-full block">
                        -
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= SPECIFIC DATE TASKS DISPLAY ================= */}
        {/* Shows tasks assigned for that day strictly formatted as: "No., Task title, time" */}
        <div
          className="mt-6 pt-5 border-t"
          style={{ borderColor: theme.surfaceBorder }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
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
              className="p-6 rounded-2xl text-center border border-dashed"
              style={{
                borderColor: theme.surfaceBorder,
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(48, 39, 71, 0.02)',
              }}
            >
              <p className="text-xs font-medium" style={{ color: theme.textMuted }}>
                No tasks assigned for this date. Click another date (such as <strong>Oct 16</strong>, <strong>Oct 17</strong>, <strong>Oct 19</strong>, or <strong>Oct 26</strong>) to inspect assigned tasks!
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
                    <th scope="col" className="py-2.5 px-3 text-right sm:text-left w-28">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: theme.surfaceBorder }}>
                  {selectedDateTasks.map((t) => (
                    <tr
                      key={t.id}
                      className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      {/* 1. No. */}
                      <td className="py-3 px-3 font-extrabold" style={{ color: '#8E74DB' }}>
                        #{t.no}
                      </td>

                      {/* 2. Task title */}
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

                      {/* 3. Time */}
                      <td className="py-3 px-3 font-bold whitespace-nowrap text-right sm:text-left" style={{ color: theme.textSecondary }}>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>{t.time}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
