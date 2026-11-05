import React, { useState, useMemo } from 'react';
import { History, Search, Filter, Calendar, UserCheck, CheckCircle2, AlertCircle, ArrowRight, Eye, Building } from 'lucide-react';
import type { TaskItem } from '../types';
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '../types';
import { formatDisplayDate } from '@/lib/date-format';

interface TaskAssignmentHistoryViewProps {
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
}

interface HistoryRow {
  id: string;
  taskId: string;
  taskCode: string;
  taskTitle: string;
  department: string;
  action: string;
  actor: string;
  timestamp: string;
  assigneeName: string;
  assigneeRole?: string;
  status: string;
  priority: string;
  rawTask: TaskItem;
}

export const TaskAssignmentHistoryView: React.FC<TaskAssignmentHistoryViewProps> = ({
  tasks,
  onSelectTask,
}) => {
  const [keyword, setKeyword] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const historyRows: HistoryRow[] = useMemo(() => {
    const list: HistoryRow[] = [];
    tasks.forEach((t) => {
      if (Array.isArray(t.history) && t.history.length > 0) {
        t.history.forEach((h, idx) => {
          list.push({
            id: h.id || `h-${t.id}-${idx}`,
            taskId: t.id,
            taskCode: t.code,
            taskTitle: t.title,
            department: t.department || 'Ban Điều Hành',
            action: h.action,
            actor: h.actor || (t as any).creator?.name || 'Ban Quản trị',
            timestamp: h.timestamp || t.createdAt,
            assigneeName: t.assignee?.name || (t.assignees && t.assignees[0]?.name) || 'Chưa gán',
            assigneeRole: t.assignee?.role || 'Phụ trách',
            status: t.status,
            priority: t.priority,
            rawTask: t,
          });
        });
      } else {
        // Fallback row if no history array
        list.push({
          id: `h-init-${t.id}`,
          taskId: t.id,
          taskCode: t.code,
          taskTitle: t.title,
          department: t.department || 'Ban Điều Hành',
          action: 'Giao việc ban đầu',
          actor: (t as any).creator?.name || t.supervisor?.name || 'Ban Quản trị',
          timestamp: t.createdAt,
          assigneeName: t.assignee?.name || 'Chưa gán',
          assigneeRole: t.assignee?.role || 'Phụ trách',
          status: t.status,
          priority: t.priority,
          rawTask: t,
        });
      }
    });

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [tasks]);

  const filteredRows = useMemo(() => {
    return historyRows.filter((row) => {
      if (filterAction !== 'ALL') {
        if (filterAction === 'CREATE' && !row.action.toLowerCase().includes('tạo') && !row.action.toLowerCase().includes('ban đầu')) {
          return false;
        }
        if (filterAction === 'ASSIGN' && !row.action.toLowerCase().includes('giao') && !row.action.toLowerCase().includes('người')) {
          return false;
        }
        if (filterAction === 'STATUS' && !row.action.toLowerCase().includes('trạng thái') && !row.action.toLowerCase().includes('tiến độ')) {
          return false;
        }
      }

      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        return (
          row.taskTitle.toLowerCase().includes(q) ||
          row.taskCode.toLowerCase().includes(q) ||
          row.actor.toLowerCase().includes(q) ||
          row.assigneeName.toLowerCase().includes(q) ||
          row.action.toLowerCase().includes(q) ||
          row.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [historyRows, keyword, filterAction]);

  return (
    <div className="space-y-4">
      {/* Sub-toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#003B95] text-white">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Nhật Ký & Lịch Sử Giao Việc Toàn Hệ Thống
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ghi nhận {filteredRows.length} lượt giao việc, điều chuyển người xử lý và cập nhật nhiệm vụ
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Lọc theo người giao, người nhận..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="ALL">Mọi loại hành động</option>
            <option value="ASSIGN">Chỉ hành động Giao việc</option>
            <option value="CREATE">Tạo công việc mới</option>
            <option value="STATUS">Thay đổi trạng thái / Tiến độ</option>
          </select>
        </div>
      </div>

      {/* Table Audit Logs */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="h-12 bg-blue-50/70 dark:bg-blue-950/40 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 text-center w-12">STT</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 w-36">Thời gian</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 w-28">Mã CV</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 min-w-[200px]">Tên công việc & Ban</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 w-44">Người giao việc</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 w-48">Người nhận việc</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 min-w-[200px]">Hành động ghi nhận</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 w-28 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-center w-20">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 dark:text-slate-500 italic">
                    Chưa có lịch sử giao việc nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const statusCfg = (TASK_STATUS_CONFIG as Record<string, any>)[row.status] || { label: row.status, bg: 'bg-slate-100 text-slate-700' };
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors"
                    >
                      <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {row.timestamp.includes('T') ? row.timestamp.replace('T', ' ').substring(0, 16) : row.timestamp}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 font-mono font-bold text-[#003B95] dark:text-blue-400">
                        {row.taskCode}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {row.taskTitle}
                        </div>
                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{row.department}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                            {row.actor.charAt(0)}
                          </div>
                          <span className="truncate">{row.actor}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 font-medium text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-[#003B95] dark:text-blue-300 flex items-center justify-center text-[10px] font-bold">
                            {row.assigneeName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-slate-900 dark:text-slate-100">{row.assigneeName}</div>
                            {row.assigneeRole && <div className="text-[10px] text-slate-400 truncate">{row.assigneeRole}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-[11px]">
                          {row.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-800 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.bg}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectTask(row.rawTask)}
                          className="p-1 rounded-md text-slate-500 hover:text-[#003B95] hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Xem chi tiết công việc"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
