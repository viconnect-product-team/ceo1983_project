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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface FirstDayAiWelcomeModalProps {
  onOpenTour?: () => void;
}

export function FirstDayAiWelcomeModal({ onOpenTour }: FirstDayAiWelcomeModalProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const welcomedKey = "vba_first_day_welcomed_date";
      const welcomedDate = localStorage.getItem(welcomedKey);
      const todayStr = new Date().toISOString().slice(0, 10);

      // Nếu chưa từng được chào mừng vào ngày đầu tiên đăng nhập
      if (!welcomedDate) {
        // Trì hoãn 800ms để màn hình chính tải xong mượt mà
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleDismiss = () => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem("vba_first_day_welcomed_date", todayStr);
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-slate-950 rounded-3xl border-2 border-amber-500/50 shadow-2xl p-6 overflow-hidden text-white flex flex-col">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition z-10"
        >
          <X className="size-5" />
        </button>

        {/* THIẾT KẾ ĐẶC QUYỀN: ICON AI MỘT BÊN - BẢNG TIN NHẮN MỘT BÊN (GIÁO VIÊN ĐỨNG CẠNH BẢNG) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          {/* CỘT TRÁI: ICON / AVATAR AI GIÁO VIÊN ĐỨNG CHÀO */}
          <div className="sm:col-span-4 flex flex-col items-center justify-center text-center">
            <div className="relative mb-2">
              <div className="size-28 sm:size-32 rounded-3xl p-1 bg-gradient-to-tr from-amber-400 via-amber-200 to-blue-500 shadow-xl shadow-amber-500/20">
                <div className="size-full rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
                    alt="AI Tutor Avatar"
                    className="size-full object-cover object-top"
                  />
                </div>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Heart className="size-3 fill-current text-rose-700" />
                <span>Chào Bạn Mới</span>
              </div>
            </div>

            <h4 className="font-bold text-xs text-amber-300">Cố Vấn Số CEO 1983</h4>
            <span className="text-[10px] text-slate-400">Trợ lý đồng hành hội viên</span>
          </div>

          {/* CỘT PHẢI: BẢNG LỜI NHẮN NGÀY ĐẦU TIÊN CẠNH GIÁO VIÊN */}
          <div className="sm:col-span-8 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-sans">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold text-[10px] uppercase font-mono">
                  Ngày Đầu Đăng Nhập
                </span>
                <span className="text-xs text-slate-400">Hội viên chính thức HanoiBA</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                Chào mừng Doanh nhân {memberName}!
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Hôm nay Bạn có khỏe không? Chúc Bạn một ngày tràn đầy năng lượng, vạn sự hanh thông và kết nối giao thương thắng lợi cùng các CEO 1983!
            </p>

            {/* Khung Lịch trình hôm nay */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
              <div className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Calendar className="size-3.5 text-amber-400" />
                <span>Lịch trình giao thương hôm nay của Bạn:</span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-1 pl-5">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3 text-blue-400 shrink-0" />
                  <span><strong>14:30:</strong> Lịch kết nối 1-on-1 & trao đổi cơ hội kinh doanh.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Handshake className="size-3 text-emerald-400 shrink-0" />
                  <span><strong>Sự kiện:</strong> Cafe Doanh Nhân CEO 1983 vào sáng Thứ Bảy.</span>
                </div>
              </div>
            </div>

            {/* Nút Tương tác */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleStartTour}
                className="w-full sm:w-auto flex-1 py-2 px-3 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition"
              >
                <Sparkles className="size-3.5" />
                <span>Xem Hướng Dẫn Thao Tác (Tour)</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto py-2 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer transition text-center"
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
