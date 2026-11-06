import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Calendar,
  Clock,
  Handshake,
  ArrowRight,
  X,
  Bot,
  Heart,
  Award,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchNestApi } from "@/lib/api-client";

interface FirstDayAiWelcomeModalProps {
  onOpenTour?: () => void;
}

export function FirstDayAiWelcomeModal({ onOpenTour }: FirstDayAiWelcomeModalProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Realtime events & opportunities states
  const [todayEvent, setTodayEvent] = useState<any>(null);
  const [upcomingEvent, setUpcomingEvent] = useState<any>(null);
  const [hotOpportunity, setHotOpportunity] = useState<any>(null);
  const [loadingRealtime, setLoadingRealtime] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const welcomedKey = "vba_daily_ai_welcomed_date";
      const welcomedDate = localStorage.getItem(welcomedKey);
      const todayStr = new Date().toISOString().slice(0, 10);

      // Nếu lần đầu tiên đăng nhập / mở app trong ngày hôm nay
      if (welcomedDate !== todayStr) {
        // Tải dữ liệu realtime sự kiện và cơ hội
        loadRealtimeData(todayStr);

        // Trì hoãn 600ms để màn hình chính tải xong mượt mà
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const loadRealtimeData = async (todayStr: string) => {
    setLoadingRealtime(true);
    try {
      // 1. Tải sự kiện realtime
      const evRes = await fetchNestApi<any[]>("/events").catch(() => []);
      if (Array.isArray(evRes) && evRes.length > 0) {
        // Tìm sự kiện diễn ra hôm nay
        const evToday = evRes.find((e: any) => {
          const dateStr = String(e.date || e.startDate || "").slice(0, 10);
          return dateStr === todayStr;
        });

        if (evToday) {
          setTodayEvent(evToday);
        } else {
          // Tìm sự kiện sắp diễn ra gần nhất
          const sortedUpcoming = evRes
            .filter((e: any) => {
              const dateStr = String(e.date || e.startDate || "").slice(0, 10);
              return dateStr >= todayStr;
            })
            .sort((a: any, b: any) => {
              return String(a.date || "").localeCompare(String(b.date || ""));
            });
          setUpcomingEvent(sortedUpcoming[0] || evRes[0]);
        }
      }

      // 2. Tải cơ hội giao thương realtime
      const oppRes = await fetchNestApi<any[]>("/b2b/opportunities").catch(() => []);
      if (Array.isArray(oppRes) && oppRes.length > 0) {
        const activeOpps = oppRes.filter((o: any) => o.status !== "closed" && o.status !== "cancelled");
        if (activeOpps.length > 0) {
          setHotOpportunity(activeOpps[0]);
        }
      }
    } catch (err) {
      console.warn("[FirstDayAiWelcomeModal] Lỗi nạp dữ liệu realtime:", err);
    } finally {
      setLoadingRealtime(false);
    }
  };

  const handleDismiss = () => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem("vba_daily_ai_welcomed_date", todayStr);
    } catch {}
    setIsOpen(false);
  };

  const handleStartTour = () => {
    handleDismiss();
    if (onOpenTour) {
      onOpenTour();
    }
  };

  if (!isOpen) return null;

  const memberName = user?.fullName || user?.name || "Quý Doanh Nhân";

  // Format budget text
  const formatBudget = (val?: any) => {
    if (!val) return "Thỏa thuận B2B";
    const num = Number(val);
    if (isNaN(num) || num <= 0) return "Thỏa thuận B2B";
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} Tỷ VNĐ`;
    }
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(0)} Tr VNĐ`;
    }
    return `${num.toLocaleString("vi-VN")} VNĐ`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* 
        Container chính: Tuyệt đối KHÔNG làm border bao quanh AI và text theo đúng chỉ đạo người dùng.
        Hỗ trợ Theme Sáng (Light Theme) với nền trắng, chữ đậm, bóng đổ mềm mại, không bị tối đen.
      */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden text-slate-900 dark:text-white flex flex-col transition-colors">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition z-10 cursor-pointer"
          title="Đóng lời chào"
        >
          <X className="size-5" />
        </button>

        {/* THIẾT KẾ: ICON AI MỘT BÊN - BẢNG TIN NHẮN MỘT BÊN ("GIÁO VIÊN ĐỨNG CẠNH BẢNG", KHÔNG DÙNG BORDER) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6 items-center">
          {/* CỘT TRÁI: AVATAR AI GIÁO VIÊN ĐỨNG CHÀO (KHÔNG BORDER) */}
          <div className="sm:col-span-4 flex flex-col items-center justify-center text-center">
            <div className="relative mb-2">
              <div className="size-24 sm:size-28 rounded-2xl overflow-hidden shadow-lg shadow-blue-900/10 dark:shadow-black/40">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
                  alt="AI Tutor Avatar"
                  className="size-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm whitespace-nowrap">
                <Heart className="size-2.5 fill-current text-white" />
                <span>Chào Buổi Sáng</span>
              </div>
            </div>

            <h4 className="font-bold text-xs text-blue-900 dark:text-amber-300 mt-1">Cố Vấn Số CEO 1983</h4>
            <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Đồng hành cùng Doanh nhân</span>
          </div>

          {/* CỘT PHẢI: BẢNG LỜI NHẮN THỜI GIAN THỰC (KHÔNG BORDER) */}
          <div className="sm:col-span-8 space-y-3 font-sans">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-300 font-extrabold text-[10px] uppercase">
                  Điểm Tin Hôm Nay
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Hiệp hội Doanh nhân CEO 1983</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
                Chào mừng Doanh nhân {memberName}!
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Hôm nay Bạn có khỏe không? Chúc Bạn một ngày tràn đầy năng lượng, vạn sự hanh thông và kết nối giao thương thắng lợi cùng mạng lưới!
            </p>

            {/* KHỐI LỊCH TRÌNH & CƠ HỘI REALTIME NỔI BẬT (KHÔNG DÙNG BORDER CẮT RỜI) */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2 text-xs">
              {/* 1. Lịch sự kiện (Hôm nay hoặc Sắp tới) */}
              {todayEvent ? (
                <div className="flex items-start gap-2">
                  <Calendar className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-bold text-blue-900 dark:text-blue-300 block">Sự kiện hôm nay:</span>
                    <span className="text-slate-700 dark:text-slate-200 font-medium truncate block">
                      {todayEvent.title} {todayEvent.time ? `(lúc ${todayEvent.time})` : ""}
                    </span>
                    {todayEvent.place && (
                      <span className="text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3" />
                        <span className="truncate">{todayEvent.place}</span>
                      </span>
                    )}
                  </div>
                </div>
              ) : upcomingEvent ? (
                <div className="flex items-start gap-2">
                  <Calendar className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-bold text-[#003B95] dark:text-cyan-400 block">Sự kiện sắp tới:</span>
                    <span className="text-slate-700 dark:text-slate-200 font-medium truncate block">
                      {upcomingEvent.title}
                    </span>
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Diễn ra ngày {upcomingEvent.date ? new Date(upcomingEvent.date).toLocaleDateString("vi-VN") : "trong tuần"}
                      {upcomingEvent.place ? ` tại ${upcomingEvent.place}` : ""}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Calendar className="size-3.5 text-blue-500" />
                  <span>Hôm nay: Sẵn sàng kết nối giao thương và mở rộng mạng lưới B2B.</span>
                </div>
              )}

              {/* 2. Cơ hội giao thương realtime nổi bật */}
              {hotOpportunity ? (
                <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60 dark:border-white/5">
                  <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block">Cơ hội mới nổi bật:</span>
                    <span className="text-slate-700 dark:text-slate-200 font-medium truncate block">
                      {hotOpportunity.title}
                    </span>
                    <span className="text-[10.5px] font-bold text-blue-700 dark:text-cyan-300 block">
                      Ngân sách: {formatBudget(hotOpportunity.budget_max || hotOpportunity.budget_min || hotOpportunity.budget)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-slate-300">
                  <Handshake className="size-3.5 text-emerald-500" />
                  <span>Sàn B2B: Nhiều cơ hội kinh doanh mới đang chờ đón Bạn khai phá.</span>
                </div>
              )}
            </div>

            {/* Nút Tương tác */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleStartTour}
                className="w-full sm:w-auto flex-1 py-2 px-3 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition"
              >
                <Sparkles className="size-3.5" />
                <span>Khám Phá Tính Năng (Tour)</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition text-center"
              >
                Bắt đầu dùng App
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
