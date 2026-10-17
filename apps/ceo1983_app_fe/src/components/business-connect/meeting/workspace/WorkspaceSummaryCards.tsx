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
    <section aria-label="Thống kê cuộc gặp" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng cuộc gặp (Sky gradient - Blue) */}
      <div className="h-32 p-4 bg-gradient-to-b from-sky-100 to-slate-50 dark:from-sky-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
        <div className="h-8 flex items-center gap-2">
          <img src="/icons/ceo1983_icon_2/users-round-1.svg" className="h-4 w-4" alt="users" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
          <div className="text-blue-600 dark:text-blue-400 text-xs font-semibold font-['Inter']">TỔNG SỐ CUỘC GẶP</div>
        </div>
        <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
          {stats.total}
        </div>
        <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
          Tất cả lịch kết nối đã tạo
        </div>
      </div>

      {/* 2. Sắp diễn ra (Violet gradient - Indigo) */}
      <div className="h-32 p-4 bg-gradient-to-b from-violet-100 to-white dark:from-violet-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
        <div className="h-8 flex items-center gap-2">
          <img src="/icons/ceo1983_icon_2/shield-check.svg" className="h-4 w-4" alt="clock" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
          <div className="text-indigo-500 dark:text-indigo-400 text-xs font-semibold font-['Inter']">SẮP DIỄN RA</div>
        </div>
        <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
          {stats.upcoming}
        </div>
        <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
          Chờ gặp gỡ giao thương
        </div>
      </div>

      {/* 3. Phân bổ hình thức (Orange gradient - Orange) */}
      <div className="h-32 p-4 bg-gradient-to-b from-orange-100 to-white dark:from-orange-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
        <div className="h-8 flex items-center gap-2">
          <img src="/icons/ceo1983_icon_2/building-2-1.svg" className="h-4 w-4" alt="venue" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
          <div className="text-orange-500 dark:text-orange-400 text-xs font-semibold font-['Inter']">HÌNH THỨC GẶP</div>
        </div>
        <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
          {stats.online} <span className="text-sm font-normal text-slate-500">Online</span> · {stats.offline} <span className="text-sm font-normal text-slate-500">Offline</span>
        </div>
        <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
          Phân bổ trực tuyến &amp; trực tiếp
        </div>
      </div>

      {/* 4. Đã hoàn thành (Green gradient - Emerald) */}
      <div className="h-32 p-4 bg-gradient-to-b from-green-100 to-white dark:from-green-950/40 dark:to-slate-900 rounded-[20px] outline outline-[0.50px] outline-slate-200 dark:outline-slate-800 flex flex-col justify-start items-start gap-2.5 overflow-hidden shadow-xs">
        <div className="h-8 flex items-center gap-2">
          <img src="/icons/ceo1983_icon_2/circle-check.svg" className="h-4 w-4" alt="check" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
          <div className="text-emerald-500 dark:text-emerald-400 text-xs font-semibold font-['Inter']">ĐÃ HOÀN THÀNH</div>
        </div>
        <div className="text-slate-900 dark:text-slate-100 text-2xl font-bold font-['Inter'] leading-7">
          {stats.completed}
        </div>
        <div className="text-slate-500 dark:text-slate-400 text-xs font-normal font-['Inter']">
          Đã gặp gỡ kết nối thành công
        </div>
      </div>
    </section>
  );
}
