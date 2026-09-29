import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Clock,
  Calendar as CalendarIcon,
  Flame,
} from 'lucide-react';
import type { TaskItem } from '../types';
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG, MEETING_PLATFORMS } from '../types';

interface TaskCalendarViewProps {
  tasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
  onAddTaskToDate?: (dateString: string) => void;
}

export function TaskCalendarView({
  tasks,
  onTaskClick,
  onAddTaskToDate,
}: TaskCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar cells computation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday as start of week: 0=Mon, 6=Sun
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = lastDayOfMonth.getDate();

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const days: Array<{
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const dateObj = new Date(year, month - 1, d);
      const ds = dateObj.toISOString().split('T')[0];
      days.push({
        dateString: ds,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateString: ds,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: ds === todayStr,
      });
    }

    // Next month filler days (fill up to 35 or 42)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const dateObj = new Date(year, month + 1, d);
      const ds = dateObj.toISOString().split('T')[0];
      days.push({
        dateString: ds,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [year, month]);

  // Group tasks by date (dueDate or meeting date)
  const tasksByDate = useMemo(() => {
    const map: Record<string, TaskItem[]> = {};
    tasks.forEach((t) => {
      const targetDate = t.dueDate || t.startDate;
      if (targetDate) {
        if (!map[targetDate]) map[targetDate] = [];
        map[targetDate].push(t);
      }

      // If meeting has specific date
      if (t.meeting?.enabled && t.meeting?.meetingTime) {
        const mDate = t.meeting.meetingTime.split('T')[0];
        if (mDate && mDate !== targetDate) {
          if (!map[mDate]) map[mDate] = [];
          if (!map[mDate].some((item) => item.id === t.id)) {
            map[mDate].push(t);
          }
        }
      }
    });
    return map;
  }, [tasks]);

  const monthNames = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

  const weekDayHeaders = [
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
    'Chủ Nhật',
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
      {/* Calendar Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#003B95] text-white">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {monthNames[month]} Năm {year}
            </h3>
            <p className="text-[11px] text-slate-500">
              Hiển thị lịch trình công việc và các buổi họp trao đổi Zoom, Meet, UniWork
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            Hôm nay
          </button>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
        {weekDayHeaders.map((head, i) => (
          <div
            key={head}
            className={`py-2 text-center text-xs font-bold ${
              i >= 5 ? 'text-rose-600 dark:text-rose-400 bg-slate-100 dark:bg-slate-900/80' : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900'
            }`}
          >
            {head}
          </div>
        ))}
      </div>

      {/* Calendar Grid Days */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((d, index) => {
          const dayTasks = tasksByDate[d.dateString] || [];
          return (
            <div
              key={`${d.dateString}-${index}`}
              className={`min-h-[110px] rounded-xl border p-2 flex flex-col justify-between transition-colors ${
                d.isToday
                  ? 'border-[#003B95] bg-blue-50/20 dark:border-blue-700 dark:bg-blue-950/20 shadow-xs'
                  : d.isCurrentMonth
                  ? 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                  : 'border-slate-100 bg-slate-50/60 opacity-50 dark:border-slate-800/40 dark:bg-slate-900/40'
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center ${
                    d.isToday
                      ? 'bg-[#003B95] text-white shadow-xs'
                      : d.isCurrentMonth
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400'
                  }`}
                >
                  {d.dayNumber}
                </span>

                {onAddTaskToDate && d.isCurrentMonth && (
                  <button
                    type="button"
                    onClick={() => onAddTaskToDate(d.dateString)}
                    className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-[#003B95] dark:hover:bg-slate-800 transition"
                    title={`Thêm việc ngày ${d.dateString}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Tasks list inside day cell */}
              <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px]">
                {dayTasks.map((t) => {
                  const statusCfg = TASK_STATUS_CONFIG[t.status];
                  const hasMeeting = t.meeting?.enabled && t.meeting?.link;
                  return (
                    <div
                      key={t.id}
                      onClick={() => onTaskClick(t)}
                      className={`group p-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer transition-all hover:scale-[1.02] shadow-2xs ${
                        statusCfg?.bg || 'bg-slate-100'
                      } ${statusCfg?.border || 'border-slate-200'} ${
                        statusCfg?.text || 'text-slate-700'
                      }`}
                      title={`${t.code}: ${t.title}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate flex-1">{t.title}</span>
                        {hasMeeting && (
                          <span
                            className="p-0.5 rounded bg-blue-600 text-white shrink-0"
                            title={`Cuộc họp: ${MEETING_PLATFORMS[t.meeting!.platform]?.label}`}
                          >
                            <Video className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      {t.priority === 'CRITICAL' && (
                        <div className="flex items-center gap-0.5 text-[9.5px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">
                          <Flame className="w-2.5 h-2.5" /> Khẩn cấp
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
