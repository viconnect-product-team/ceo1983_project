import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Flame,
  AlertCircle,
  Building,
  Video,
  ExternalLink,
} from 'lucide-react';
import type { TaskItem } from '../types';
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG, MEETING_PLATFORMS } from '../types';

export type TaskZoomLevel = 'compact' | 'standard' | 'spacious';

interface TaskCardProps {
  task: TaskItem;
  onClick: (task: TaskItem) => void;
  onQuickStatusChange?: (taskId: string, newStatus: TaskItem['status']) => void;
  zoomLevel?: TaskZoomLevel;
}

export function TaskCard({ task, onClick, zoomLevel = 'standard' }: TaskCardProps) {
  const priorityInfo = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.MEDIUM;
  const isOverdue =
    task.status !== 'DONE' && new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  // Zoom-dependent style tokens
  const isCompact = zoomLevel === 'compact';
  const isSpacious = zoomLevel === 'spacious';

  const cardPadding = isCompact ? 'p-3' : isSpacious ? 'p-5' : 'p-4';
  const titleSize = isCompact
    ? 'text-[12.5px] font-semibold mb-1 leading-snug'
    : isSpacious
    ? 'text-[15px] font-bold mb-2.5 leading-snug'
    : 'text-[13.5px] font-semibold mb-2 leading-snug';

  return (
    <div
      onClick={() => onClick(task)}
      className={`group relative flex flex-col justify-between rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 ${cardPadding} shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#003B95]/50 hover:shadow-md cursor-pointer select-none`}
    >
      <div>
        {/* Top Header: Code, Priority, Status dot */}
        <div className="flex items-center justify-between gap-1.5 mb-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="font-mono text-[10.5px] font-bold text-[#003B95] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900 truncate">
              {task.code}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold border ${priorityInfo.badge}`}
            >
              {task.priority === 'CRITICAL' && <Flame className="w-2.5 h-2.5 text-rose-500 animate-pulse" />}
              {priorityInfo.label}
            </span>
          </div>

          {/* Quick status dot with pulse for in-progress */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                TASK_STATUS_CONFIG[task.status]?.dot || 'bg-slate-400'
              } ${task.status === 'IN_PROGRESS' ? 'ring-2 ring-blue-300 dark:ring-blue-700 animate-pulse' : ''}`}
              title={`Trạng thái: ${TASK_STATUS_CONFIG[task.status]?.label}`}
            />
          </div>
        </div>

        {/* Department & Meeting Tag */}
        <div className="mb-2 flex items-center justify-between gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md truncate max-w-[190px]">
            <Building className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="truncate">{task.department}</span>
          </span>

          {task.meeting?.enabled && task.meeting?.link && (
            <a
              href={task.meeting.link}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition ${
                MEETING_PLATFORMS[task.meeting.platform]?.bg || 'bg-blue-50'
              } ${
                MEETING_PLATFORMS[task.meeting.platform]?.text || 'text-[#003B95]'
              } ${
                MEETING_PLATFORMS[task.meeting.platform]?.border || 'border-blue-200'
              } hover:opacity-85 shadow-2xs`}
              title={`Họp trực tuyến qua ${MEETING_PLATFORMS[task.meeting.platform]?.label}: ${task.meeting.link}`}
            >
              <Video className="w-2.5 h-2.5" />
              <span>{MEETING_PLATFORMS[task.meeting.platform]?.shortName || 'Họp'}</span>
              <ExternalLink className="w-2 h-2 opacity-60" />
            </a>
          )}
        </div>

        {/* Task Title */}
        <h4 className={`${titleSize} text-slate-900 dark:text-slate-100 group-hover:text-[#003B95] dark:group-hover:text-blue-400 transition-colors line-clamp-2`}>
          {task.title}
        </h4>

        {/* Description snippet - tailored to zoom level */}
        {task.description && !isCompact && (
          <p className={`text-[12px] text-slate-500 dark:text-slate-400 mb-2.5 ${isSpacious ? 'line-clamp-3' : 'line-clamp-2'}`}>
            {task.description}
          </p>
        )}

        {/* Subtask checklist progress bar */}
        {totalSubtasks > 0 && (
          <div className="mb-2.5 space-y-1">
            <div className="flex items-center justify-between text-[10.5px] text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-slate-400" />
                Mục con ({completedSubtasks}/{totalSubtasks})
              </span>
              <span className="font-bold">{Math.round((completedSubtasks / totalSubtasks) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  task.status === 'DONE' ? 'bg-emerald-500' : 'bg-[#003B95]'
                }`}
                style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: Assignee, Due date & counters */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 mt-1">
        <div className="flex items-center justify-between gap-2">
          {/* Assignee */}
          <div className="flex items-center gap-1.5 min-w-0">
            {task.assignee.avatar ? (
              <img
                src={task.assignee.avatar}
                alt={task.assignee.name}
                className={`${isCompact ? 'w-5 h-5' : 'w-6 h-6'} rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0`}
              />
            ) : (
              <div className={`${isCompact ? 'w-5 h-5 text-[9px]' : 'w-6 h-6 text-[10px]'} rounded-full bg-[#003B95] text-white flex items-center justify-center font-bold flex-shrink-0`}>
                {task.assignee.name.charAt(0)}
              </div>
            )}
            <span className={`${isCompact ? 'text-[11px] max-w-[90px]' : 'text-[12px] max-w-[120px]'} font-medium text-slate-700 dark:text-slate-300 truncate`}>
              {task.assignee.name}
            </span>
          </div>

          {/* Due date & Overdue indicator */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className={`flex items-center gap-1 text-[11px] font-medium ${
                isOverdue
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {isOverdue ? (
                <AlertCircle className="w-3 h-3 text-rose-500 flex-shrink-0" />
              ) : (
                <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
              )}
              <span className="font-mono text-[10.5px]">{task.dueDate.substring(5)}</span>
            </div>

            {/* Comments count */}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center gap-0.5 text-[10.5px] text-slate-400 font-mono">
                <MessageSquare className="w-3 h-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
