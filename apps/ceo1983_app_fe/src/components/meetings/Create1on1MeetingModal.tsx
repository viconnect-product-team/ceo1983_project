import { useState, useEffect } from "react";
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
  Bell,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export interface Create1on1MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function Create1on1MeetingModal({
  isOpen,
  onClose,
  onSuccess,
}: Create1on1MeetingModalProps) {
  const [title, setTitle] = useState("Gặp gỡ kết nối & Trao đổi cơ hội hợp tác");
  const [hostName, setHostName] = useState("Nguyễn Văn Cường (Ban Thành Viên)");
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [partnerCompany, setPartnerCompany] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [time, setTime] = useState("09:30");
  const [venueType, setVenueType] = useState<"offline" | "online">("offline");
  const [venue, setVenue] = useState(
    "Văn phòng Hiệp hội CEO 1983, Tòa V-Tower, 649 Kim Mã, Hà Nội"
  );
  const [onlineUrl, setOnlineUrl] = useState("https://meet.jit.si/CEO1983_Connect_1on1");
  const [reminderTier, setReminderTier] = useState<number>(2);
  const [notes, setNotes] = useState(
    "Trao đổi nhu cầu cung ứng nguyên vật liệu & giới thiệu các đối tác tiềm năng trong Hiệp hội."
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !partnerName.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và tên đối tác kết nối!");
      return;
    }

    const meetingId = `meet_1on1_${Date.now()}`;
    const newRecord = {
      id: meetingId,
      title: title.trim(),
      hostName: hostName.trim(),
      partnerName: partnerName.trim(),
      partnerPhone: partnerPhone.trim() || undefined,
      partnerCompany: partnerCompany.trim() || undefined,
      date,
      time,
      venueType,
      venue:
        venueType === "online"
          ? onlineUrl.trim() || "https://meet.jit.si/CEO1983_Connect_1on1"
          : venue.trim(),
      onlineUrl: venueType === "online" ? onlineUrl.trim() : undefined,
      reminderTier,
      notes: notes.trim() || undefined,
      status: "scheduled",
      isAgreed: true,
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Lưu vào lịch sử cuộc gặp CEO 1983
      const existingCeo = JSON.parse(
        localStorage.getItem("ceo1983_meetings_history") || "[]"
      );
      existingCeo.unshift(newRecord);
      localStorage.setItem(
        "ceo1983_meetings_history",
        JSON.stringify(existingCeo)
      );

      // 2. Lưu vào lịch sử cuộc gặp ViOne
      const existingVione = JSON.parse(
        localStorage.getItem("vione_meetings_history") || "[]"
      );
      existingVione.unshift(newRecord);
      localStorage.setItem(
        "vione_meetings_history",
        JSON.stringify(existingVione)
      );

      // 3. Đồng bộ vào lịch cá nhân (Saved Calendar Events)
      const calendarEvent = {
        id: `meeting_${meetingId}`,
        title: title.trim(),
        startsAt: `${date}T${time}:00`,
        dueAt: `${date}T${time}:00`,
        location:
          venueType === "online"
            ? `Trực tuyến: ${onlineUrl}`
            : venue.trim(),
        description: `Gặp gỡ kết nối 1-on-1 với ${partnerName.trim()}${
          partnerCompany ? ` (${partnerCompany})` : ""
        }. Ghi chú: ${notes.trim()}`,
        organizer: hostName.trim(),
        isOnline: venueType === "online",
        type: "meeting",
        kind: "meeting",
      };

      const existingCalCeo = JSON.parse(
        localStorage.getItem("ceo1983_saved_calendar_events") || "[]"
      );
      existingCalCeo.unshift(calendarEvent);
      localStorage.setItem(
        "ceo1983_saved_calendar_events",
        JSON.stringify(existingCalCeo)
      );

      const existingCalVione = JSON.parse(
        localStorage.getItem("vione_saved_calendar_events") || "[]"
      );
      existingCalVione.unshift(calendarEvent);
      localStorage.setItem(
        "vione_saved_calendar_events",
        JSON.stringify(existingCalVione)
      );

      // 4. Bắn sự kiện cập nhật thời gian thực
      window.dispatchEvent(new CustomEvent("ceo1983:calendar-updated"));
      window.dispatchEvent(new CustomEvent("vione:meetings-updated"));

      toast.success(
        `✓ Đã lên lịch cuộc gặp kết nối với "${partnerName.trim()}" thành công!`
      );
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu cuộc gặp kết nối");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Tạo Cuộc Gặp Kết Nối 1-on-1
              </h3>
              <p className="text-xs text-muted-foreground">
                Đồng bộ trực tiếp với Gặp gỡ kết nối trên App CEO 1983 & ViOne Connect
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tiêu đề cuộc gặp */}
          <div>
            <label className="font-bold text-foreground block mb-1">
              Chủ đề / Mục đích cuộc gặp <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Trao đổi hợp tác chuỗi cung ứng vật tư..."
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
          </div>

          {/* Người chủ trì & Đối tác */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-primary" /> Người chủ trì (Host)
              </label>
              <input
                type="text"
                required
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Tên hội viên chủ trì"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-emerald-600" /> Đối tác kết nối (Invitee) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Tên đối tác hoặc doanh nhân..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
              />
            </div>
          </div>

          {/* Điện thoại & Doanh nghiệp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground block mb-1 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Số điện thoại đối tác
              </label>
              <input
                type="tel"
                value={partnerPhone}
                onChange={(e) => setPartnerPhone(e.target.value)}
                placeholder="VD: 0983 123 456"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-foreground block mb-1 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Công ty / Doanh nghiệp
              </label>
              <input
                type="text"
                value={partnerCompany}
                onChange={(e) => setPartnerCompany(e.target.value)}
                placeholder="VD: Công ty CP Công nghệ ViOne"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
              />
            </div>
          </div>

          {/* Ngày & Giờ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Ngày gặp
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary" /> Giờ gặp
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
              />
            </div>
          </div>

          {/* Hình thức cuộc gặp */}
          <div>
            <label className="font-bold text-foreground block mb-1">
              Hình thức gặp gỡ
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVenueType("offline")}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2 px-3 transition cursor-pointer font-medium ${
                  venueType === "offline"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" /> Gặp Trực Tiếp (Offline)
              </button>
              <button
                type="button"
                onClick={() => setVenueType("online")}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2 px-3 transition cursor-pointer font-medium ${
                  venueType === "online"
                    ? "border-blue-500 bg-blue-500/10 text-blue-600 font-bold shadow-xs"
                    : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Video className="h-3.5 w-3.5" /> Họp Trực Tuyến (Online)
              </button>
            </div>
          </div>

          {/* Địa điểm hoặc Link online */}
          {venueType === "offline" ? (
            <div>
              <label className="font-semibold text-foreground block mb-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Địa điểm hẹn gặp
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="VD: Highlands Coffee Tòa V-Tower, 649 Kim Mã, Hà Nội"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
              />
            </div>
          ) : (
            <div>
              <label className="font-semibold text-foreground block mb-1 flex items-center gap-1">
                <Video className="h-3.5 w-3.5 text-blue-600" /> Đường dẫn phòng họp trực tuyến (Jitsi / Google Meet / Zoom)
              </label>
              <input
                type="url"
                value={onlineUrl}
                onChange={(e) => setOnlineUrl(e.target.value)}
                placeholder="https://meet.jit.si/CEO1983_Connect_1on1"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
              />
            </div>
          )}

          {/* Báo thức & Nhắc nhở */}
          <div>
            <label className="font-semibold text-foreground block mb-1 flex items-center gap-1">
              <Bell className="h-3.5 w-3.5 text-amber-500" /> Báo thức nhắc nhở
            </label>
            <select
              value={reminderTier}
              onChange={(e) => setReminderTier(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            >
              <option value={1}>Nhắc trước 15 phút</option>
              <option value={2}>Nhắc trước 1 giờ & trước 15 phút (Khuyên dùng)</option>
              <option value={3}>Nhắc trước 1 ngày, 2 giờ & 30 phút</option>
              <option value={4}>Báo thức VIP đa kênh (In-app + Email)</option>
            </select>
          </div>

          {/* Ghi chú mục tiêu */}
          <div>
            <label className="font-semibold text-foreground block mb-1 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Ghi chú cơ hội kết nối & mục tiêu
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Tìm hiểu chính sách chiết khấu đại lý, kết nối đối tác công nghệ..."
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-xl px-5 py-2 text-xs font-bold shadow-md cursor-pointer transition hover:bg-blue-700 bg-blue-600 text-white"
            >
              Lên Lịch Cuộc Gặp Kết Nối
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
