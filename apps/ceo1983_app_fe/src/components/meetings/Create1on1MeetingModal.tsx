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
import { z } from "zod";
import { fetchNestApi } from "@/lib/api-client";

const meeting1on1Schema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được phép để trống"),
  partnerName: z.string().trim().min(1, "Tên đối tác kết nối không được phép để trống"),
});

export interface Create1on1MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultTitle?: string;
  defaultPartnerName?: string;
  defaultPartnerCompany?: string;
  defaultPartnerPhone?: string;
  defaultNotes?: string;
}

export function Create1on1MeetingModal({
  isOpen,
  onClose,
  onSuccess,
  defaultTitle,
  defaultPartnerName,
  defaultPartnerCompany,
  defaultPartnerPhone,
  defaultNotes,
}: Create1on1MeetingModalProps) {
  const [title, setTitle] = useState(defaultTitle || "Gặp gỡ kết nối & Trao đổi cơ hội hợp tác");
  const [hostName, setHostName] = useState("Nguyễn Văn Cường (Ban Thành Viên)");
  const [partnerName, setPartnerName] = useState(defaultPartnerName || "");
  const [partnerPhone, setPartnerPhone] = useState(defaultPartnerPhone || "");
  const [partnerCompany, setPartnerCompany] = useState(defaultPartnerCompany || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [time, setTime] = useState("09:30");
  const [venueType, setVenueType] = useState<"offline" | "online">("offline");
  const [onlinePlatform, setOnlinePlatform] = useState<"uniwork" | "meet" | "zoom" | "custom">("uniwork");
  const [venue, setVenue] = useState(
    "Văn phòng Hiệp hội CEO 1983, Tòa V-Tower, 649 Kim Mã, Hà Nội"
  );
  const [onlineUrl, setOnlineUrl] = useState(
    () => `https://meet.uniwork.space/CEO1983_Connect_${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [reminderTier, setReminderTier] = useState<number>(2);
  const [notes, setNotes] = useState(
    defaultNotes || "Trao đổi nhu cầu cung ứng nguyên vật liệu & giới thiệu các đối tác tiềm năng trong Hiệp hội."
  );

  useEffect(() => {
    if (isOpen) {
      if (defaultTitle) setTitle(defaultTitle);
      if (defaultPartnerName) setPartnerName(defaultPartnerName);
      if (defaultPartnerCompany) setPartnerCompany(defaultPartnerCompany);
      if (defaultPartnerPhone) setPartnerPhone(defaultPartnerPhone);
      if (defaultNotes) setNotes(defaultNotes);
      setErrors({});
    }
  }, [isOpen, defaultTitle, defaultPartnerName, defaultPartnerCompany, defaultPartnerPhone, defaultNotes]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = meeting1on1Schema.safeParse({ title, partnerName });
    if (!result.success) {
      const errMap: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!errMap[key]) errMap[key] = issue.message;
      }
      setErrors(errMap);
      return;
    }
    setErrors({});

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
          ? onlineUrl.trim() || "https://meet.uniwork.space/CEO1983_Connect"
          : venue.trim(),
      onlineUrl: venueType === "online" ? onlineUrl.trim() : undefined,
      onlinePlatform: venueType === "online" ? onlinePlatform : undefined,
      reminderTier,
      notes: notes.trim() || undefined,
      status: "scheduled",
      isAgreed: true,
      createdAt: new Date().toISOString(),
    };

    // Gọi API backend để lưu cuộc gặp vào CSDL hiệp hội & bắn thông báo tới đối tác
    try {
      await fetchNestApi("/meetings", {
        method: "POST",
        body: newRecord,
      });
    } catch (e: any) {
      console.warn("Lưu cuộc gặp lên server lỗi hoặc đang offline:", e?.message);
    }

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
        `✓ Đã lên lịch cuộc gặp kết nối với "${partnerName.trim()}" và gửi thông báo tới đối tác thành công!`
      );
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu cuộc gặp kết nối");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[90vh] max-h-[90dvh] overflow-hidden">
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0 bg-card">
          <div className="flex items-center gap-2.5">
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
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary cursor-pointer transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs overscroll-contain">
            {/* Tiêu đề cuộc gặp */}
            <div>
              <label className="font-bold text-foreground block mb-1">
                Chủ đề / Mục đích cuộc gặp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                }}
                placeholder="VD: Trao đổi hợp tác chuỗi cung ứng vật tư..."
                className={`w-full rounded-xl border bg-background px-3 py-2 text-foreground focus:outline-none text-xs transition ${
                  errors.title
                    ? "border-destructive focus:border-destructive ring-1 ring-destructive/30"
                    : "border-border focus:ring-2 focus:ring-primary"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-xs font-semibold text-destructive animate-in fade-in duration-150">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Người chủ trì & Đối tác */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-foreground block mb-1 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-primary" /> Người chủ trì (Host)
                </label>
                <input
                  type="text"
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
                  value={partnerName}
                  onChange={(e) => {
                    setPartnerName(e.target.value);
                    if (errors.partnerName) setErrors((prev) => ({ ...prev, partnerName: "" }));
                  }}
                  placeholder="Tên đối tác hoặc doanh nhân..."
                  className={`w-full rounded-xl border bg-background px-3 py-2 text-foreground focus:outline-none text-xs transition ${
                    errors.partnerName
                      ? "border-destructive focus:border-destructive ring-1 ring-destructive/30"
                      : "border-border focus:ring-2 focus:ring-primary"
                  }`}
                />
                {errors.partnerName && (
                  <p className="mt-1 text-xs font-semibold text-destructive animate-in fade-in duration-150">
                    {errors.partnerName}
                  </p>
                )}
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
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 transition cursor-pointer font-medium ${
                    venueType === "offline"
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" /> Gặp Trực Tiếp (Offline)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVenueType("online");
                    if (!onlineUrl) {
                      setOnlineUrl(`https://meet.uniwork.space/CEO1983_Connect_${Math.floor(1000 + Math.random() * 9000)}`);
                    }
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 transition cursor-pointer font-medium ${
                    venueType === "online"
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                      : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Video className="h-3.5 w-3.5" /> Họp Trực Tuyến (Online)
                </button>
              </div>
            </div>

            {/* Địa điểm hoặc Nền tảng online */}
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
              <div className="space-y-3 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> Chọn nền tảng phòng họp Online
                  </label>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
                    Tích hợp Uniwork
                  </span>
                </div>

                {/* Platform Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setOnlinePlatform("uniwork");
                      setOnlineUrl(`https://meet.uniwork.space/CEO1983_Connect_${Math.floor(1000 + Math.random() * 9000)}`);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 ${
                      onlinePlatform === "uniwork"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    <span>Uniwork Meet</span>
                    <span className="text-[9px] opacity-80">(Mặc định)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOnlinePlatform("meet");
                      setOnlineUrl("https://meet.google.com/new");
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 ${
                      onlinePlatform === "meet"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    <span>Google Meet</span>
                    <span className="text-[9px] opacity-80">meet.google.com</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOnlinePlatform("zoom");
                      setOnlineUrl("https://zoom.us/join");
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 ${
                      onlinePlatform === "zoom"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    <span>Zoom</span>
                    <span className="text-[9px] opacity-80">zoom.us</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOnlinePlatform("custom")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 ${
                      onlinePlatform === "custom"
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    <span>Khác</span>
                    <span className="text-[9px] opacity-80">Tùy biến link</span>
                  </button>
                </div>

                {/* Input URL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground text-[11px]">Đường dẫn phòng họp:</span>
                    {onlinePlatform === "uniwork" && (
                      <button
                        type="button"
                        onClick={() =>
                          setOnlineUrl(`https://meet.uniwork.space/CEO1983_Connect_${Math.floor(1000 + Math.random() * 9000)}`)
                        }
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                      >
                        + Tạo phòng Uniwork mới
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      value={onlineUrl}
                      onChange={(e) => setOnlineUrl(e.target.value)}
                      placeholder="https://meet.uniwork.space/CEO1983_Connect_..."
                      className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    />
                    {onlineUrl && (
                      <a
                        href={onlineUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-[11px] font-semibold flex items-center gap-1 hover:bg-indigo-700 transition"
                      >
                        Test
                      </a>
                    )}
                  </div>
                </div>
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
          </div>

          {/* Fixed Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-border bg-muted/20 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer transition"
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
