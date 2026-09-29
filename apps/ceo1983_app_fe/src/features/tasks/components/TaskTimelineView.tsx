import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Clock,
  Flame,
  Calendar,
  Building,
} from 'lucide-react';
import type { TaskItem } from '../types';
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG, MEETING_PLATFORMS } from '../types';

interface TaskTimelineViewProps {
  tasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
}

export function TaskTimelineView({ tasks, onTaskClick }: TaskTimelineViewProps) {
  // Base date for timeline window
  const [baseDate, setBaseDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 3); // Start 3 days before today
    return d;
  });

  const DAYS_WINDOW = 14; // Show 14-day horizontal window

  // Generate date columns
  const timelineDates = useMemo(() => {
    const dates: Array<{ dateStr: string; label: string; dayOfWeek: string; isToday: boolean }> = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < DAYS_WINDOW; i++) {
      const cur = new Date(baseDate);
      cur.setDate(cur.getDate() + i);
      const ds = cur.toISOString().split('T')[0];
      const dayNum = cur.getDate();
      const monthNum = cur.getMonth() + 1;
      const daysOfWeekStr = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

      dates.push({
        dateStr: ds,
        label: `${dayNum}/${monthNum}`,
        dayOfWeek: daysOfWeekStr[cur.getDay()],
        isToday: ds === todayStr,
      });
    }
    return dates;
  }, [baseDate]);

  const windowStartDate = timelineDates[0].dateStr;
  const windowEndDate = timelineDates[timelineDates.length - 1].dateStr;

  const handlePrev = () => {
    setBaseDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNext = () => {
    setBaseDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handleToday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    setBaseDate(d);
  };

  // Helper to compute percentage position and width
  const computeBarPosition = (startDate: string, dueDate: string) => {
    const startIdx = timelineDates.findIndex((d) => d.dateStr === startDate);
    const dueIdx = timelineDates.findIndex((d) => d.dateStr === dueDate);

    // If both dates outside or invalid
    const windowStartMs = new Date(windowStartDate).getTime();
    const windowEndMs = new Date(windowEndDate).getTime();
    const taskStartMs = new Date(startDate).getTime();
    const taskDueMs = new Date(dueDate).getTime();

    if (taskDueMs < windowStartMs || taskStartMs > windowEndMs) {
      return null;
    }

    const clampedStartMs = Math.max(taskStartMs, windowStartMs);
    const clampedDueMs = Math.min(taskDueMs, windowEndMs);

    const totalWindowMs = windowEndMs - windowStartMs || 1;
    const leftPercent = Math.max(0, ((clampedStartMs - windowStartMs) / totalWindowMs) * 100);
    const widthPercent = Math.max(5, ((clampedDueMs - clampedStartMs) / totalWindowMs) * 100);

    return {
      left: `${leftPercent}%`,
      width: `${Math.min(100 - leftPercent, widthPercent)}%`,
    };
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Header toolbar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#003B95]" />
            Biểu Đồ Timeline Tiến Độ (Gantt Chart)
          </h3>
          <p className="text-[11px] text-slate-500">
            Theo dõi thời gian thực hiện, hạn hoàn thành và các mốc họp trao đổi trên trục thời gian
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            Hiện tại
          </button>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title="7 ngày trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title="7 ngày sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Gantt View */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header Row: Left column + Date scale */}
          <div className="grid grid-cols-12 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-600 dark:text-slate-400">
            <div className="col-span-4 p-3 border-r border-slate-200 dark:border-slate-800">
              Công việc & Ban chuyên môn
            </div>
            <div className="col-span-8 grid grid-cols-14 text-center divide-x divide-slate-200/60 dark:divide-slate-800">
              {timelineDates.map((d) => (
                <div
                  key={d.dateStr}
                  className={`py-2 px-1 text-[11px] ${
                    d.isToday
                      ? 'bg-[#003B95]/10 text-[#003B95] font-black dark:text-blue-300'
                      : d.dayOfWeek === 'CN' || d.dayOfWeek === 'T7'
                      ? 'text-rose-500'
                      : ''
                  }`}
                >
                  <div className="text-[10px] opacity-70">{d.dayOfWeek}</div>
                  <div>{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Task rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Không có công việc nào trong danh sách.
              </div>
            ) : (
              tasks.map((task) => {
                const pos = computeBarPosition(task.startDate, task.dueDate);
                const statusCfg = TASK_STATUS_CONFIG[task.status];
                const priorityInfo = TASK_PRIORITY_CONFIG[task.priority];
                const hasMeeting = task.meeting?.enabled && task.meeting?.link;

                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="grid grid-cols-12 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group items-center py-2"
                  >
                    {/* Left: Task summary */}
                    <div className="col-span-4 px-3 border-r border-slate-200/60 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10.5px] font-bold text-[#003B95] dark:text-blue-400">
                          {task.code}
                        </span>
                        <span
                          className={`text-[9.5px] px-1 py-0.2 rounded font-semibold border ${priorityInfo.badge}`}
                        >
                          {priorityInfo.label}
                        </span>
                        {hasMeeting && (
                          <span className="inline-flex items-center gap-0.5 text-[9.5px] px-1 py-0.2 rounded bg-blue-600 text-white font-bold">
                            <Video className="w-2.5 h-2.5" />
                            {MEETING_PLATFORMS[task.meeting!.platform]?.shortName}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#003B95] transition-colors mt-0.5">
                        {task.title}
                      </div>
                      <div className="text-[10.5px] text-slate-400 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{task.department}</span>
                        <span>•</span>
                        <span>{task.assignee.name}</span>
                      </div>
                    </div>

                    {/* Right: Gantt bar canvas */}
                    <div className="col-span-8 relative h-10 flex items-center px-1">
                      {/* Grid background lines */}
                      <div className="absolute inset-0 grid grid-cols-14 divide-x divide-slate-100 dark:divide-slate-800/40 pointer-events-none">
                        {timelineDates.map((d) => (
                          <div
                            key={d.dateStr}
                            className={`h-full ${d.isToday ? 'bg-[#003B95]/5' : ''}`}
                          />
                        ))}
                      </div>

                      {/* Timeline Bar */}
                      {pos ? (
                        <div
                          className={`relative h-6 rounded-lg border shadow-xs overflow-hidden flex items-center px-2 transition-all group-hover:ring-2 group-hover:ring-[#003B95]/30 ${
                            statusCfg?.bg || 'bg-blue-50'
                          } ${statusCfg?.border || 'border-blue-200'}`}
                          style={{
                            left: pos.left,
                            width: pos.width,
                            minWidth: '40px',
                          }}
                          title={`${task.title} (${task.startDate} đến ${task.dueDate}) - ${task.progress}%`}
                        >
                          {/* Inner Progress fill */}
                          <div
                            className={`absolute top-0 bottom-0 left-0 opacity-25 ${
                              task.status === 'DONE' ? 'bg-emerald-600' : 'bg-[#003B95]'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />

                          <div className="relative z-10 flex items-center justify-between w-full text-[10.5px] font-bold truncate">
                            <span className={`truncate ${statusCfg?.text || 'text-slate-700'}`}>
                              {task.progress}%
                            </span>
                            {hasMeeting && (
                              <Video className="w-3 h-3 text-[#003B95] shrink-0 ml-1" />
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic pl-2">
                          Ngoài khoảng thời gian hiển thị ({task.startDate} → {task.dueDate})
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
