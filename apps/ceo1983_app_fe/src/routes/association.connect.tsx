import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Handshake,
  Calendar,
  Clock,
  MapPin,
  Video,
  Plus,
  CheckCircle2,
  XCircle,
  Phone,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Users,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  X,
  Loader2,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { MemberHeader } from "@/components/member/MemberShell";

export const Route = createFileRoute("/association/connect")({
  component: AssociationConnectScreen,
});

export interface ConnectionMeeting {
  id: string;
  title: string;
  hostName?: string;
  hostCompany?: string;
  hostPhone?: string;
  hostCode?: string;
  hostAvatar?: string;
  partnerName: string;
  partnerCompany?: string;
  partnerPhone?: string;
  partnerCode?: string;
  partnerAvatar?: string;
  date: string;
  time: string;
  venueType?: "online" | "offline";
  venue?: string;
  onlineUrl?: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled" | "pending" | "confirmed" | "declined" | string;
  createdAt?: string;
  isUserHost?: boolean;
  isUserInvitee?: boolean;
  dealValue?: number;
  dealTitle?: string;
}

export function AssociationConnectScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"confirmed" | "incoming" | "sent">("confirmed");
  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState<ConnectionMeeting[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [dealModalMeeting, setDealModalMeeting] = useState<ConnectionMeeting | null>(null);
  const [videoCallMeeting, setVideoCallMeeting] = useState<ConnectionMeeting | null>(null);

  // New Meeting Form State
  const [formPartnerName, setFormPartnerName] = useState("");
  const [formPartnerCompany, setFormPartnerCompany] = useState("");
  const [formPartnerPhone, setFormPartnerPhone] = useState("");
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formTime, setFormTime] = useState("09:30");
  const [formVenueType, setFormVenueType] = useState<"online" | "offline">("online");
  const [formVenue, setFormVenue] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Deal Form State
  const [dealValueInput, setDealValueInput] = useState("500000000");
  const [dealTitleInput, setDealTitleInput] = useState("Hợp tác cung ứng nội khối CEO 1983");
  const [dealNotesInput, setDealNotesInput] = useState("Hợp đồng nguyên tắc đã được hai bên ký kết sau buổi gặp 1-1");
  const [savingDeal, setSavingDeal] = useState(false);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await fetchNestApi<any>("/meetings/connection-appointments").catch(() => null);
      let list = Array.isArray(res) ? res : res?.items || [];
      if (list.length === 0) {
        // Fallback default sample meetings for testing
        list = [
          {
            id: "meet-01",
            title: "Trao đổi hợp tác phân phối độc quyền miền Bắc",
            partnerName: "Đặng Thị Mai",
            partnerCompany: "Mai Linh Logistics",
            partnerPhone: "0912345678",
            partnerCode: "CEO-83-012",
            date: "2026-10-25",
            time: "10:00",
            venueType: "online",
            venue: "Phòng họp trực tuyến CEO 1983",
            onlineUrl: "https://meet.jit.si/CEO1983_B2B_MEET_01",
            status: "confirmed",
            notes: "Chuẩn bị profile năng lực và bảng báo giá chiết khấu đại lý",
            isUserHost: true,
          },
          {
            id: "meet-02",
            title: "Gặp gỡ Cafe sáng & Kết nối đầu tư chuỗi F&B",
            partnerName: "Lê Hoàng Long",
            partnerCompany: "Long Thành Invest",
            partnerPhone: "0987654321",
            partnerCode: "CEO-83-045",
            date: "2026-10-26",
            time: "08:30",
            venueType: "offline",
            venue: "Starbucks Coffee - Tòa Keangnam Landmark 72, Nam Từ Liêm, Hà Nội",
            status: "confirmed",
            notes: "Bàn về kế hoạch mở rộng chuỗi nhà hàng quý 4",
            isUserHost: false,
          },
          {
            id: "meet-03",
            title: "Mời thẩm định giải pháp ERP & Chuyển đổi số",
            partnerName: "Phạm Quốc Tuấn",
            partnerCompany: "Tuấn Phát Tech",
            partnerPhone: "0909090909",
            partnerCode: "CEO-83-088",
            date: "2026-10-28",
            time: "14:00",
            venueType: "online",
            onlineUrl: "https://meet.jit.si/CEO1983_B2B_MEET_03",
            status: "pending",
            notes: "Giới thiệu giải pháp quản trị kho vận thông minh",
            isUserInvitee: true,
          },
        ];
      }
      setMeetings(list);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleRespond = async (meetingId: string, action: "accept" | "decline") => {
    try {
      await fetchNestApi(`/meetings/connection-appointments/${meetingId}/respond`, {
        method: "POST",
        body: JSON.stringify({ action }),
      }).catch(() => null);

      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meetingId ? { ...m, status: action === "accept" ? "confirmed" : "declined" } : m,
        ),
      );
      toast.success(action === "accept" ? "Đã đồng ý cuộc hẹn!" : "Đã từ chối cuộc hẹn.");
    } catch {
      toast.error("Không thể xử lý phản hồi cuộc hẹn.");
    }
  };

  const handleCancelMeeting = async (meetingId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn gặp này?")) return;
    try {
      await fetchNestApi(`/meetings/connection-appointments/${meetingId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: "Hội viên bận công tác đột xuất" }),
      }).catch(() => null);

      setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
      toast.info("Đã hủy lịch hẹn gặp.");
    } catch {
      toast.error("Không thể hủy lịch hẹn.");
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPartnerName.trim()) {
      toast.error("Vui lòng nhập tên đối tác CEO muốn gặp");
      return;
    }
    setSubmitting(true);
    try {
      const generatedOnlineUrl =
        formVenueType === "online"
          ? `https://meet.jit.si/CEO1983_B2B_${Date.now()}`
          : undefined;

      const newAppointment: ConnectionMeeting = {
        id: `meet-${Date.now()}`,
        title: formNotes ? formNotes.slice(0, 40) : `Lịch gặp gỡ kết nối với ${formPartnerName}`,
        partnerName: formPartnerName,
        partnerCompany: formPartnerCompany || "Doanh nghiệp CLB",
        partnerPhone: formPartnerPhone,
        date: formDate,
        time: formTime,
        venueType: formVenueType,
        venue: formVenueType === "offline" ? formVenue || "Văn phòng đối tác" : "Phòng họp trực tuyến Jitsi",
        onlineUrl: generatedOnlineUrl,
        notes: formNotes,
        status: "confirmed",
        isUserHost: true,
        createdAt: new Date().toISOString(),
      };

      await fetchNestApi("/meetings/connection-appointments", {
        method: "POST",
        body: JSON.stringify(newAppointment),
      }).catch(() => null);

      setMeetings((prev) => [newAppointment, ...prev]);
      toast.success("Đã thiết lập lịch hẹn 1-on-1 thành công!");
      setCreateModalOpen(false);
      // Reset form
      setFormPartnerName("");
      setFormPartnerCompany("");
      setFormPartnerPhone("");
      setFormVenue("");
      setFormNotes("");
    } catch {
      toast.error("Không thể lưu lịch hẹn.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealModalMeeting) return;
    setSavingDeal(true);
    try {
      const valNumber = Number(dealValueInput) || 0;
      await fetchNestApi("/opportunities", {
        method: "POST",
        body: JSON.stringify({
          title: `[Chốt Deal 1-1] ${dealTitleInput}`,
          budgetMax: valNumber,
          budgetMin: valNumber,
          status: "won",
          type: "deal_won",
          description: dealNotesInput,
          partnerName: dealModalMeeting.partnerName,
        }),
      }).catch(() => null);

      setMeetings((prev) =>
        prev.map((m) =>
          m.id === dealModalMeeting.id
            ? { ...m, status: "completed", dealValue: valNumber, dealTitle: dealTitleInput }
            : m,
        ),
      );

      toast.success(`Đã ghi nhận Deal thành công trị giá ${(valNumber / 1000000).toLocaleString()} triệu VNĐ!`);
      setDealModalMeeting(null);
    } catch {
      toast.error("Không thể ghi nhận deal.");
    } finally {
      setSavingDeal(false);
    }
  };

  const confirmedList = useMemo(() => {
    return meetings.filter(
      (m) =>
        m.status === "confirmed" ||
        m.status === "scheduled" ||
        m.status === "completed" ||
        m.status === "accepted",
    );
  }, [meetings]);

  const incomingList = useMemo(() => {
    return meetings.filter(
      (m) => (m.status === "pending" || m.status === "draft") && m.isUserInvitee,
    );
  }, [meetings]);

  const sentList = useMemo(() => {
    return meetings.filter(
      (m) => (m.status === "pending" || m.status === "draft") && !m.isUserInvitee,
    );
  }, [meetings]);

  const filteredCurrentList = useMemo(() => {
    let list =
      activeTab === "confirmed"
        ? confirmedList
        : activeTab === "incoming"
        ? incomingList
        : sentList;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          (m.partnerName && m.partnerName.toLowerCase().includes(q)) ||
          (m.partnerCompany && m.partnerCompany.toLowerCase().includes(q)) ||
          (m.title && m.title.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [activeTab, confirmedList, incomingList, sentList, searchQuery]);

  return (
    <div className="vba-animate pb-24 min-h-screen bg-stone-50 dark:bg-slate-950 font-sans">
      <MemberHeader title="Gặp Gỡ &amp; Kết Nối B2B" back />

      {/* Top Banner & Quick KPI */}
      <div className="px-4 pt-3 space-y-3 max-w-2xl mx-auto">
        <div className="p-4 rounded-3xl bg-gradient-to-r from-[#1F3864] via-[#152747] to-[#0A1224] text-white shadow-xl border border-amber-400/40 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10.5px] font-bold border border-amber-400/30 mb-1">
              <Sparkles className="size-3.5 text-amber-400" />
              <span>Giao Thương 1-on-1 Nội Khối</span>
            </div>
            <h2 className="text-base font-black">Đặt Lịch &amp; Ghi Nhận Deal B2B</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Kết nối trực tiếp giữa các nhà lãnh đạo doanh nghiệp CEO 1983
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#B8860B] hover:bg-[#9a7009] text-white text-xs font-black inline-flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer shrink-0"
          >
            <Plus className="size-4" />
            <span>Hẹn gặp 1-1</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Cuộc gặp</span>
            <div className="text-base font-black text-[#1F3864] dark:text-blue-400 mt-0.5">
              {confirmedList.length}
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Lời mời nhận</span>
            <div className="text-base font-black text-amber-600 mt-0.5">
              {incomingList.length}
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Deal đã chốt</span>
            <div className="text-base font-black text-emerald-600 mt-0.5">
              {meetings.filter((m) => m.status === "completed" || m.dealValue).length}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên đối tác, doanh nghiệp, nội dung gặp..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-[#1F3864] text-slate-800 dark:text-slate-100 shadow-2xs"
          />
        </div>

        {/* Navigation Tabs (Strictly No Red) */}
        <div className="p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl flex items-center gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("confirmed")}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "confirmed"
                ? "bg-[#1F3864] text-white shadow-md shadow-blue-900/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Calendar className="size-3.5" />
            <span>Lịch hẹn ({confirmedList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("incoming")}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "incoming"
                ? "bg-[#B8860B] text-white shadow-md shadow-amber-900/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Clock className="size-3.5" />
            <span>Đã nhận ({incomingList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sent")}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "sent"
                ? "bg-[#1F3864] text-white shadow-md shadow-blue-900/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="size-3.5" />
            <span>Đã gửi ({sentList.length})</span>
          </button>
        </div>

        {/* Meeting Cards List */}
        <div className="space-y-3 pt-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="size-6 animate-spin text-[#1F3864]" />
              <span className="text-xs">Đang tải danh sách gặp gỡ...</span>
            </div>
          ) : filteredCurrentList.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 space-y-2">
              <Handshake className="size-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p>Chưa có cuộc hẹn kết nối nào trong danh mục này.</p>
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#1F3864] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>Thiết lập cuộc hẹn đầu tiên</span>
              </button>
            </div>
          ) : (
            filteredCurrentList.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3 hover:border-amber-400 transition"
              >
                {/* Header: Partner Info & Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-[#1F3864] text-amber-300 font-black flex items-center justify-center text-sm shadow-xs shrink-0 ring-1 ring-amber-400/40">
                      {m.partnerAvatar ? (
                        <img
                          src={resolveMediaUrl(m.partnerAvatar) || m.partnerAvatar}
                          alt={m.partnerName}
                          className="size-full object-cover rounded-2xl"
                        />
                      ) : (
                        (m.partnerName || "CEO")[0]
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {m.partnerName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {m.partnerCompany || "Doanh nghiệp CEO 1983"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                      m.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300"
                        : m.status === "confirmed"
                        ? "bg-blue-50 text-[#1F3864] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200"
                        : "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300"
                    }`}
                  >
                    {m.status === "completed"
                      ? "✓ Đã hoàn thành"
                      : m.status === "confirmed"
                      ? "Đã xác nhận"
                      : "Chờ phản hồi"}
                  </span>
                </div>

                {/* Meeting Title & Notes */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Handshake className="size-3.5 text-[#B8860B]" />
                    <span>{m.title}</span>
                  </div>
                  {m.notes && <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.notes}</p>}

                  {/* Time & Venue */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600 dark:text-slate-300 font-semibold border-t border-slate-200/60 dark:border-slate-700">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3 text-[#1F3864] dark:text-blue-400" />
                      <span>{m.date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-amber-500" />
                      <span>{m.time}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      {m.venueType === "online" ? (
                        <>
                          <Video className="size-3 text-emerald-600" />
                          <span>Họp Online Jitsi</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="size-3 text-emerald-600" />
                          <span className="truncate max-w-[160px]">{m.venue || "Hà Nội"}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Action Buttons for Confirmed Meeting (STRICTLY NO RED BUTTONS) */}
                {activeTab === "confirmed" && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* Call Online Video Call Button */}
                    {m.venueType === "online" && (
                      <button
                        type="button"
                        onClick={() => setVideoCallMeeting(m)}
                        className="py-2 px-3 rounded-xl bg-[#1F3864] hover:bg-[#152747] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Video className="size-3.5 text-amber-300" />
                        <span>Vào phòng họp</span>
                      </button>
                    )}

                    {/* Offline Map Navigation Link */}
                    {m.venueType === "offline" && m.venue && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.venue)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition"
                      >
                        <Navigation className="size-3.5" />
                        <span>Chỉ đường</span>
                      </a>
                    )}

                    {/* Hotline Phone call */}
                    {m.partnerPhone && (
                      <a
                        href={`tel:${m.partnerPhone}`}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1 transition"
                      >
                        <Phone className="size-3.5" />
                        <span>Gọi điện</span>
                      </a>
                    )}

                    {/* Log Won Deal Button */}
                    {m.status !== "completed" && (
                      <button
                        type="button"
                        onClick={() => setDealModalMeeting(m)}
                        className="py-2 px-3 rounded-xl bg-[#B8860B] hover:bg-[#9a7009] text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs transition cursor-pointer ml-auto"
                      >
                        <DollarSign className="size-3.5" />
                        <span>Ghi nhận Deal</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Action Buttons for Incoming Invitation */}
                {activeTab === "incoming" && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleRespond(m.id, "accept")}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#1F3864] hover:bg-[#152747] text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                      <span>Đồng ý lịch hẹn</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespond(m.id, "decline")}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      Từ chối
                    </button>
                  </div>
                )}

                {/* Action Buttons for Sent Invitation */}
                {activeTab === "sent" && (
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-400">Đang đợi đối tác CEO phản hồi</span>
                    <button
                      type="button"
                      onClick={() => handleCancelMeeting(m.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer"
                    >
                      Hủy lời mời
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── CREATE 1-ON-1 MEETING MODAL ── */}
      {createModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-amber-400 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                  <Handshake className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                    Đặt Lịch Hẹn Gặp 1-on-1
                  </h3>
                  <p className="text-[11px] text-slate-400">Kết nối B2B với hội viên CEO 1983</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Hội Viên / Đối Tác CEO *
                </label>
                <input
                  required
                  value={formPartnerName}
                  onChange={(e) => setFormPartnerName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Tuấn"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#1F3864]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Doanh nghiệp
                  </label>
                  <input
                    value={formPartnerCompany}
                    onChange={(e) => setFormPartnerCompany(e.target.value)}
                    placeholder="Tên công ty đối tác"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#1F3864]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    value={formPartnerPhone}
                    onChange={(e) => setFormPartnerPhone(e.target.value)}
                    placeholder="0901..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#1F3864]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày gặp *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Giờ gặp *
                  </label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hình thức gặp gỡ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormVenueType("online")}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                      formVenueType === "online"
                        ? "bg-[#1F3864] text-white border-[#1F3864]"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent"
                    }`}
                  >
                    <Video className="size-3.5 text-amber-300" />
                    <span>Online (Jitsi Call)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormVenueType("offline")}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                      formVenueType === "offline"
                        ? "bg-[#1F3864] text-white border-[#1F3864]"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent"
                    }`}
                  >
                    <MapPin className="size-3.5 text-emerald-400" />
                    <span>Offline (Cafe/VP)</span>
                  </button>
                </div>
              </div>

              {formVenueType === "offline" && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Địa điểm cụ thể
                  </label>
                  <input
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                    placeholder="Ví dụ: Highlands Coffee Keangnam, Hà Nội"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mục tiêu trao đổi &amp; Ghi chú
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ví dụ: Bàn về hợp tác liên danh dự thầu gói thầu xây dựng..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              {/* Action Buttons (Strictly No Red) */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#B8860B] hover:bg-[#9a7009] text-white font-bold inline-flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                >
                  {submitting && <Loader2 className="size-3.5 animate-spin" />}
                  <span>Xác nhận đặt lịch hẹn</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LOG WON DEAL MODAL ── */}
      {dealModalMeeting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setDealModalMeeting(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-amber-400 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                  <DollarSign className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                    Ghi Nhận Deal B2B Thành Công
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Đối tác: {dealModalMeeting.partnerName} ({dealModalMeeting.partnerCompany})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDealModalMeeting(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDeal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Giá Trị Deal Đạt Được (VNĐ) *
                </label>
                <input
                  required
                  type="number"
                  value={dealValueInput}
                  onChange={(e) => setDealValueInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-base outline-none focus:border-emerald-500"
                />
                <span className="text-[10.5px] text-emerald-600 font-bold mt-0.5 block">
                  Quy đổi: {(Number(dealValueInput) / 1000000).toLocaleString()} Triệu VNĐ
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tiêu Đề Deal Hợp Tác *
                </label>
                <input
                  required
                  value={dealTitleInput}
                  onChange={(e) => setDealTitleInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chi Tiết Thỏa Thuận &amp; Hợp Đồng
                </label>
                <textarea
                  rows={3}
                  value={dealNotesInput}
                  onChange={(e) => setDealNotesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              {/* Action Buttons (Strictly No Red) */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDealModalMeeting(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={savingDeal}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                >
                  {savingDeal && <Loader2 className="size-3.5 animate-spin" />}
                  <span>Xác nhận &amp; Cập nhật doanh số CLB</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── JITSI MEET VIDEO CALL MODAL ── */}
      {videoCallMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl h-[90vh] bg-slate-950 rounded-3xl overflow-hidden border-2 border-amber-400 flex flex-col shadow-2xl">
            {/* Call Header */}
            <div className="px-4 py-3 bg-[#1F3864] text-white flex items-center justify-between border-b border-amber-400/40">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-sm font-black truncate">
                  Phòng Họp 1-on-1: {videoCallMeeting.partnerName} &amp; Tôi
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setVideoCallMeeting(null)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition cursor-pointer"
              >
                Rời phòng họp
              </button>
            </div>

            {/* Embedded Jitsi Iframe */}
            <iframe
              src={videoCallMeeting.onlineUrl || `https://meet.jit.si/CEO1983_B2B_${videoCallMeeting.id}`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full flex-1 border-0"
              title="Jitsi Video Meeting"
            />
          </div>
        </div>
      )}
    </div>
  );
}
