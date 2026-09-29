import React from 'react';
import {
  Building,
  Calendar,
  Edit2,
  Eye,
  Flame,
  Trash2,
  Video,
  ExternalLink,
} from 'lucide-react';
import type { TaskItem, TaskStatus } from '../types';
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG, MEETING_PLATFORMS } from '../types';

interface TaskTableViewProps {
  tasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  onQuickStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export function TaskTableView({
  tasks,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  onQuickStatusChange,
}: TaskTableViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-500 text-sm">Không tìm thấy công việc nào phù hợp với bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 font-semibold">
              <th className="py-3 px-4 w-[110px]">Mã CV</th>
              <th className="py-3 px-4 min-w-[240px]">Tên công việc</th>
              <th className="py-3 px-4 min-w-[180px]">Ban phụ trách</th>
              <th className="py-3 px-4 min-w-[160px]">Người thực hiện</th>
              <th className="py-3 px-4 w-[120px]">Hạn chót</th>
              <th className="py-3 px-4 w-[110px]">Ưu tiên</th>
              <th className="py-3 px-4 min-w-[140px]">Tiến độ</th>
              <th className="py-3 px-4 min-w-[140px]">Trạng thái</th>
              <th className="py-3 px-4 w-[100px] text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {tasks.map((task) => {
              const priorityInfo = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.MEDIUM;
              const statusInfo = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.TODO;
              const isOverdue =
                task.status !== 'DONE' &&
                new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

              return (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onTaskClick(task)}
                >
                  <td className="py-3 px-4 font-mono font-bold text-[#003B95] dark:text-blue-400 whitespace-nowrap">
                    {task.code}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-[#003B95] dark:group-hover:text-blue-400 transition-colors">
                      {task.title}
                    </div>
                    {task.deliverables && (
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
                        Kết quả: {task.deliverables}
                      </div>
                    )}
                    {task.meeting?.enabled && task.meeting?.link && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <a
                          href={task.meeting.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-bold border transition ${
                            MEETING_PLATFORMS[task.meeting.platform]?.bg || 'bg-blue-50'
                          } ${
                            MEETING_PLATFORMS[task.meeting.platform]?.text || 'text-[#003B95]'
                          } ${
                            MEETING_PLATFORMS[task.meeting.platform]?.border || 'border-blue-200'
                          } hover:opacity-85`}
                          title={`Tham gia họp: ${task.meeting.link}`}
                        >
                          <Video className="w-2.5 h-2.5" />
                          <span>Họp {MEETING_PLATFORMS[task.meeting.platform]?.shortName || 'Trực tuyến'}</span>
                          <ExternalLink className="w-2 h-2 opacity-60" />
                        </a>
                        {task.meeting.meetingTime && (
                          <span className="text-[10px] text-slate-400">
                            ({task.meeting.meetingTime.replace('T', ' ')})
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      <Building className="w-3 h-3 text-slate-500" />
                      {task.department}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {task.assignee.avatar ? (
                        <img
                          src={task.assignee.avatar}
                          alt={task.assignee.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#003B95] text-white flex items-center justify-center text-[10px] font-bold">
                          {task.assignee.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {task.assignee.name}
                        </div>
                        {task.assignee.role && (
                          <div className="text-[10px] text-slate-400">{task.assignee.role}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        isOverdue
                          ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      {task.dueDate}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold border ${priorityInfo.badge}`}
                    >
                      {task.priority === 'CRITICAL' && <Flame className="w-3 h-3" />}
                      {priorityInfo.label}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            task.status === 'DONE' ? 'bg-emerald-500' : 'bg-[#003B95]'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-400">
                        {task.progress}%
                      </span>
                    </div>
                  </td>

                  <td
                    className="py-3 px-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={task.status}
                      onChange={(e) =>
                        onQuickStatusChange(task.id, e.target.value as TaskStatus)
                      }
                      className={`text-[11px] font-semibold rounded-lg px-2.5 py-1 border transition-colors outline-none cursor-pointer ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                    >
                      {Object.entries(TASK_STATUS_CONFIG).map(([stKey, cfg]) => (
                        <option key={stKey} value={stKey} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                          {cfg.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td
                    className="py-3 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onTaskClick(task)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#003B95] dark:hover:text-blue-400 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditTask(task)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-[#B45309] dark:hover:text-amber-400 transition-colors"
                        title="Chỉnh sửa công việc"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Xóa công việc"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
