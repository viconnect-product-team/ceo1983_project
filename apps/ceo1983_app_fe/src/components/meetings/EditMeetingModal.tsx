import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Phone,
  Building2,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { GoogleMapAddressPicker } from "@/components/common/GoogleMapAddressPicker";
import type { ConnectionMeetingItem } from "@/routes/business-connect.meetings.index";

export interface EditMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  meeting: ConnectionMeetingItem | null;
}

function parseDateToInputFormat(dStr?: string): string {
  if (!dStr) return new Date().toISOString().split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) return dStr;
  // If DD/MM/YYYY
  const parts = dStr.split("/");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(dStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return new Date().toISOString().split("T")[0];
}

export function EditMeetingModal({
  isOpen,
  onClose,
  onSuccess,
  meeting,
}: EditMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [hostName, setHostName] = useState("");
  const [hostCompany, setHostCompany] = useState("");
  const [hostPhone, setHostPhone] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [partnerCompany, setPartnerCompany] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:30");
  const [venueType, setVenueType] = useState<"offline" | "online">("offline");
  const [onlinePlatform, setOnlinePlatform] = useState<"uniwork" | "meet" | "zoom" | "custom">("uniwork");
  const [venue, setVenue] = useState("");
  const [onlineUrl, setOnlineUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (meeting && isOpen) {
      setTitle(meeting.title || "");
      setStatus(meeting.status || "scheduled");
      setHostName(meeting.hostName || "");
      setHostCompany(meeting.hostCompany || "");
      setHostPhone(meeting.hostPhone || "");
      setPartnerName(meeting.partnerName || "");
      setPartnerPhone(meeting.partnerPhone || "");
      setPartnerCompany(meeting.partnerCompany || "");
      setDate(parseDateToInputFormat(meeting.date));
      setTime(meeting.time || "09:30");
      setVenueType(meeting.venueType || "offline");
      setOnlinePlatform((meeting.onlinePlatform as any) || "uniwork");
      setVenue(meeting.venue || "");
      setOnlineUrl(meeting.onlineUrl || "");
      setNotes(meeting.notes || "");
    }
  }, [meeting, isOpen]);

  if (!isOpen || !meeting) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề cuộc gặp");
      return;
    }
    if (!partnerName.trim()) {
      toast.error("Vui lòng nhập tên đối tác kết nối");
      return;
    }

    setLoading(true);
    try {
      const updatedFields = {
        title: title.trim(),
        hostName: hostName.trim(),
        hostCompany: hostCompany.trim() || undefined,
        hostPhone: hostPhone.trim() || undefined,
        partnerName: partnerName.trim(),
        partnerPhone: partnerPhone.trim() || undefined,
        partnerCompany: partnerCompany.trim() || undefined,
        date,
        time,
        venueType,
        venue: venueType === "online" ? onlineUrl.trim() || "Phòng họp trực tuyến" : venue.trim(),
        onlineUrl: venueType === "online" ? onlineUrl.trim() : undefined,
        onlinePlatform: venueType === "online" ? onlinePlatform : undefined,
        notes: notes.trim() || undefined,
        status,
      };

      // 1. Gửi request PATCH lên backend NestJS
      try {
        await fetchNestApi(`/meetings/${meeting.id}`, {
          method: "PATCH",
          body: updatedFields,
        });
      } catch (err: any) {
        console.warn("Backend update error (saving locally as fallback):", err?.message);
      }

      // 2. Cập nhật localStorage
      const storageKeys = ["ceo1983_meetings_history", "vione_meetings_history"];
      for (const k of storageKeys) {
        try {
          const list = JSON.parse(localStorage.getItem(k) || "[]");
          const idx = list.findIndex((m: any) => String(m.id) === String(meeting.id));
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...updatedFields };
            localStorage.setItem(k, JSON.stringify(list));
          }
        } catch {}
      }

      // Cập nhật cuộc hẹn trên mobile nếu có
      try {
        const vbaApps = JSON.parse(localStorage.getItem("vba_connection_appointments") || "[]");
        const aIdx = vbaApps.findIndex((m: any) => String(m.id) === String(meeting.id));
        if (aIdx >= 0) {
          vbaApps[aIdx] = { ...vbaApps[aIdx], ...updatedFields };
          localStorage.setItem("vba_connection_appointments", JSON.stringify(vbaApps));
        }
      } catch {}

      toast.success("✓ Đã cập nhật thông tin cuộc gặp thành công!");
      window.dispatchEvent(new CustomEvent("ceo1983:meetings-updated"));
      window.dispatchEvent(new CustomEvent("vione:meetings-updated"));
      window.dispatchEvent(new CustomEvent("vba.meeting.changed"));
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi cập nhật cuộc gặp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 px-6 py-4.5 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Chỉnh Sửa Cuộc Gặp
              </span>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Cập Nhật Lịch Gặp 1-on-1
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          {/* Title & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Tiêu đề cuộc gặp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Gặp gỡ kết nối & Trao đổi hợp tác..."
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:outline-none cursor-pointer"
              >
                <option value="scheduled">Đã lên lịch</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="completed">Đã hoàn tất</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Host info */}
          <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              <User className="h-3.5 w-3.5" />
              <span>Thông Tin Người Chủ Trì (Host)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] text-muted-foreground">Họ tên chủ trì</label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Doanh nghiệp / Ban</label>
                <input
                  type="text"
                  value={hostCompany}
                  onChange={(e) => setHostCompany(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Số điện thoại</label>
                <input
                  type="text"
                  value={hostPhone}
                  onChange={(e) => setHostPhone(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Partner info */}
          <div className="rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              <User className="h-3.5 w-3.5" />
              <span>Thông Tin Đối Tác Kết Nối (Partner) <span className="text-rose-500">*</span></span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] text-muted-foreground">Họ tên đối tác</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Doanh nghiệp đối tác</label>
                <input
                  type="text"
                  value={partnerCompany}
                  onChange={(e) => setPartnerCompany(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Số điện thoại đối tác</label>
                <input
                  type="text"
                  value={partnerPhone}
                  onChange={(e) => setPartnerPhone(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-500" />
                <span>Ngày gặp</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>Giờ gặp</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Venue Type & Details */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Hình thức gặp gỡ</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVenueType("offline")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  venueType === "offline"
                    ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>Trực tiếp (Offline)</span>
              </button>
              <button
                type="button"
                onClick={() => setVenueType("online")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  venueType === "online"
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Video className="h-4 w-4" />
                <span>Trực tuyến (Online)</span>
              </button>
            </div>

            {venueType === "offline" ? (
              <div className="pt-1 space-y-1">
                <GoogleMapAddressPicker
                  label="Địa điểm trực tiếp"
                  required
                  value={venue}
                  onChange={(addr) => setVenue(addr)}
                  placeholder="VD: Văn phòng Hiệp hội CEO 1983, Tòa V-Tower, 649 Kim Mã, Hà Nội"
                  showQuickLocations={true}
                />
              </div>
            ) : (
              <div className="pt-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-muted-foreground">Nền tảng</label>
                    <select
                      value={onlinePlatform}
                      onChange={(e) => setOnlinePlatform(e.target.value as any)}
                      className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none cursor-pointer"
                    >
                      <option value="uniwork">Uniwork Meet (Tích hợp)</option>
                      <option value="meet">Google Meet</option>
                      <option value="zoom">Zoom Meeting</option>
                      <option value="custom">Nền tảng khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground">Liên kết phòng họp</label>
                    <input
                      type="text"
                      value={onlineUrl}
                      onChange={(e) => setOnlineUrl(e.target.value)}
                      placeholder="https://meet.uniwork.space/..."
                      className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-amber-500" />
              <span>Ghi chú / Mục tiêu kết nối</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Trao đổi hợp tác cung ứng dịch vụ, giới thiệu hội viên..."
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-black shadow-md shadow-amber-500/20 cursor-pointer transition bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5 text-slate-950" />
              <span>{loading ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
