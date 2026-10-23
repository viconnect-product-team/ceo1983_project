import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  CreditCard,
  Handshake,
  MapPin,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Crown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";

interface WelcomeMemberModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function WelcomeMemberModal({ forceOpen = false, onClose }: WelcomeMemberModalProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      return;
    }

    if (typeof window === "undefined") return;

    // Check if welcome popup was already shown for this user
    const userKey = user?.id ? `ceo1983_welcome_shown_${user.id}` : "ceo1983_welcome_shown";
    const hasSeen = localStorage.getItem(userKey);

    if (!hasSeen && user) {
      // Delay slightly for smooth page entrance animation
      const timer = setTimeout(() => {
        setOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [user, forceOpen]);

  const handleDismiss = (dontShowAgain: boolean = true) => {
    if (dontShowAgain && typeof window !== "undefined") {
      const userKey = user?.id ? `ceo1983_welcome_shown_${user.id}` : "ceo1983_welcome_shown";
      localStorage.setItem(userKey, "true");
      localStorage.setItem("ceo1983_welcome_shown", "true");
    }
    setOpen(false);
    onClose?.();
  };

  if (!open) return null;

  const isDark = theme === "dark";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] text-slate-900 dark:text-white transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]">
        {/* Close button */}
        <button
          type="button"
          onClick={() => handleDismiss(true)}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition cursor-pointer"
          title="Đóng"
        >
          <X className="size-4" />
        </button>

        {/* Top Header Banner with Logo & Festive Theme Glow */}
        <div className="relative w-full bg-gradient-to-br from-[#001D4A] via-[#003B95] to-[#0A2558] p-6 text-center text-white overflow-hidden shrink-0">
          {/* Decorative background glow circles */}
          <div className="absolute -top-10 -left-10 size-32 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 size-32 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />

          {/* Logo Emblem Số 8 Hoàng Gia */}
          <div className="relative mx-auto size-16 rounded-2xl bg-gradient-to-br from-[#002855] to-[#00142D] border-2 border-amber-400/50 shadow-xl flex items-center justify-center mb-3">
            <img
              src="/ceo1983-emblem-8.png"
              alt="CEO 1983 Emblem"
              className="size-13 object-contain drop-shadow"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
            <Crown className="size-8 text-amber-400" style={{ display: "none" }} />
            {/* Status dot */}
            <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[11px] font-extrabold uppercase tracking-widest mb-1.5 shadow-xs">
            <Sparkles className="size-3 text-amber-300" />
            HANOIBA · CLB DOANH NHÂN 1983
          </div>

          <h3 className="text-lg font-black tracking-tight text-white">
            Chào mừng Doanh nhân!
          </h3>
          <p className="text-xs text-blue-100 font-medium mt-0.5 line-clamp-1">
            {user?.name ? `${user.name}` : "Chào mừng Quý Hội Viên gia nhập hệ sinh thái"}
          </p>
        </div>

        {/* Feature Highlights List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          <p className="text-xs text-slate-600 dark:text-slate-300 text-center leading-relaxed">
            Nền tảng kết nối giao thương tinh hoa, số hóa danh bạ và quản trị hiệp hội chuẩn mực dành riêng cho thế hệ Doanh nhân 1983.
          </p>

          <div className="space-y-2.5">
            {/* 1. Danh thiếp số 8 */}
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
              <div className="size-9 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-[#003B95] dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-blue-900/50">
                <CreditCard className="size-4.5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Danh thiếp điện tử Số 8 độc quyền
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Chạm NFC & chia sẻ mã QR chuyên nghiệp, lưu trực tiếp danh bạ điện thoại không cần cài app.
                </p>
              </div>
            </div>

            {/* 2. Mạng lưới B2B */}
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
              <div className="size-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200 dark:border-amber-900/50">
                <Handshake className="size-4.5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Mạng lưới giao thương & Trao cơ hội B2B
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Đăng tải nhu cầu mua bán, tìm đối tác tin cậy trong cộng đồng 500+ doanh nghiệp cùng lứa tuổi.
                </p>
              </div>
            </div>

            {/* 3. Bản đồ Google Maps 2D */}
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
              <div className="size-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200 dark:border-emerald-900/50">
                <MapPin className="size-4.5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Bản đồ hội viên 2D Google Maps
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Định vị doanh nghiệp hội viên quanh bạn, tra cứu địa điểm họp và sự kiện trực quan.
                </p>
              </div>
            </div>

            {/* 4. Đào tạo & Sự kiện QR */}
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3">
              <div className="size-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5 border border-purple-200 dark:border-purple-900/50">
                <GraduationCap className="size-4.5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Khóa đào tạo & Điểm danh QR 1 chạm
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Tham gia phòng họp trực tuyến, nhận tài liệu độc quyền từ Ban Đào Tạo và điểm danh tức thì.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleDismiss(true)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#003B95] via-[#002B70] to-[#001D4A] hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-blue-900/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Bắt đầu trải nghiệm ngay</span>
            <ArrowRight className="size-4 text-amber-400" />
          </button>

          <p className="text-[10px] text-slate-400 text-center">
            Hiệp hội Doanh nghiệp Trẻ Hà Nội (HanoiBA) • CLB Doanh Nhân CEO 1983
          </p>
        </div>
      </div>
    </div>
  );
}
