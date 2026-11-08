import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  MapPin,
  Clock,
  User,
  Phone,
  Building2,
  Briefcase,
  CheckCircle2,
  QrCode,
  Share2,
  Sparkles,
  Video,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { QrCanvas } from "../member/QrCanvas";

export interface QuickRegisterMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: {
    id: string;
    title: string;
    time?: string;
    location?: string;
    isOnline?: boolean;
    department?: string;
    posterName?: string;
    qrCodeUrl?: string;
  };
  onRegisterSuccess?: (attendee: {
    name: string;
    company: string;
    role: string;
    avatar: string;
    checkedIn: boolean;
    mode: "offline" | "online";
  }) => void;
}

export function QuickRegisterMeetingModal({
  isOpen,
  onClose,
  meeting,
  onRegisterSuccess,
}: QuickRegisterMeetingModalProps) {
  const { user, member } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("Hội viên Doanh nhân");
  const [joinMode, setJoinMode] = useState<"offline" | "online">("offline");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketCode, setTicketCode] = useState("");

  useEffect(() => {
    if (user || member) {
      setFullName((member as any)?.name || (user as any)?.name || (user as any)?.displayName || "");
      setPhone((member as any)?.phone || (user as any)?.phone || "");
      setCompany((member as any)?.company || (member as any)?.companyName || (user as any)?.company || "Doanh nghiệp CEO 1983");
      setRole((member as any)?.executiveRole || (member as any)?.title || "Hội viên CLB");
    }
    if (meeting.isOnline) {
      setJoinMode("online");
    }
  }, [user, member, meeting]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      toast.error("Vui lòng điền đủ họ tên và số điện thoại liên hệ!");
      return;
    }

    setIsSubmitting(true);
    const code = `TICK-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    setTicketCode(code);

    try {
      // 1. Lưu đăng ký vào localStorage cho cuộc họp này
      const regKey = `vba_meeting_regs_${meeting.id}`;
      const existing = localStorage.getItem(regKey);
      const regList = existing ? JSON.parse(existing) : [];
      const newAttendee = {
        id: (user as any)?.id || (member as any)?.id || `att_${Date.now()}`,
        name: fullName.trim(),
        company: company.trim() || "CLB Doanh Nhân CEO 1983",
        role: role.trim() || "Hội viên",
        phone: phone.trim(),
        avatar: (member as any)?.avatar || (user as any)?.avatar || "/ceo1983-emblem-8.png",
        checkedIn: false,
        registeredAt: new Date().toISOString(),
        joinMode,
        ticketCode: code,
        note: note.trim(),
      };
      regList.unshift(newAttendee);
      localStorage.setItem(regKey, JSON.stringify(regList));

      // 2. Lưu vào Lịch hoạt động cá nhân của hội viên
      const calKey = "vba_my_registered_events";
      const calExisting = localStorage.getItem(calKey);
      const calList = calExisting ? JSON.parse(calExisting) : [];
      calList.unshift({
        id: `reg_${meeting.id}_${Date.now()}`,
        meetingId: meeting.id,
        title: meeting.title,
        time: meeting.time || "Theo thông báo Ban Tổ Chức",
        location: meeting.location || (joinMode === "online" ? "Trực tuyến qua Zoom / Google Meet" : "Keangnam Landmark 72, Hà Nội"),
        isOnline: joinMode === "online",
        ticketCode: code,
        registeredAt: new Date().toISOString(),
      });
      localStorage.setItem(calKey, JSON.stringify(calList));

      // 3. Dispatch sự kiện thông báo cập nhật
      window.dispatchEvent(new CustomEvent("ceo1983_meeting_registered", { detail: newAttendee }));

      setIsSuccess(true);
      toast.success("🎉 Đăng ký tham gia thành công! Mã vé và QR điểm danh đã sẵn sàng.");
      onRegisterSuccess?.({ ...newAttendee, mode: joinMode });
    } catch {
      toast.error("Lỗi khi ghi nhận đăng ký, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-[440px] rounded-3xl bg-white dark:bg-[#0B132B] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-amber-500/30 overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-50/80 via-white to-amber-50/40 dark:from-slate-900 dark:via-[#0B132B] dark:to-amber-950/20">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#003B95] text-amber-300 shadow-xs">
              <Calendar className="size-4.5" />
            </span>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-tight">
                {isSuccess ? "VÉ ĐIỂM DANH THAM GIA" : "ĐĂNG KÝ THAM GIA CUỘC HỌP"}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                CLB Doanh Nhân CEO 1983 (HanoiBA)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {isSuccess ? (
          /* Màn hình Thành Công & Cấp Vé QR Điểm Danh Cá Nhân */
          <div className="p-5 flex flex-col items-center text-center space-y-4">
            <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 grid place-items-center">
              <CheckCircle2 className="size-7" />
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                Đăng Ký Tham Gia Thành Công!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {meeting.title}
              </p>
            </div>

            {/* Mã QR Check-in Điểm Danh Cá Nhân */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-800/90 border-2 border-amber-400/50 shadow-md flex flex-col items-center space-y-2.5">
              <div className="px-2 py-0.5 rounded-full bg-[#003B95] text-amber-300 text-[10px] font-extrabold uppercase">
                MÃ VÉ CHECK-IN: {ticketCode}
              </div>

              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                <QrCanvas
                  value={`CEO1983:CHECKIN:${meeting.id}:${ticketCode}:${phone}`}
                  size={150}
                  dark="#003B95"
                  light="#FFFFFF"
                />
              </div>

              <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                Xuất trình mã QR này tại bàn lễ tân hoặc trước giờ bắt đầu để điểm danh tự động.
              </p>
            </div>

            <div className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Đại biểu:</span>
                <span className="font-bold text-slate-900 dark:text-white">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Hình thức:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {joinMode === "online" ? "Trực tuyến (Online)" : "Trực tiếp (Offline)"}
                </span>
              </div>
              {meeting.time && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Thời gian:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{meeting.time}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-[#003B95] hover:bg-[#002d73] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-98"
            >
              Hoàn Tất &amp; Quay Lại Mạng Lưới
            </button>
          </div>
        ) : (
          /* Form Nhập Thông Tin Đăng Ký */
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
            {/* Tóm tắt cuộc họp */}
            <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-slate-900/80 border border-blue-200/80 dark:border-slate-800 space-y-1.5">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#003B95] text-amber-300 uppercase">
                {meeting.department || "CUỘC HỌP BAN & DIỄN ĐÀN GẶP MẶT"}
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {meeting.title}
              </h4>
              <div className="flex flex-col gap-1 text-[10.5px] text-slate-600 dark:text-slate-300 pt-1">
                {meeting.time && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3 text-amber-500 shrink-0" />
                    <span>{meeting.time}</span>
                  </div>
                )}
                {meeting.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3 text-rose-500 shrink-0" />
                    <span className="truncate">{meeting.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chọn hình thức tham gia */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Hình thức tham dự <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setJoinMode("offline")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${joinMode === "offline"
                      ? "border-[#003B95] bg-blue-50 text-[#003B95] dark:border-amber-400 dark:bg-amber-950/40 dark:text-amber-300 shadow-2xs font-extrabold"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                >
                  <Building2 className="size-3.5" />
                  <span>Trực tiếp (Offline)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setJoinMode("online")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${joinMode === "online"
                      ? "border-[#003B95] bg-blue-50 text-[#003B95] dark:border-amber-400 dark:bg-amber-950/40 dark:text-amber-300 shadow-2xs font-extrabold"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                >
                  <Video className="size-3.5" />
                  <span>Trực tuyến (Online)</span>
                </button>
              </div>
            </div>

            {/* Họ tên */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Họ và tên đại biểu <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <User className="size-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  required
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-hidden font-medium"
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Số điện thoại liên hệ <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Phone className="size-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912..."
                  required
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-hidden font-medium"
                />
              </div>
            </div>

            {/* Doanh nghiệp & Chức vụ */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Doanh nghiệp
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Tên công ty..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Chức vụ
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="CEO / Chủ tịch..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden"
                />
              </div>
            </div>

            {/* Ghi chú / Câu hỏi */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Câu hỏi cho Diễn giả / Ban Điều Hành (nếu có)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Nêu mong muốn kết nối hoặc vấn đề thảo luận..."
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-hidden resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#003B95] hover:bg-[#002d73] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? "Đang ghi nhận..." : "Xác Nhận Tham Gia Ngay"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
