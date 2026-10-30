import React, { useEffect, useState } from "react";
import {
  Bell,
  BellRing,
  Calendar,
  Clock,
  MapPin,
  X,
  Volume2,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  CalendarReminderItem,
  playCeoAlarmChime,
} from "@/lib/calendar-reminder";
import { useNavigate } from "@tanstack/react-router";

export interface ActiveReminderNotice {
  id: string;
  type: "morning_digest" | "event_alarm";
  title: string;
  subtitle: string;
  items: CalendarReminderItem[];
  triggeredAt: string;
}

interface CeoFacebookReminderBannerProps {
  notice: ActiveReminderNotice | null;
  onDismiss: () => void;
  onSnooze?: (minutes: number) => void;
}

export const CeoFacebookReminderBanner: React.FC<CeoFacebookReminderBannerProps> = ({
  notice,
  onDismiss,
  onSnooze,
}) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(100);

  // Phát âm thanh khi có notice mới
  useEffect(() => {
    if (notice) {
      playCeoAlarmChime();
      setProgress(100);
      const startTime = Date.now();
      const duration = 15000; // 15 giây tự đóng

      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remainPercent = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remainPercent);
        if (remainPercent <= 0) {
          clearInterval(timer);
          onDismiss();
        }
      }, 100);

      return () => clearInterval(timer);
    }
  }, [notice, onDismiss]);

  if (!notice) return null;

  const firstItem = notice.items[0];
  const isMorningDigest = notice.type === "morning_digest";

  return (
    <aside
      aria-label="Thông báo nhắc lịch CEO 1983"
      className="fixed top-3 inset-x-3 sm:inset-x-auto sm:right-4 sm:max-w-md z-[99999] animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl border-2 border-red-500/30 dark:border-amber-400/40 overflow-hidden ring-4 ring-black/5 dark:ring-white/5">
        {/* Header bar kiểu thông báo Facebook */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-[#DC2626] via-[#B8860B] to-[#003B95] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-white text-red-600 shadow-sm animate-bounce">
              <BellRing className="size-4" />
            </span>
            <div className="leading-tight">
              <div className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <span>{isMorningDigest ? "🔔 Nhắc lịch 7:00 Sáng" : "⏰ Nhắc Lịch Sắp Diễn Ra"}</span>
                <span className="size-2 rounded-full bg-amber-300 animate-ping" />
              </div>
              <div className="text-[10px] text-white/85">Hiệp hội Doanh nhân CEO 1983</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={playCeoAlarmChime}
              className="p-1 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer"
              title="Phát lại chuông"
            >
              <Volume2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Nội dung thông báo kiểu Facebook Post / Pop-up */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            {/* Icon Avatar */}
            <div className="size-12 rounded-2xl bg-gradient-to-br from-blue-900 to-[#003B95] text-amber-400 flex items-center justify-center shrink-0 shadow-md border border-amber-400/30">
              <Calendar className="size-6" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                {notice.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                {notice.subtitle}
              </p>
            </div>
          </div>

          {/* Chi tiết lịch trình item */}
          {firstItem && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-[#003B95] dark:text-amber-400 uppercase tracking-wide flex items-center gap-1">
                  <Clock className="size-3.5" />
                  <span>{firstItem.timeStr} · Hôm nay</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                  {firstItem.sourceType === "event"
                    ? "Sự kiện CLB"
                    : firstItem.sourceType === "training"
                    ? "Đào tạo DN"
                    : "Họp kết nối"}
                </span>
              </div>

              <div className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                {firstItem.title}
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="size-3 text-red-500 shrink-0" />
                <span className="truncate">{firstItem.location}</span>
              </div>
            </div>
          )}

          {/* Nhiều sự kiện trong ngày (nếu là morning digest) */}
          {notice.items.length > 1 && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>Và còn {notice.items.length - 1} lịch trình quan trọng khác trong ngày...</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onDismiss();
                navigate({ to: "/association/calendar" });
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#DC2626] to-[#003B95] text-white text-xs font-black shadow-md hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Xem lịch trình chi tiết</span>
              <ChevronRight className="size-3.5" />
            </button>

            {onSnooze && (
              <button
                type="button"
                onClick={() => onSnooze(15)}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Nhắc lại sau 15p
              </button>
            )}

            <button
              type="button"
              onClick={onDismiss}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>

        {/* Thanh đếm ngược tự đóng (ProgressBar) */}
        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-[#003B95] transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </aside>
  );
};

