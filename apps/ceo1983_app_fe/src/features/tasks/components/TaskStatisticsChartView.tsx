import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  GitCommit,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlayCircle,
  Building,
  Flame,
  Award,
  Video,
  TrendingUp,
  Target,
  Users,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import type { TaskItem } from '../types';
import {
  TASK_DEPARTMENTS,
  TASK_PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
  MEETING_PLATFORMS,
} from '../types';

interface TaskStatisticsChartViewProps {
  tasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
}

const STATUS_COLORS: Record<string, string> = {
  TODO: '#64748B', // Slate
  IN_PROGRESS: '#003B95', // Deep Cobalt Navy
  REVIEW: '#F59E0B', // Warm Amber Gold
  DONE: '#10B981', // Emerald
  OVERDUE: '#EF4444', // Rose Red
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#EF4444',
  HIGH: '#F59E0B',
  MEDIUM: '#003B95',
  LOW: '#64748B',
};

export function TaskStatisticsChartView({ tasks, onTaskClick }: TaskStatisticsChartViewProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'timeline'>('analytics');

  // Timeline Gantt State
  const [baseDate, setBaseDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    return d;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Overview KPIs
  const kpis = useMemo(() => {
    const total = tasks.length || 1;
    const done = tasks.filter((t) => t.status === 'DONE').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const review = tasks.filter((t) => t.status === 'REVIEW').length;
    const overdue = tasks.filter(
      (t) =>
        t.status === 'OVERDUE' ||
        (t.status !== 'DONE' && new Date(t.dueDate).getTime() < new Date().setHours(0, 0, 0, 0)),
    ).length;
    const critical = tasks.filter((t) => t.priority === 'CRITICAL' || t.priority === 'HIGH').length;
    const withMeetings = tasks.filter((t) => t.meeting?.enabled && t.meeting?.link).length;

    const completionRate = Math.round((done / total) * 100);
    const avgProgress = Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / total);

    return {
      total: tasks.length,
      done,
      inProgress,
      review,
      overdue,
      critical,
      withMeetings,
      completionRate,
      avgProgress,
    };
  }, [tasks]);

  // 2. Data for Status Donut Chart
  const statusPieData = useMemo(() => {
    return [
      { name: 'Chờ xử lý', key: 'TODO', value: tasks.filter((t) => t.status === 'TODO').length },
      { name: 'Đang làm', key: 'IN_PROGRESS', value: tasks.filter((t) => t.status === 'IN_PROGRESS').length },
      { name: 'Chờ duyệt', key: 'REVIEW', value: tasks.filter((t) => t.status === 'REVIEW').length },
      { name: 'Đã xong', key: 'DONE', value: tasks.filter((t) => t.status === 'DONE').length },
      { name: 'Quá hạn', key: 'OVERDUE', value: tasks.filter((t) => t.status === 'OVERDUE').length },
    ].filter((d) => d.value > 0);
  }, [tasks]);

  // 3. Data for Department Grouped Bar Chart
  const deptBarData = useMemo(() => {
    return TASK_DEPARTMENTS.map((dept) => {
      const deptTasks = tasks.filter((t) => t.department === dept);
      const total = deptTasks.length;
      const done = deptTasks.filter((t) => t.status === 'DONE').length;
      const inProgress = deptTasks.filter((t) => t.status === 'IN_PROGRESS').length;
      const overdue = deptTasks.filter((t) => t.status === 'OVERDUE').length;
      const avgProg = total > 0 ? Math.round(deptTasks.reduce((s, t) => s + (t.progress || 0), 0) / total) : 0;

      // Abbreviated short name for readable x-axis labels
      const shortName = dept
        .replace('Ban Thiện Nguyện & An Sinh Xã Hội', 'Thiện Nguyện')
        .replace('Ban Xúc tiến thương mại', 'Xúc Tiến TM')
        .replace('Ban Truyền thông', 'Truyền Thông')
        .replace('Ban Thành viên', 'Thành Viên')
        .replace('Ban Tài chính', 'Tài Chính')
        .replace('Ban Thư ký', 'Thư Ký');

      return {
        department: dept,
        shortName,
        total,
        done,
        inProgress,
        overdue,
        avgProgress: avgProg,
      };
    }).filter((d) => d.total > 0 || d.department.includes('Thiện Nguyện'));
  }, [tasks]);

  // 4. Data for Priority Breakdown
  const priorityBarData = useMemo(() => {
    return [
      { name: 'Hỏa tốc (Critical)', key: 'CRITICAL', count: tasks.filter((t) => t.priority === 'CRITICAL').length },
      { name: 'Ưu tiên cao', key: 'HIGH', count: tasks.filter((t) => t.priority === 'HIGH').length },
      { name: 'Trung bình', key: 'MEDIUM', count: tasks.filter((t) => t.priority === 'MEDIUM').length },
      { name: 'Bình thường', key: 'LOW', count: tasks.filter((t) => t.priority === 'LOW').length },
    ];
  }, [tasks]);

  // 5. Timeline Dates for Gantt Sub-view
  const timelineDates = useMemo(() => {
    const dates: Array<{ dateStr: string; label: string; dayOfWeek: string; isToday: boolean }> = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 14; i++) {
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

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Executive Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#003B95] dark:text-blue-400">
              <BarChart3 className="w-4 h-4" />
            </span>
            Trung Tâm Thống Kê & Phân Tích Hiệu Suất Công Việc
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Báo cáo tổng hợp tiến độ, phân bổ trạng thái theo ban chuyên môn và tỷ lệ hoàn thành dự án CEO 1983
          </p>
        </div>

        {/* Sub-tab toggle: Analytics Dashboard vs Timeline Gantt */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-700 text-[#003B95] dark:text-blue-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Biểu Đồ Thống Kê</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-white dark:bg-slate-700 text-[#003B95] dark:text-blue-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Timeline Trục Lịch</span>
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <div className="space-y-4">
          {/* Executive KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Completion Rate */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tỷ lệ hoàn thành
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {kpis.completionRate}%
                </span>
                <span className="text-xs text-emerald-600 font-bold">
                  ({kpis.done}/{kpis.total} việc)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${kpis.completionRate}%` }}
                />
              </div>
            </div>

            {/* KPI 2: Overall Average Progress */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tiến độ trung bình
                </span>
                <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#003B95] dark:text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#003B95] dark:text-blue-400 font-mono">
                  {kpis.avgProgress}%
                </span>
                <span className="text-xs text-blue-600/80 dark:text-blue-400/80 font-medium">
                  {kpis.inProgress} việc đang chạy
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-[#003B95] h-full rounded-full transition-all duration-500"
                  style={{ width: `${kpis.avgProgress}%` }}
                />
              </div>
            </div>

            {/* KPI 3: Critical & High Priority */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Việc Hỏa tốc / Trọng điểm
                </span>
                <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600">
                  <Flame className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-rose-600 font-mono">
                  {kpis.critical}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {kpis.overdue > 0 ? `${kpis.overdue} quá hạn` : 'Không có quá hạn'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Cần Ban Thường Trực đôn đốc
              </p>
            </div>

            {/* KPI 4: Connected Online Meetings */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Cuộc họp gắn liền CV
                </span>
                <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600">
                  <Video className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-purple-700 dark:text-purple-400 font-mono">
                  {kpis.withMeetings}
                </span>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                  Zoom • Meet • UniWork
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Họp trao đổi trực tiếp trên từng đầu việc
              </p>
            </div>
          </div>

          {/* Charts Row 1: Donut (Status) + Grouped Bar (Department volume) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Donut Chart: Trạng thái công việc */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#003B95]" />
                    Cơ Cấu Trạng Thái Công Việc
                  </h3>
                  <p className="text-[11px] text-slate-500">Tỷ trọng 5 trạng thái vận hành</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {kpis.total} việc
                </span>
              </div>

              <div className="h-64 relative flex items-center justify-center pt-2">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={88}
                        paddingAngle={4}
                      >
                        {statusPieData.map((entry) => (
                          <Cell
                            key={`cell-${entry.key}`}
                            fill={STATUS_COLORS[entry.key] || '#94A3B8'}
                            stroke="transparent"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any) => [`${val} công việc`, name]}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center text-slate-400 text-xs">Đang tải biểu đồ...</div>
                )}

                {/* Center text in donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono">
                    {kpis.completionRate}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Hoàn thành</span>
                </div>
              </div>
            </div>

            {/* Grouped Bar Chart: Khối lượng công việc theo Ban */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    Phân Bổ Công Việc Theo Ban Chuyên Môn
                  </h3>
                  <p className="text-[11px] text-slate-500">So sánh số lượng Đã xong vs Đang xử lý vs Quá hạn</p>
                </div>
              </div>

              <div className="h-64 pt-3">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptBarData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="shortName"
                        tick={{ fontSize: 10.5, fill: '#64748B' }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 10.5, fill: '#64748B' }} allowDecimals={false} />
                      <Tooltip
                        formatter={(val: any, name: any) => [`${val} việc`, name]}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        height={30}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px' }}
                      />
                      <Bar dataKey="done" name="Đã hoàn thành" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={22} />
                      <Bar dataKey="inProgress" name="Đang thực hiện" fill="#003B95" radius={[4, 4, 0, 0]} maxBarSize={22} />
                      <Bar dataKey="overdue" name="Quá hạn" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center text-slate-400 text-xs">Đang tải biểu đồ...</div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row 2: Priority Area + Progress Rate by Dept */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Priority Distribution */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    Phân Bổ Theo Mức Độ Ưu Tiên
                  </h3>
                  <p className="text-[11px] text-slate-500">Mức độ khẩn cấp cần phân bổ nguồn lực</p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {priorityBarData.map((item) => {
                  const pct = Math.round((item.count / (kpis.total || 1)) * 100);
                  const color = PRIORITY_COLORS[item.key] || '#003B95';

                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          {item.key === 'CRITICAL' && <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />}
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-900 dark:text-white font-bold">{item.count} việc</span>
                          <span className="text-[11px] text-slate-400">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Progress Average % */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    Tiến Độ Trung Bình Theo Ban Chuyên Môn (%)
                  </h3>
                  <p className="text-[11px] text-slate-500">Mức độ hoàn tất kế hoạch công việc ban</p>
                </div>
              </div>

              <div className="h-52 pt-1">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={deptBarData} margin={{ top: 10, right: 15, left: -20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#003B95" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#003B95" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="shortName"
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} domain={[0, 100]} />
                      <Tooltip
                        formatter={(val: any) => [`${val}%`, 'Tiến độ TB']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="avgProgress"
                        stroke="#003B95"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#progressGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center text-slate-400 text-xs">Đang tải biểu đồ...</div>
                )}
              </div>
            </div>
          </div>

          {/* Department Performance Leaderboard Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Bảng Thống Kê Chi Tiết Hiệu Suất Theo Ban Chuyên Môn CEO 1983
                </h3>
                <p className="text-[11px] text-slate-500">
                  Xếp hạng tiến độ, số lượng hoàn thành và tỷ lệ thực hiện đúng hạn
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Ban Chuyên Môn</th>
                    <th className="py-2.5 px-3 text-center">Tổng việc</th>
                    <th className="py-2.5 px-3 text-center text-emerald-600">Đã xong</th>
                    <th className="py-2.5 px-3 text-center text-[#003B95] dark:text-blue-400">Đang làm</th>
                    <th className="py-2.5 px-3 text-center text-rose-600">Quá hạn</th>
                    <th className="py-2.5 px-3">Tiến độ trung bình</th>
                    <th className="py-2.5 px-3 text-right">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {deptBarData.map((item) => {
                    const evalStatus =
                      item.avgProgress >= 80
                        ? { label: 'Xuất sắc', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' }
                        : item.avgProgress >= 50
                        ? { label: 'Tiến độ tốt', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300' }
                        : { label: 'Cần đôn đốc', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300' };

                    return (
                      <tr key={item.department} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-2">
                            <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{item.department}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {item.total}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">
                          {item.done}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-[#003B95] dark:text-blue-400">
                          {item.inProgress}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-rose-600">
                          {item.overdue}
                        </td>
                        <td className="py-3 px-3 w-48">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  item.avgProgress >= 80
                                    ? 'bg-emerald-500'
                                    : item.avgProgress >= 50
                                    ? 'bg-[#003B95]'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${item.avgProgress}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] font-bold w-10 text-right">{item.avgProgress}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-bold border ${evalStatus.color}`}>
                            {evalStatus.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Timeline Gantt View */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          {/* Gantt Toolbar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#003B95] dark:text-blue-400" />
                Trục Thời Gian Lịch Trình (14 Ngày)
              </h3>
              <p className="text-[11px] text-slate-500">
                Theo dõi tiến độ thực hiện theo từng mốc ngày bắt đầu - kết thúc
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 3);
                  setBaseDate(d);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Hôm nay
              </button>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setBaseDate((prev) => {
                      const d = new Date(prev);
                      d.setDate(d.getDate() - 7);
                      return d;
                    });
                  }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  title="7 ngày trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBaseDate((prev) => {
                      const d = new Date(prev);
                      d.setDate(d.getDate() + 7);
                      return d;
                    });
                  }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  title="7 ngày sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Gantt Matrix */}
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
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
                          ? 'bg-blue-100/70 text-[#003B95] dark:bg-blue-900/50 dark:text-blue-300 font-bold'
                          : ''
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 uppercase">{d.dayOfWeek}</div>
                      <div>{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {tasks.map((task) => {
                  return (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className="grid grid-cols-12 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                    >
                      {/* Left col */}
                      <div className="col-span-4 p-3 border-r border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="font-mono text-[10px] font-bold text-[#003B95] dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1 rounded">
                              {task.code}
                            </span>
                            <span className="text-[10.5px] text-slate-500 truncate max-w-[130px]">
                              {task.department}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#003B95] transition">
                            {task.title}
                          </p>
                        </div>
                      </div>

                      {/* Right timeline column bar */}
                      <div className="col-span-8 p-3 flex items-center relative">
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-md relative overflow-hidden">
                          <div
                            className={`h-full rounded-md transition-all duration-300 flex items-center px-2 text-[10px] font-bold text-white ${
                              task.status === 'DONE'
                                ? 'bg-emerald-500'
                                : task.status === 'IN_PROGRESS'
                                ? 'bg-[#003B95]'
                                : task.status === 'OVERDUE'
                                ? 'bg-rose-500'
                                : 'bg-slate-400'
                            }`}
                            style={{ width: `${Math.max(15, task.progress || 25)}%` }}
                          >
                            <span className="truncate">{task.progress || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
