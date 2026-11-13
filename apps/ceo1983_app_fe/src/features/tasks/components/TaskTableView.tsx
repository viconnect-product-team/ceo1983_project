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
import { CustomTable, type CustomTableColumn } from '@/components/common/CustomTable';
import { CeoTableEllipsis } from '@/components/common/CeoTableEllipsis';
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
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  React.useEffect(() => {
    setPage(1);
  }, [tasks]);

  const pagedTasks = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return tasks.slice(start, start + pageSize);
  }, [tasks, page, pageSize]);

  const columns = React.useMemo<CustomTableColumn<TaskItem>[]>(() => [
    {
      key: 'code',
      label: 'Mã CV',
      width: 110,
      render: (task) => (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#003B95]/10 text-[#003B95] dark:text-blue-300 font-extrabold px-2 py-0.5 text-[11px] border border-[#003B95]/20 font-mono">
          {task.code}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'Tên công việc',
      minWidth: 240,
      render: (task) => (
        <div className="space-y-0.5">
          <CeoTableEllipsis
            text={task.title}
            maxLines={2}
            className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#003B95] dark:group-hover:text-blue-400 transition-colors"
          />
          {task.deliverables && (
            <CeoTableEllipsis
              text={`Kết quả: ${task.deliverables}`}
              maxLines={1}
              className="text-[11px] text-slate-400 dark:text-slate-500"
            />
          )}
          {task.meeting?.enabled && task.meeting?.link && (
            <div className="mt-1 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <a
                href={task.meeting.link}
                target="_blank"
                rel="noreferrer"
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
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Ban phụ trách',
      minWidth: 160,
      render: (task) => (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#003B95]/10 text-[#003B95] dark:text-blue-300 font-extrabold px-2 py-0.5 text-[11px] border border-[#003B95]/20">
          <Building className="w-3 h-3 text-[#003B95] dark:text-blue-300" />
          <CeoTableEllipsis text={task.department} maxLines={1} />
        </span>
      ),
    },
    {
      key: 'assignee',
      label: 'Người thực hiện',
      minWidth: 160,
      render: (task) => {
        if (task.assignees && task.assignees.length > 1) {
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center -space-x-1.5">
                {task.assignees.slice(0, 3).map((a, i) =>
                  a.avatar ? (
                    <img
                      key={i}
                      src={a.avatar}
                      alt={a.name}
                      title={a.name}
                      className="w-6 h-6 rounded-full object-cover border border-white dark:border-slate-800"
                    />
                  ) : (
                    <div
                      key={i}
                      title={a.name}
                      className="w-6 h-6 rounded-full bg-[#003B95] text-white flex items-center justify-center text-[10px] font-bold border border-white dark:border-slate-800"
                    >
                      {a.name.charAt(0)}
                    </div>
                  )
                )}
              </div>
              <div className="min-w-0">
                <CeoTableEllipsis
                  text={`${task.assignees[0].name} +${task.assignees.length - 1}`}
                  maxLines={1}
                  className="font-medium text-slate-800 dark:text-slate-200"
                />
                <div className="text-[10px] text-slate-400">
                  {task.assignees.length} người thực hiện
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            {task.assignee?.avatar ? (
              <img
                src={task.assignee.avatar}
                alt={task.assignee.name}
                className="w-6 h-6 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#003B95] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {(task.assignee?.name || 'A').charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <CeoTableEllipsis
                text={task.assignee?.name || 'Chưa giao'}
                maxLines={1}
                className="font-medium text-slate-800 dark:text-slate-200"
              />
              {task.assignee?.role && (
                <CeoTableEllipsis text={task.assignee.role} maxLines={1} className="text-[10px] text-slate-400" />
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'dueDate',
      label: 'Hạn chót',
      width: 120,
      render: (task) => {
        const isOverdue =
          task.status !== 'DONE' &&
          new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

        return (
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
        );
      },
    },
    {
      key: 'priority',
      label: 'Ưu tiên',
      width: 110,
      render: (task) => {
        const priorityInfo = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.MEDIUM;
        return (
          <span
            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold border ${priorityInfo.badge}`}
          >
            {task.priority === 'CRITICAL' && <Flame className="w-3 h-3" />}
            {priorityInfo.label}
          </span>
        );
      },
    },
    {
      key: 'progress',
      label: 'Tiến độ',
      width: 130,
      render: (task) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
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
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      width: 140,
      render: (task) => {
        const statusInfo = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.TODO;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <select
              value={task.status}
              onChange={(e) =>
                onQuickStatusChange(task.id, e.target.value as TaskStatus)
              }
              className={`text-[11px] font-semibold rounded-lg px-2.5 py-1 border transition-colors outline-hidden cursor-pointer ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
            >
              {Object.entries(TASK_STATUS_CONFIG).map(([stKey, cfg]) => (
                <option key={stKey} value={stKey} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>
        );
      },
    },
  ], [onQuickStatusChange]);

  return (
    <div className="self-stretch">
      <CustomTable
        columns={columns}
        data={pagedTasks}
        keyExtractor={(t) => t.id}
        showStt={true}
        page={page}
        pageSize={pageSize}
        total={tasks.length}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        pageSizeOptions={[10, 20, 50]}
        emptyText="Không tìm thấy công việc nào phù hợp với bộ lọc."
        onRowClick={(task) => onTaskClick(task)}
        actionColumn={{
          title: 'Thao tác',
          width: 120,
          render: (task) => (
            <div
              className="flex items-center justify-end gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onTaskClick(task)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#003B95] dark:hover:text-blue-400 transition-colors cursor-pointer"
                title="Xem chi tiết"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onEditTask(task)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-[#B45309] dark:hover:text-amber-400 transition-colors cursor-pointer"
                title="Chỉnh sửa công việc"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDeleteTask(task.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                title="Xóa công việc"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ),
        }}
      />
    </div>
  );
}
