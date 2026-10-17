import React, { useState, useEffect, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  GitCommit,
  FolderTree,
  RefreshCw,
  Building,
  Flame,
  AlertTriangle,
  PlayCircle,
  Eye,
  CheckCircle2,
  Video,
  BarChart3,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppShell } from '@/components/dashboard/AppShell';
import { PageHeader } from '@/components/dashboard/PageKit';
import { exportToExcel, formatDisplayDate } from '@/lib/excel-export';
import type { TaskItem, TaskPriority, TaskStatus } from '@/features/tasks';
import {
  TASK_DEPARTMENTS,
  TASK_PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
  fetchTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  updateTaskProgress,
  addCommentToTask,
  toggleSubtask,
  deleteTask,
  TaskKanbanBoard,
  TaskTableView,
  TaskCalendarView,
  TaskTimelineView,
  TaskStatisticsChartView,
  TaskOrgTreeView,
  TaskFormModal,
  TaskDetailDrawer,
} from '@/features/tasks';

export const Route = createFileRoute('/tasks')({ component: TasksPage });

type TaskViewMode = 'table' | 'kanban' | 'calendar' | 'timeline' | 'tree';

function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [viewMode, setViewMode] = useState<TaskViewMode>('table');

  // Modals & Drawers
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [defaultStatusForNew, setDefaultStatusForNew] = useState<TaskStatus>('TODO');
  const [defaultDeptForNew, setDefaultDeptForNew] = useState<string | undefined>(undefined);
  const [defaultDateForNew, setDefaultDateForNew] = useState<string | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
      if (selectedTask) {
        const refreshed = data.find((t) => t.id === selectedTask.id);
        if (refreshed) setSelectedTask(refreshed);
      }
    } catch (err: any) {
      toast.error('Lỗi khi tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedDept !== 'ALL' && t.department !== selectedDept) return false;
      if (selectedPriority !== 'ALL' && t.priority !== selectedPriority) return false;
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const inTitle = t.title.toLowerCase().includes(q);
        const inCode = t.code.toLowerCase().includes(q);
        const inAssignee = t.assignee?.name?.toLowerCase().includes(q);
        if (!inTitle && !inCode && !inAssignee) return false;
      }
      return true;
    });
  }, [tasks, selectedDept, selectedPriority, searchKeyword]);

  // Statistics KPI
  const stats = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const review = tasks.filter((t) => t.status === 'REVIEW').length;
    const done = tasks.filter((t) => t.status === 'DONE').length;
    const overdue = tasks.filter(
      (t) =>
        t.status === 'OVERDUE' ||
        (t.status !== 'DONE' && new Date(t.dueDate).getTime() < new Date().setHours(0, 0, 0, 0)),
    ).length;

    return { total, inProgress, review, done, overdue };
  }, [tasks]);

  // Handlers
  const handleOpenCreate = (
    status: TaskStatus = 'TODO',
    dept?: string,
    date?: string,
  ) => {
    setEditingTask(null);
    setDefaultStatusForNew(status);
    setDefaultDeptForNew(dept || (selectedDept !== 'ALL' ? selectedDept : undefined));
    setDefaultDateForNew(date);
    setFormOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setDefaultDeptForNew(undefined);
    setDefaultDateForNew(undefined);
    setFormOpen(true);
  };

  const handleTaskClick = (task: TaskItem) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const handleSubmitForm = async (data: Partial<TaskItem>) => {
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask.id, data);
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        if (selectedTask?.id === updated.id) setSelectedTask(updated);
        toast.success('Cập nhật công việc thành công');
      } else {
        const created = await createTask(data);
        setTasks((prev) => [created, ...prev]);
        toast.success('Tạo công việc mới thành công');
      }
    } catch {
      toast.error('Có lỗi xảy ra khi lưu công việc');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updated = await updateTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      if (selectedTask?.id === taskId) setSelectedTask(updated);
      toast.success(`Đã cập nhật trạng thái: ${TASK_STATUS_CONFIG[newStatus]?.label}`);
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleProgressChange = async (taskId: string, progress: number) => {
    try {
      const updated = await updateTaskProgress(taskId, progress);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      if (selectedTask?.id === taskId) setSelectedTask(updated);
    } catch {
      toast.error('Không thể cập nhật tiến độ');
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const updated = await toggleSubtask(taskId, subtaskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      if (selectedTask?.id === taskId) setSelectedTask(updated);
    } catch {
      toast.error('Không thể cập nhật mục con');
    }
  };

  const handleAddComment = async (taskId: string, content: string) => {
    try {
      const updated = await addCommentToTask(taskId, content);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      if (selectedTask?.id === taskId) setSelectedTask(updated);
      toast.success('Đã gửi phản hồi');
    } catch {
      toast.error('Không thể gửi phản hồi');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (selectedTask?.id === taskId) setSelectedTask(null);
      toast.success('Đã xóa công việc');
    } catch {
      toast.error('Không thể xóa công việc');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-2">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#003B95] text-white shadow-md">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Quản lý Công việc & Giao việc Hệ thống
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Phân công nhiệm vụ, theo dõi tiến độ và nghiệm thu công việc các ban chuyên trách CEO 1983
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                exportToExcel<TaskItem>({
                  title: "Báo Cáo Danh Sách Công Việc & Tiến Độ Hệ Thống",
                  subtitle: "Hệ thống quản lý công việc và phân công nhiệm vụ CEO 1983",
                  filename: "danh-sach-cong-viec",
                  sheetName: "Công việc",
                  columns: [
                    { header: "Mã công việc", key: "id", width: 16, value: (t) => t.id },
                    { header: "Tên công việc", key: "title", width: 35, value: (t) => t.title },
                    { header: "Ban chuyên trách", key: "department", width: 24, value: (t) => t.department || "Chung" },
                    { header: "Người phụ trách", key: "assignee", width: 22, value: (t) => t.assignee?.name || "Chưa gán" },
                    { header: "Trạng thái", key: "status", width: 18, value: (t) => TASK_STATUS_CONFIG[t.status]?.label || t.status },
                    { header: "Mức ưu tiên", key: "priority", width: 16, value: (t) => TASK_PRIORITY_CONFIG[t.priority]?.label || t.priority },
                    { header: "Tiến độ (%)", key: "progress", width: 14, value: (t) => `${t.progress || 0}%` },
                    { header: "Hạn hoàn thành", key: "dueDate", width: 16, value: (t) => formatDisplayDate(t.dueDate) },
                    { header: "Ngày tạo", key: "createdAt", width: 16, value: (t) => formatDisplayDate(t.createdAt) },
                  ],
                  data: filteredTasks,
                  summaryRows: [
                    ["TỔNG SỐ CÔNG VIỆC", filteredTasks.length, "", "", "", "", "", "", ""],
                  ],
                });
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-xs transition"
              title="Xuất danh sách công việc ra file Excel"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Xuất Excel
            </button>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => handleOpenCreate('TODO')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              Thêm công việc mới
            </button>
          </div>
        </div>

        {/* ── 4 METRIC CARDS (Figma Exact Style matching Quản lý tài khoản) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tổng công việc (Sky gradient - Blue) */}
          <div className="h-32 p-4 bg-gradient-to-b from-sky-100 to-slate-50 dark:from-sky-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
            <div className="h-8 flex items-center gap-2">
              <img src="/icons/ceo1983_icon_2/users-round-1.svg" className="h-4 w-4" alt="tasks" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
              <div className="text-blue-600 dark:text-blue-400 text-xs font-semibold font-['Inter']">TỔNG CÔNG VIỆC</div>
            </div>
            <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
              {stats.total}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
              Toàn bộ các ban chuyên môn
            </div>
          </div>

          {/* Card 2: Đang thực hiện & Duyệt (Violet gradient - Indigo) */}
          <div className="h-32 p-4 bg-gradient-to-b from-violet-100 to-white dark:from-violet-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
            <div className="h-8 flex items-center gap-2">
              <img src="/icons/ceo1983_icon_2/shield-check.svg" className="h-4 w-4" alt="progress" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
              <div className="text-indigo-500 dark:text-indigo-400 text-xs font-semibold font-['Inter']">ĐANG THỰC HIỆN</div>
            </div>
            <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
              {stats.inProgress}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
              Đang chạy tiến độ ({stats.review} chờ duyệt)
            </div>
          </div>

          {/* Card 3: Cần đôn đốc / Quá hạn (Orange gradient - Orange) */}
          <div className="h-32 p-4 bg-gradient-to-b from-orange-100 to-white dark:from-orange-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
            <div className="h-8 flex items-center gap-2">
              <img src="/icons/ceo1983_icon_2/building-2-1.svg" className="h-4 w-4" alt="overdue" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
              <div className="text-orange-500 dark:text-orange-400 text-xs font-semibold font-['Inter']">CẦN ĐÔN ĐỐC / QUÁ HẠN</div>
            </div>
            <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
              {stats.overdue}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
              Cần xử lý &amp; bám sát tiến độ
            </div>
          </div>

          {/* Card 4: Đã hoàn thành (Green gradient - Emerald) */}
          <div className="h-32 p-4 bg-gradient-to-b from-green-100 to-white dark:from-green-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
            <div className="h-8 flex items-center gap-2">
              <img src="/icons/ceo1983_icon_2/circle-check.svg" className="h-4 w-4" alt="done" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
              <div className="text-emerald-500 dark:text-emerald-400 text-xs font-semibold font-['Inter']">ĐÃ HOÀN THÀNH</div>
            </div>
            <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
              {stats.done}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
              Nghiệm thu đạt chuẩn yêu cầu
            </div>
          </div>
        </div>

        {/* Filter Toolbar & View Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, mã CV, người làm..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-[#003B95] outline-none"
              />
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="ALL">Tất cả ban ngành</option>
                {TASK_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="ALL">Mọi mức ưu tiên</option>
                {Object.entries(TASK_PRIORITY_CONFIG).map(([k, cfg]) => (
                  <option key={k} value={k}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5 View modes toggle switcher */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-end md:self-auto border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-[#003B95] dark:text-blue-300 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Dạng bảng chi tiết"
            >
              <List className="w-3.5 h-3.5" />
              <span>Bảng</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-[#003B95] dark:text-blue-300 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Dạng lưới thẻ Kanban"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Lưới (Kanban)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-[#003B95] dark:text-blue-300 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Dạng lịch tháng & họp"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Lịch</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-700 text-[#003B95] dark:text-blue-300 shadow-xs font-bold ring-1 ring-slate-200 dark:ring-slate-600'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Dạng biểu đồ thống kê & phân tích tiến độ"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Biểu đồ thống kê</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'tree'
                  ? 'bg-white dark:bg-slate-700 text-[#003B95] dark:text-blue-300 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Dạng cây phân cấp ban chuyên môn"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Cây đơn vị</span>
            </button>
          </div>
        </div>

        {/* Main Content Area: 5 View Modes */}
        {viewMode === 'table' && (
          <TaskTableView
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onEditTask={handleOpenEdit}
            onDeleteTask={handleDeleteTask}
            onQuickStatusChange={handleStatusChange}
          />
        )}

        {viewMode === 'kanban' && (
          <TaskKanbanBoard
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onAddTaskToColumn={(status) => handleOpenCreate(status)}
            onQuickStatusChange={handleStatusChange}
          />
        )}

        {viewMode === 'calendar' && (
          <TaskCalendarView
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onAddTaskToDate={(date) => handleOpenCreate('TODO', undefined, date)}
          />
        )}

        {viewMode === 'timeline' && (
          <TaskStatisticsChartView
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
          />
        )}

        {viewMode === 'tree' && (
          <TaskOrgTreeView
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onAddTaskToDept={(dept) => handleOpenCreate('TODO', dept)}
            onQuickStatusChange={handleStatusChange}
          />
        )}

        {/* Modal: Create & Edit Task */}
        <TaskFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmitForm}
          initialData={editingTask}
          defaultStatus={defaultStatusForNew}
          defaultDepartment={defaultDeptForNew}
          defaultDate={defaultDateForNew}
        />

        {/* Drawer: Detail, Checklist, Comments & History */}
        <TaskDetailDrawer
          open={drawerOpen}
          task={selectedTask}
          onClose={() => setDrawerOpen(false)}
          onEdit={(task) => {
            setDrawerOpen(false);
            handleOpenEdit(task);
          }}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onProgressChange={handleProgressChange}
          onToggleSubtask={handleToggleSubtask}
          onAddComment={handleAddComment}
          onTaskUpdated={(updated) => {
            setSelectedTask(updated);
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            loadData();
          }}
        />
      </div>
    </AppShell>
  );
}
