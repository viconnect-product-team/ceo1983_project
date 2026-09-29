import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Building,
  Plus,
  Heart,
  Users,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Video,
  ExternalLink,
  Flame,
} from 'lucide-react';
import type { TaskItem, TaskStatus } from '../types';
import {
  TASK_DEPARTMENTS,
  TASK_PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
  MEETING_PLATFORMS,
} from '../types';

interface TaskOrgTreeViewProps {
  tasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
  onAddTaskToDept?: (department: string) => void;
  onQuickStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

export function TaskOrgTreeView({
  tasks,
  onTaskClick,
  onAddTaskToDept,
  onQuickStatusChange,
}: TaskOrgTreeViewProps) {
  // Track expanded department nodes
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    TASK_DEPARTMENTS.forEach((dept) => {
      init[dept] = true; // All expanded by default for easy scanning
    });
    return init;
  });

  const toggleDept = (dept: string) => {
    setExpandedDepts((prev) => ({
      ...prev,
      [dept]: !prev[dept],
    }));
  };

  const handleExpandAll = () => {
    const updated: Record<string, boolean> = {};
    TASK_DEPARTMENTS.forEach((d) => (updated[d] = true));
    setExpandedDepts(updated);
  };

  const handleCollapseAll = () => {
    const updated: Record<string, boolean> = {};
    TASK_DEPARTMENTS.forEach((d) => (updated[d] = false));
    setExpandedDepts(updated);
  };

  // Group tasks by department
  const deptStats = TASK_DEPARTMENTS.map((dept) => {
    const deptTasks = tasks.filter((t) => t.department === dept);
    const inProgress = deptTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const done = deptTasks.filter((t) => t.status === 'DONE').length;
    const overdue = deptTasks.filter(
      (t) =>
        t.status === 'OVERDUE' ||
        (t.status !== 'DONE' && new Date(t.dueDate).getTime() < new Date().setHours(0, 0, 0, 0)),
    ).length;

    const avgProgress =
      deptTasks.length > 0
        ? Math.round(deptTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / deptTasks.length)
        : 0;

    return {
      name: dept,
      tasks: deptTasks,
      total: deptTasks.length,
      inProgress,
      done,
      overdue,
      avgProgress,
      isCharity: dept.includes('Thiện nguyện'),
    };
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#003B95] text-white">
              <Building className="w-4 h-4" />
            </span>
            Cây Đơn Vị & Cơ Cấu Ban Chuyên Môn
          </h3>
          <p className="text-[11px] text-slate-500">
            Phân bổ nhiệm vụ trực thuộc từng Ban chuyên trách CEO 1983 kèm tiến độ và họp điều phối
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExpandAll}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            Mở rộng tất cả
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            Thu gọn tất cả
          </button>
        </div>
      </div>

      {/* Root Node: CLB Doanh Nhân CEO 1983 */}
      <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 dark:border-blue-900/60 dark:bg-blue-950/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#003B95] text-white flex items-center justify-center font-black text-sm shadow-sm">
            1983
          </div>
          <div>
            <div className="font-extrabold text-sm text-[#003B95] dark:text-blue-300">
              CLB DOANH NHÂN CEO 1983 (BAN THƯỜNG TRỰC & HỘI ĐỒNG ĐIỀU HÀNH)
            </div>
            <div className="text-[11px] text-slate-500">
              Tổng số ban chuyên môn: {TASK_DEPARTMENTS.length} ban • Tổng số nhiệm vụ toàn hệ thống: {tasks.length}
            </div>
          </div>
        </div>
      </div>

      {/* Department Tree Branches */}
      <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-slate-200 dark:border-slate-800 ml-3">
        {deptStats.map((dept) => {
          const isExpanded = Boolean(expandedDepts[dept.name]);

          return (
            <div
              key={dept.name}
              className={`rounded-xl border transition-all ${
                dept.isCharity
                  ? 'border-rose-200/80 bg-rose-50/20 dark:border-rose-900/40 dark:bg-rose-950/10'
                  : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/70'
              }`}
            >
              {/* Department Branch Header */}
              <div
                onClick={() => toggleDept(dept.name)}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition select-none"
              >
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#003B95]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    {dept.isCharity ? (
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
                    ) : (
                      <Building className="w-4 h-4 text-[#003B95] shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{dept.name}</span>
                        {dept.isCharity && (
                          <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[9.5px] font-bold text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                            MỚI
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {dept.total} công việc • Đang thực hiện: {dept.inProgress} • Hoàn thành: {dept.done} • Quá hạn: {dept.overdue}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right metrics & Add Button */}
                <div className="flex items-center gap-3 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          dept.avgProgress === 100 ? 'bg-emerald-500' : 'bg-[#003B95]'
                        }`}
                        style={{ width: `${dept.avgProgress}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                      {dept.avgProgress}%
                    </span>
                  </div>

                  {onAddTaskToDept && (
                    <button
                      type="button"
                      onClick={() => onAddTaskToDept(dept.name)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#003B95]/10 text-[#003B95] hover:bg-[#003B95] hover:text-white dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-[#003B95] dark:hover:text-white text-xs font-bold transition"
                      title={`Thêm công việc cho ${dept.name}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Giao việc</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-tree: Task Items */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 p-3 space-y-2 bg-slate-50/40 dark:bg-slate-900/40">
                  {dept.tasks.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400 italic">
                      Ban này chưa có công việc nào được giao.
                    </div>
                  ) : (
                    dept.tasks.map((task) => {
                      const priorityInfo = TASK_PRIORITY_CONFIG[task.priority];
                      const statusInfo = TASK_STATUS_CONFIG[task.status];
                      const hasMeeting = task.meeting?.enabled && task.meeting?.link;

                      return (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick(task)}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200/70 bg-white hover:border-[#003B95]/40 hover:shadow-2xs dark:border-slate-800 dark:bg-slate-800/60 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="font-mono text-[11px] font-bold text-[#003B95] dark:text-blue-400">
                              {task.code}
                            </span>
                            <span
                              className={`text-[9.5px] px-1 py-0.2 rounded font-semibold border ${priorityInfo.badge}`}
                            >
                              {priorityInfo.label}
                            </span>
                            <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-auto">
                            {hasMeeting && (
                              <a
                                href={task.meeting!.link}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition ${
                                  MEETING_PLATFORMS[task.meeting!.platform]?.bg || 'bg-blue-50'
                                } ${
                                  MEETING_PLATFORMS[task.meeting!.platform]?.text || 'text-[#003B95]'
                                } ${
                                  MEETING_PLATFORMS[task.meeting!.platform]?.border || 'border-blue-200'
                                }`}
                              >
                                <Video className="w-2.5 h-2.5" />
                                <span>{MEETING_PLATFORMS[task.meeting!.platform]?.shortName}</span>
                                <ExternalLink className="w-2 h-2 opacity-60" />
                              </a>
                            )}

                            <span className="text-[11px] text-slate-500 font-medium">
                              {task.assignee.name}
                            </span>

                            <span
                              className={`text-[10.5px] font-semibold px-2 py-0.5 rounded border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                            >
                              {statusInfo.label}
                            </span>

                            <span className="font-mono text-xs text-[#003B95] font-bold">
                              {task.progress}%
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
