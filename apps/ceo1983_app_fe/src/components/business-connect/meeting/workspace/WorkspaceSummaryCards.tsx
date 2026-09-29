import { useMemo } from "react";
import { Users2, Clock, CheckCircle2, Video } from "lucide-react";

export interface MeetingItemLike {
  id: string;
  title?: string;
  status?: string;
  venueType?: "offline" | "online" | string;
  date?: string;
}

export function WorkspaceSummaryCards({ meetings = [] }: { meetings?: MeetingItemLike[] }) {
  const stats = useMemo(() => {
    let list = meetings;
    if ((!list || list.length === 0) && typeof window !== "undefined") {
      try {
        const stored =
          localStorage.getItem("ceo1983_meetings_history") ||
          localStorage.getItem("vione_meetings_history") ||
          "[]";
        list = JSON.parse(stored);
      } catch {
        list = [];
      }
    }

    const total = list.length;
    const upcoming = list.filter((m) => {
      const s = (m.status || "").toLowerCase();
      return s === "scheduled" || s === "upcoming" || s === "pending" || !s;
    }).length;
    const completed = list.filter((m) => (m.status || "").toLowerCase() === "completed").length;
    const online = list.filter((m) => (m.venueType || "").toLowerCase() === "online").length;
    const offline = total - online;

    return { total, upcoming, completed, online, offline };
  }, [meetings]);

  return (
    <section aria-label="Thống kê cuộc gặp" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* 1. Tổng cuộc gặp */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition">
        <div className="flex items-center justify-between text-muted-foreground mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">Tổng Cuộc Gặp</span>
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
            <Users2 className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-black tabular-nums text-foreground">{stats.total}</div>
        <p className="text-[11px] text-muted-foreground mt-0.5">Tất cả lịch kết nối đã tạo</p>
      </div>

      {/* 2. Sắp diễn ra */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-amber-500/40 transition">
        <div className="flex items-center justify-between text-muted-foreground mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Sắp Diễn Ra</span>
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-black tabular-nums text-foreground">{stats.upcoming}</div>
        <p className="text-[11px] text-muted-foreground mt-0.5">Chờ gặp gỡ trao đổi</p>
      </div>

      {/* 3. Đã hoàn thành */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-emerald-500/40 transition">
        <div className="flex items-center justify-between text-muted-foreground mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Đã Hoàn Thành</span>
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-black tabular-nums text-foreground">{stats.completed}</div>
        <p className="text-[11px] text-muted-foreground mt-0.5">Đã gặp gỡ thành công</p>
      </div>

      {/* 4. Trực tuyến / Trực tiếp */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-purple-500/40 transition">
        <div className="flex items-center justify-between text-muted-foreground mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Hình Thức</span>
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
            <Video className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black tabular-nums text-foreground">{stats.online}</span>
          <span className="text-xs text-muted-foreground">Online · {stats.offline} Offline</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">Phân bổ theo hình thức</p>
      </div>
    </section>
  );
}
