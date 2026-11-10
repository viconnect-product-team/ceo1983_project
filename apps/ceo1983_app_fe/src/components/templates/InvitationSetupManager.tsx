import React, { useState, useEffect } from "react";
import {
  Mail,
  Calendar,
  MapPin,
  Clock,
  Users,
  Send,
  Eye,
  QrCode,
  CheckCircle2,
  Sparkles,
  Layers,
  FileCheck,
  Search,
  Filter,
  Share2,
  Bell,
  Smartphone,
  Check,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { OmnichannelBroadcastModal } from "./OmnichannelBroadcastModal";

export interface EventOption {
  id: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  status?: string;
  created_at?: string;
}

export interface SetupRecipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  ticketType?: string;
  qrCode?: string;
  avatar?: string;
}

export function InvitationSetupManager() {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);

  // Cấu hình thư mời
  const [invitationTitle, setInvitationTitle] = useState<string>("THƯ MỜI THAM DỰ SỰ KIỆN DOANH NHÂN");
  const [invitationSubtitle, setInvitationSubtitle] = useState<string>("Trân trọng kính mời Quý Doanh nhân tham dự");
  const [eventDate, setEventDate] = useState<string>("10/09/2026");
  const [eventTime, setEventTime] = useState<string>("18:30 - 21:30");
  const [eventLocation, setEventLocation] = useState<string>("Habblet Hotel & Cung Điện Atlantis, Hà Nội");
  const [dressCode, setDressCode] = useState<string>("Black Tie / Trang phục dạ tiệc lịch sự");
  const [specialNote, setSpecialNote] = useState<string>("Vui lòng mang theo mã QR trên thư mời để check-in tại quầy đón tiếp VIP.");

  // Mẫu thiệp đã chọn
  const [selectedTemplatePreset, setSelectedTemplatePreset] = useState<"atlantis" | "wyndham" | "gala" | "minimal">("atlantis");

  // Đối tượng người nhận
  const [recipientTarget, setRecipientTarget] = useState<"all" | "registered" | "committee" | "custom">("registered");
  const [selectedCommittee, setSelectedCommittee] = useState<string>("ban_xuc_tien");
  const [registeredAttendees, setRegisteredAttendees] = useState<SetupRecipient[]>([]);
  const [allMembers, setAllMembers] = useState<SetupRecipient[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [searchMemberQuery, setSearchMemberQuery] = useState<string>("");

  // Kênh phát hành
  const [channelPush, setChannelPush] = useState<boolean>(true);
  const [channelEmail, setChannelEmail] = useState<boolean>(true);
  const [channelZalo, setChannelZalo] = useState<boolean>(false);
  const [includeQrCode, setIncludeQrCode] = useState<boolean>(true);

  // Trạng thái modal
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Nạp danh sách sự kiện
  useEffect(() => {
    setIsLoadingEvents(true);
    fetchNestApi<any>("/events")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.items || res?.data || [];
        if (Array.isArray(list)) {
          setEvents(list);
          if (list.length > 0) {
            const first = list[0];
            setSelectedEventId(first.id);
            setInvitationTitle(`THƯ MỜI THAM DỰ: ${first.title}`.toUpperCase());
            if (first.location) setEventLocation(first.location);
            if (first.start_time) {
              const d = new Date(first.start_time);
              setEventDate(d.toLocaleDateString("vi-VN"));
              setEventTime(`${d.getHours()}h${String(d.getMinutes()).padStart(2, "0")}`);
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingEvents(false));

    // Nạp toàn bộ hội viên
    fetchNestApi<any[]>("/members")
      .then((res) => {
        if (Array.isArray(res)) {
          const mapped = res.map((m: any) => ({
            id: m.id || m.userId,
            name: m.name || m.full_name || "Hội viên CEO 1983",
            email: m.email,
            phone: m.phone,
            company: m.company || m.company_name,
            position: m.position || m.title || "Doanh nhân",
            avatar: m.avatar || "/avatars/avatar-default.svg",
          }));
          setAllMembers(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Khi thay đổi sự kiện, nạp danh sách đăng ký
  useEffect(() => {
    if (!selectedEventId) return;
    const ev = events.find((e) => e.id === selectedEventId);
    if (ev) {
      setInvitationTitle(`THƯ MỜI THAM DỰ: ${ev.title}`.toUpperCase());
      if (ev.location) setEventLocation(ev.location);
      if (ev.start_time) {
        const d = new Date(ev.start_time);
        setEventDate(d.toLocaleDateString("vi-VN"));
        setEventTime(`${d.getHours()}h${String(d.getMinutes()).padStart(2, "0")}`);
      }
    }

    fetchNestApi<any>(`/events/registrations?eventId=${selectedEventId}`)
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.items || res?.data || [];
        if (Array.isArray(list)) {
          const mapped = list.map((r: any) => ({
            id: r.id || r.user_id,
            name: r.name || r.full_name || r.member?.name || r.user?.name || "Người đăng ký",
            email: r.email || r.member?.email || r.user?.email,
            phone: r.phone || r.member?.phone || r.user?.phone,
            company: r.company || r.member?.company || "Doanh nghiệp CLB",
            position: r.position || r.ticket_name || "Đại biểu",
            ticketType: r.ticket_name || "Vé VIP",
            qrCode: r.qr_code || r.ticket_code || "CEO1983-VIP",
            avatar: r.avatar || r.member?.avatar || "/avatars/avatar-default.svg",
          }));
          setRegisteredAttendees(mapped);
          setSelectedRecipientIds(mapped.map((m: SetupRecipient) => m.id));
        }
      })
      .catch(() => {
        setRegisteredAttendees([]);
      });
  }, [selectedEventId, events]);

  // Lọc người nhận hiển thị
  const activeRecipientList = recipientTarget === "registered" ? registeredAttendees : allMembers;
  const filteredRecipients = activeRecipientList.filter((m) => {
    if (!searchMemberQuery.trim()) return true;
    const q = searchMemberQuery.toLowerCase();
    return (
      (m.name || "").toLowerCase().includes(q) ||
      (m.company || "").toLowerCase().includes(q) ||
      (m.position || "").toLowerCase().includes(q)
    );
  });

  const toggleSelectRecipient = (id: string) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRecipientIds.length === filteredRecipients.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(filteredRecipients.map((m) => m.id));
    }
  };

  const handleSaveSetup = async () => {
    setIsSaving(true);
    try {
      const payload = {
        eventId: selectedEventId,
        title: invitationTitle,
        subtitle: invitationSubtitle,
        date: eventDate,
        time: eventTime,
        location: eventLocation,
        dressCode,
        specialNote,
        templatePreset: selectedTemplatePreset,
        recipientTarget,
        recipientIds: selectedRecipientIds,
        channels: {
          push: channelPush,
          email: channelEmail,
          zalo: channelZalo,
        },
        includeQrCode,
        updatedAt: new Date().toISOString(),
      };

      await fetchNestApi("/admin/invitation-templates", {
        method: "POST",
        body: JSON.stringify({ templates: [payload] }),
      });

      toast.success("Đã lưu cấu hình set up thư mời sự kiện thành công!");
    } catch (err: any) {
      toast.error(`Lỗi lưu set up: ${err.message || "Vui lòng thử lại sau"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#001D4A] via-[#003B95] to-[#0A2540] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-800/40">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
              QUẢN LÝ MẪU & THƯ MỜI
            </span>
            <span className="text-xs text-blue-200">Omnichannel Invitation Setup</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Mail className="size-6 text-amber-400" />
            Set Up Thư Mời Sự Kiện & Hội Nghị Doanh Nhân
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl">
            Thiết lập nội dung thư mời, liên kết sự kiện, chọn mẫu thiệp hoàng gia, gán mã QR cá nhân hóa và phát hành đa kênh (App Push, Email, Zalo OA).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSaveSetup}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/20 cursor-pointer"
          >
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>{isSaving ? "Đang lưu..." : "Lưu Cấu Hình"}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsBroadcastModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Send className="size-4 text-slate-950" />
            <span>Phát Hành Thư Mời</span>
          </button>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT: SETUP FORM (LEFT) + LIVE CARD PREVIEW (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: SETUP FIELDS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. CHỌN SỰ KIỆN LIÊN KẾT */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  1. Chọn Sự Kiện Phát Hành Thư Mời
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {isLoadingEvents ? "Đang tải sự kiện..." : `${events.length} sự kiện khả dụng`}
              </span>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Sự kiện mục tiêu:
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} {ev.start_time ? `(${new Date(ev.start_time).toLocaleDateString("vi-VN")})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. CHỌN MẪU THIỆP & NỘI DUNG THƯ MỜI */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="size-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                2. Mẫu Thiệp Mời & Nội Dung
              </h2>
            </div>

            {/* Mẫu thiệp Preset */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Phong cách thiết kế thiệp mời:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "atlantis", label: "Cung Điện Atlantis", note: "Hoàng Gia Xanh Đại Dương", icon: "🔱" },
                  { id: "wyndham", label: "Wyndham Heian", note: "Thanh Thủy Đẳng Cấp", icon: "⛩️" },
                  { id: "gala", label: "Gala Thượng Đỉnh", note: "Vàng Gold Ánh Kim", icon: "👑" },
                  { id: "minimal", label: "Editorial Hiện Đại", note: "Tối Giản Doanh Nhân", icon: "✨" },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplatePreset(tpl.id as any)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      selectedTemplatePreset === tpl.id
                        ? "border-[#003B95] bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-[#003B95]/30"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl mb-1">{tpl.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{tpl.label}</div>
                      <div className="text-[10px] text-slate-500">{tpl.note}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trường nội dung */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Tiêu đề thư mời:
                </label>
                <input
                  type="text"
                  value={invitationTitle}
                  onChange={(e) => setInvitationTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Lời dẫn thư mời:
                </label>
                <input
                  type="text"
                  value={invitationSubtitle}
                  onChange={(e) => setInvitationSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Ngày tổ chức:
                </label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Thời gian:
                </label>
                <input
                  type="text"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Địa điểm tổ chức:
                </label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Quy định trang phục (Dress code):
                </label>
                <input
                  type="text"
                  value={dressCode}
                  onChange={(e) => setDressCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Ghi chú đón tiếp:
                </label>
                <input
                  type="text"
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* 3. ĐỐI TƯỢNG NHẬN THƯ MỜI & DANH SÁCH ĐẠI BIỂU */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  3. Người Nhận Thư Mời ({selectedRecipientIds.length}/{filteredRecipients.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-bold text-[#003B95] dark:text-sky-400 hover:underline cursor-pointer"
              >
                {selectedRecipientIds.length === filteredRecipients.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
            </div>

            {/* Phân loại người nhận */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRecipientTarget("registered")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  recipientTarget === "registered"
                    ? "bg-[#003B95] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                Đã Đăng Ký Sự Kiện ({registeredAttendees.length})
              </button>
              <button
                type="button"
                onClick={() => setRecipientTarget("all")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  recipientTarget === "all"
                    ? "bg-[#003B95] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                Toàn Bộ Hội Viên CLB ({allMembers.length})
              </button>
            </div>

            {/* Tìm kiếm người nhận */}
            <div className="relative">
              <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo họ tên, chức vụ, công ty..."
                value={searchMemberQuery}
                onChange={(e) => setSearchMemberQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            {/* Danh sách người nhận với checkbox */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {filteredRecipients.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Chưa có người đăng ký hoặc không tìm thấy hội viên nào khớp.
                </div>
              ) : (
                filteredRecipients.map((rec) => {
                  const isChecked = selectedRecipientIds.includes(rec.id);
                  return (
                    <div
                      key={rec.id}
                      onClick={() => toggleSelectRecipient(rec.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                        isChecked
                          ? "border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20"
                          : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="size-4 rounded text-amber-500 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{rec.name}</span>
                            {rec.ticketType && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold">
                                {rec.ticketType}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {rec.position} · {rec.company}
                          </div>
                        </div>
                      </div>
                      {rec.qrCode && (
                        <span className="text-[9px] font-mono text-slate-400">
                          {rec.qrCode}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 4. KÊNH PHÁT HÀNH ĐA KÊNH */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Share2 className="size-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                4. Kênh Gửi Thư Mời (Omnichannel Dispatch)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={channelPush}
                  onChange={(e) => setChannelPush(e.target.checked)}
                  className="size-4 rounded text-[#003B95]"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Smartphone className="size-3.5 text-blue-600" />
                    <span>App Push</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Gửi popup chuông thông báo</div>
                </div>
              </label>

              <label className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={channelEmail}
                  onChange={(e) => setChannelEmail(e.target.checked)}
                  className="size-4 rounded text-[#003B95]"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Mail className="size-3.5 text-indigo-600" />
                    <span>Email VIP</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Đính kèm thiệp & vé mời</div>
                </div>
              </label>

              <label className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={channelZalo}
                  onChange={(e) => setChannelZalo(e.target.checked)}
                  className="size-4 rounded text-[#003B95]"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Send className="size-3.5 text-cyan-600" />
                    <span>Zalo ZNS</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Thông báo Zalo OA</div>
                </div>
              </label>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQrCode}
                  onChange={(e) => setIncludeQrCode(e.target.checked)}
                  className="size-4 rounded text-amber-500"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tạo mã QR Check-in cá nhân hóa cho từng đại biểu trên thư mời
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PERSONALIZED CARD PREVIEW (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-6 w-full max-w-[380px] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                <Eye className="size-4 text-sky-500" />
                Xem Trước Thiệp Mời Cá Nhân Hóa
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                {selectedTemplatePreset.toUpperCase()}
              </span>
            </div>

            {/* PREVIEW CARD */}
            <div className="w-full aspect-[9/16] rounded-3xl bg-gradient-to-b from-[#071530] via-[#0A2540] to-[#040C1A] text-white p-6 shadow-2xl border-2 border-white/20 relative overflow-hidden flex flex-col justify-between">
              {/* Subtle light effect */}
              <div className="absolute top-0 right-0 size-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 size-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 text-center space-y-1">
                <div className="inline-block px-3 py-1 rounded-full border border-amber-300/40 bg-amber-400/20 text-amber-300 text-[8px] font-black uppercase tracking-widest">
                  CLB DOANH NHÂN CEO 1983
                </div>
                <div className="text-[10px] text-cyan-200 tracking-widest font-serif uppercase mt-1">
                  OFFICIAL INVITATION
                </div>
                <h3 className="text-base font-black tracking-tight text-white leading-tight uppercase font-serif drop-shadow-md">
                  {invitationTitle}
                </h3>
                <p className="text-[9.5px] text-slate-300 font-light italic">
                  {invitationSubtitle}
                </p>
              </div>

              {/* Delegate Personalization Box */}
              <div className="relative z-10 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-1 shadow-lg">
                <div className="text-[8px] font-bold text-amber-400 uppercase tracking-wider">
                  Trân trọng kính mời Đại biểu VIP:
                </div>
                <div className="text-base font-black text-white font-serif">
                  {registeredAttendees[0]?.name || "Ông/Bà: Doanh Nhân Thành Viên"}
                </div>
                <div className="text-[10px] text-cyan-200">
                  {registeredAttendees[0]?.position || "Chủ tịch HĐQT"} · {registeredAttendees[0]?.company || "Doanh nghiệp CLB CEO 1983"}
                </div>
                <div className="inline-block px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black uppercase mt-1">
                  HẠNG VÉ: VIP PASS GOLD
                </div>
              </div>

              {/* Time & Location */}
              <div className="relative z-10 space-y-2 text-center text-xs">
                <div className="flex items-center justify-center gap-2 text-cyan-300 font-medium">
                  <Calendar className="size-3.5" />
                  <span>{eventDate}</span>
                  <span>·</span>
                  <Clock className="size-3.5" />
                  <span>{eventTime}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-200 font-light">
                  <MapPin className="size-3 text-rose-400 shrink-0" />
                  <span>{eventLocation}</span>
                </div>
                <div className="text-[9px] text-amber-200/90 italic">
                  Dress Code: {dressCode}
                </div>
              </div>

              {/* QR Code Check-in */}
              {includeQrCode && (
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="p-2 rounded-2xl bg-white text-slate-950 shadow-xl flex items-center justify-center">
                    <QrCode className="size-14 text-slate-900" />
                  </div>
                  <div className="text-[7.5px] font-mono text-slate-300 text-center">
                    MÃ CHECK-IN: CEO1983-VIP-088
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="relative z-10 text-center text-[8.5px] text-sky-200 font-serif italic border-t border-white/10 pt-2">
                Rất hân hạnh được đón tiếp Quý Doanh nhân!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PHÁT HÀNH ĐA KÊNH */}
      {isBroadcastModalOpen && (
        <OmnichannelBroadcastModal
          open={isBroadcastModalOpen}
          isOpen={isBroadcastModalOpen}
          onClose={() => setIsBroadcastModalOpen(false)}
          invitationData={{
            category: "event",
            title: invitationTitle,
            subtitle: invitationSubtitle,
            date: eventDate,
            time: eventTime,
            location: eventLocation,
            salutation: "Rất hân hạnh được đón tiếp!",
            bodyText: specialNote,
            venueHighlight: eventLocation,
            dayOfWeek: "Thứ Bảy",
            timeHour: eventTime,
            dayDigits: eventDate.split("/")[0] || "10",
            monthDigits: eventDate.split("/")[1] || "09",
            yearDigits: eventDate.split("/")[2]?.slice(-2) || "26",
            saluteText: "Rất hân hạnh được đón tiếp!",
            capsuleBenefit: dressCode,
          }}
        />
      )}
    </div>
  );
}

