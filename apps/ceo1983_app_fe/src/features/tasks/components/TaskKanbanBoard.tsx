import React, { useState } from 'react';
import {
  Plus,
  ListTodo,
  PlayCircle,
  Eye,
  CheckCircle2,
  AlertOctagon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  SlidersHorizontal,
} from 'lucide-react';
import type { TaskItem, TaskStatus } from '../types';
import { TaskCard, type TaskZoomLevel } from './TaskCard';

interface TaskKanbanBoardProps {
  tasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
  onAddTaskToColumn?: (status: TaskStatus) => void;
  onQuickStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

const COLUMNS: {
  status: TaskStatus;
  title: string;
  icon: any;
  accentColor: string;
  badgeBg: string;
  borderTop: string;
}[] = [
  {
    status: 'TODO',
    title: 'Chờ xử lý',
    icon: ListTodo,
    accentColor: 'text-slate-600 dark:text-slate-400',
    badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    borderTop: 'border-t-slate-400',
  },
  {
    status: 'IN_PROGRESS',
    title: 'Đang thực hiện',
    icon: PlayCircle,
    accentColor: 'text-[#003B95] dark:text-blue-400',
    badgeBg: 'bg-blue-100 text-[#003B95] dark:bg-blue-950 dark:text-blue-300',
    borderTop: 'border-t-[#003B95]',
  },
  {
    status: 'REVIEW',
    title: 'Chờ nghiệm thu',
    icon: Eye,
    accentColor: 'text-[#B45309] dark:text-amber-400',
    badgeBg: 'bg-amber-100 text-[#B45309] dark:bg-amber-950 dark:text-amber-300',
    borderTop: 'border-t-[#F59E0B]',
  },
  {
    status: 'DONE',
    title: 'Đã hoàn thành',
    icon: CheckCircle2,
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    borderTop: 'border-t-emerald-500',
  },
  {
    status: 'OVERDUE',
    title: 'Quá hạn / Tạm dừng',
    icon: AlertOctagon,
    accentColor: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    borderTop: 'border-t-rose-500',
  },
];

export function TaskKanbanBoard({
  tasks,
  onTaskClick,
  onAddTaskToColumn,
  onQuickStatusChange,
}: TaskKanbanBoardProps) {
  // Zoom mode: 'compact' (280px), 'standard' (345px), 'spacious' (410px)
  const [zoomLevel, setZoomLevel] = useState<TaskZoomLevel>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('task_kanban_zoom') as TaskZoomLevel;
      if (saved && ['compact', 'standard', 'spacious'].includes(saved)) return saved;
    }
    return 'standard';
  });

  const handleZoomChange = (level: TaskZoomLevel) => {
    setZoomLevel(level);
    if (typeof window !== 'undefined') {
      localStorage.setItem('task_kanban_zoom', level);
    }
  };

  // Compute column width and styling based on zoom
  const columnWidthClass =
    zoomLevel === 'compact'
      ? 'w-[280px] min-w-[280px]'
      : zoomLevel === 'spacious'
      ? 'w-[410px] min-w-[410px]'
      : 'w-[345px] min-w-[345px]';

  const columnCardGap =
    zoomLevel === 'compact' ? 'gap-2.5' : zoomLevel === 'spacious' ? 'gap-4' : 'gap-3';

  return (
    <div className="space-y-3">
      {/* Zoom & View Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#003B95] dark:text-blue-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Giao diện Bảng Lưới (Kanban Board)</span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className="hidden sm:inline text-slate-500 font-mono">
            {tasks.length} công việc phân bố qua 5 cột trạng thái
          </span>
        </div>

        {/* Zoom size switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
          <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
            <ZoomIn className="w-3 h-3 text-slate-400" /> Kích thước:
          </span>

          <button
            type="button"
            onClick={() => handleZoomChange('compact')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              zoomLevel === 'compact'
                ? 'bg-white dark:bg-slate-700 text-[#003B95] dark:text-blue-300 shadow-xs font-bold ring-1 ring-slate-200 dark:ring-slate-600'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
            title="Thu nhỏ để xem tổng thể nhiều cột cùng lúc (280px)"
          >
            <ZoomOut className="w-3 h-3" />
            <span>Thu nhỏ</span>
          </button>

          <button
            type="button"
            onClick={() => handleZoomChange('standard')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              zoomLevel === 'standard'
                ? 'bg-white dark:bg-slate-700 text-[#003B95] dark:text-blue-300 shadow-xs font-bold ring-1 ring-slate-200 dark:ring-slate-600'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
            title="Kích thước tiêu chuẩn cân đối (345px)"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Tiêu chuẩn</span>
          </button>

          <button
            type="button"
            onClick={() => handleZoomChange('spacious')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              zoomLevel === 'spacious'
                ? 'bg-white dark:bg-slate-700 text-[#003B95] dark:text-blue-300 shadow-xs font-bold ring-1 ring-slate-200 dark:ring-slate-600'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
            title="Phóng to thẻ rộng rãi, hiển thị chi tiết đầy đủ (410px)"
          >
            <ZoomIn className="w-3 h-3" />
            <span>Phóng to</span>
          </button>
        </div>
      </div>

      {/* Horizontal Flex Track - Completely eliminates cramped columns and overlapping */}
      <div className="flex items-start gap-4 overflow-x-auto pb-6 pt-1 scrollbar-thin scroll-smooth min-h-[550px]">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          const colTasks = tasks.filter((t) => t.status === col.status);

          return (
            <div
              key={col.status}
              className={`flex-shrink-0 flex flex-col rounded-2xl bg-slate-50/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 p-3.5 shadow-xs transition-all duration-200 border-t-4 ${col.borderTop} ${columnWidthClass}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-2xs ${col.accentColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-[13.5px] font-bold text-slate-800 dark:text-slate-100 truncate">
                    {col.title}
                  </h3>
                  <span className={`flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[11px] font-black ${col.badgeBg} shadow-2xs`}>
                    {colTasks.length}
                  </span>
                </div>

                {onAddTaskToColumn && (
                  <button
                    type="button"
                    onClick={() => onAddTaskToColumn(col.status)}
                    className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 hover:text-[#003B95] dark:hover:text-blue-400 transition cursor-pointer"
                    title={`Thêm công việc vào ${col.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Task list container */}
              <div className={`flex flex-col ${columnCardGap} min-h-[160px]`}>
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-xl text-slate-400 bg-white/40 dark:bg-slate-900/30">
                    <p className="text-[12px] font-medium">Chưa có công việc</p>
                    {onAddTaskToColumn && (
                      <button
                        type="button"
                        onClick={() => onAddTaskToColumn(col.status)}
                        className="mt-2.5 text-[11px] text-[#003B95] dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900"
                      >
                        <Plus className="w-3 h-3" /> Thêm việc vào cột
                      </button>
                    )}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={onTaskClick}
                      onQuickStatusChange={onQuickStatusChange}
                      zoomLevel={zoomLevel}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
