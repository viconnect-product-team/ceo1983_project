import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Handshake,
  Building2,
  Phone,
  User,
  Sparkles,
  Send,
  Calendar,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { resolveMediaUrl, fetchNestApi } from "@/lib/api-client";
import { requestMemberConnectionFn, listMyOpportunities, type MyOpportunity } from "@/lib/member-app.functions";
import { createMeetingFn } from "@/lib/meetings.functions";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";

export interface BusinessConnectTarget {
  code: string;
  name: string;
  company?: string;
  title?: string;
  avatar?: string | null;
  industry?: string;
  userId?: string;
}

export interface BusinessConnectBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  target: BusinessConnectTarget | null;
  initialPurpose?: string;
  initialOpportunityId?: string;
  initialOpportunityTitle?: string;
  onSuccess?: () => void;
}

export function BusinessConnectBottomSheet({
  isOpen,
  onClose,
  target,
  initialPurpose,
  initialOpportunityId,
  initialOpportunityTitle,
  onSuccess,
}: BusinessConnectBottomSheetProps) {
  const navigate = useNavigate();
  const fetchMyOppFn = useServerFn(listMyOpportunities);
  const createMeeting = useServerFn(createMeetingFn);

  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderCompany, setSenderCompany] = useState("");
  const [purpose, setPurpose] = useState(initialPurpose || "");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(initialOpportunityId || "");
  const [myOpportunities, setMyOpportunities] = useState<MyOpportunity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill sender information from localStorage or session
  useEffect(() => {
    if (!isOpen) return;
    if (initialPurpose) setPurpose(initialPurpose);
    if (initialOpportunityId) setSelectedOpportunityId(initialOpportunityId);
    try {
      const raw = localStorage.getItem("vba_custom_profile");
      if (raw) {
        const p = JSON.parse(raw);
        if (p.name) setSenderName(p.name);
        if (p.phone) setSenderPhone(p.phone);
        if (p.company) setSenderCompany(p.company);
      }
    } catch {}

    // Load member's active opportunities for linking
    void (async () => {
      try {
        const opps = await fetchMyOppFn();
        if (Array.isArray(opps)) {
          setMyOpportunities(opps);
        }
      } catch {}
    })();
  }, [isOpen, fetchMyOppFn]);

  if (!isOpen || !target) return null;

  const quickPurposes = [
    "Hẹn gặp trao đổi cơ hội hợp tác kinh doanh",
    "Bàn chiến lược liên kết chuỗi cung ứng B2B",
    "Chia sẻ nhu cầu thương vụ & đầu tư",
    "Gặp gỡ giao lưu cà phê kết nối hội viên",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) {
      toast.error("Vui lòng nhập tên của bạn");
      return;
    }
    if (!senderPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại để đối tác tiện liên hệ");
      return;
    }
    if (!purpose.trim()) {
      toast.error("Vui lòng nhập nội dung đề xuất kết nối");
      return;
    }

    setIsSubmitting(true);
    try {
      // Find selected opportunity title if any
      const opp = myOpportunities.find((o) => o.id === selectedOpportunityId);
      const effectiveOppId = opp ? opp.id : (selectedOpportunityId || initialOpportunityId || undefined);
      const effectiveOppTitle = opp ? opp.title : (initialOpportunityTitle || undefined);

      // Create structured B2B connection invite payload (Requirement 11)
      const b2bInvitePayload = {
        type: "b2b_connect_invite",
        inviteId: `b2b_inv_${Date.now()}`,
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        senderCompany: senderCompany.trim(),
        purpose: purpose.trim(),
        opportunityId: effectiveOppId,
        opportunityTitle: effectiveOppTitle,
        recipientCode: target.code,
        recipientName: target.name,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      };

      const inviteMessageText = `[B2B_CONNECT_INVITE]${JSON.stringify(b2bInvitePayload)}`;

      // Store in recipient's message thread locally for instant UI response
      const targetThreadKey = `vba_direct_msgs_${target.code.toLowerCase()}`;
      try {
        const existingRaw = localStorage.getItem(targetThreadKey);
        const existingMsgs = existingRaw ? JSON.parse(existingRaw) : [];
        const newMsg = {
          id: `m_${Date.now()}`,
          text: inviteMessageText,
          time: "Vừa xong",
          mine: true,
          status: "sent",
        };
        localStorage.setItem(targetThreadKey, JSON.stringify([...existingMsgs, newMsg]));
      } catch {}

      // Update recent conversations list
      try {
        const recentRaw = localStorage.getItem("vba.recent_conversations");
        const recents = recentRaw ? JSON.parse(recentRaw) : [];
        const filtered = recents.filter((c: any) => c.peerCode?.toLowerCase() !== target.code.toLowerCase());
        const updatedRecent = [
          {
            peerCode: target.code,
            name: target.name,
            last: `Đã gửi đề xuất: "${purpose.trim().slice(0, 45)}..."`,
            time: "Vừa xong",
            unread: 0,
            avatarUrl: target.avatar,
          },
          ...filtered,
        ];
        localStorage.setItem("vba.recent_conversations", JSON.stringify(updatedRecent));
      } catch {}

      // Lưu chi tiết vào lịch sử kết nối vba_sent_connection_requests
      try {
        const storedSent = localStorage.getItem("vba_sent_connection_requests");
        const sentList: any[] = storedSent ? JSON.parse(storedSent) : [];
        const existingIdx = sentList.findIndex(
          (s: any) => s.targetCode?.toLowerCase() === target.code.toLowerCase()
        );
        const record = {
          id: `sent_${Date.now()}`,
          targetCode: target.code,
          targetName: target.name,
          targetCompany: target.company || "CLB Doanh Nhân CEO 1983",
          targetTitle: target.title || "Hội viên CEO 1983",
          targetAvatar: target.avatar,
          targetUserId: target.userId,
          purpose: purpose.trim(),
          opportunityTitle: opp ? opp.title : undefined,
          status: "pending" as const,
          createdAt: new Date().toISOString(),
        };
        if (existingIdx >= 0) {
          sentList[existingIdx] = record;
        } else {
          sentList.unshift(record);
        }
        localStorage.setItem("vba_sent_connection_requests", JSON.stringify(sentList));
      } catch {}

      // Mark pending connection status
      try {
        const storedPending = localStorage.getItem("vba.pending_requests");
        const pendingList: string[] = storedPending ? JSON.parse(storedPending) : [];
        if (!pendingList.includes(target.code.toLowerCase())) {
          pendingList.push(target.code.toLowerCase());
          localStorage.setItem("vba.pending_requests", JSON.stringify(pendingList));
        }
      } catch {}

      window.dispatchEvent(new Event("vba.connection.changed"));

      // Call API server function if target is online
      try {
        if (target.userId) {
          await requestMemberConnectionFn({
            data: {
              targetUserId: target.userId,
              message: `${purpose.trim()} (SĐT: ${senderPhone.trim()} - Cty: ${senderCompany.trim()})`,
            },
          });
        }
      } catch {}

      // Đồng bộ cuộc gặp vào hệ thống CSDL CRM (Hiện đúng 2 tài khoản hẹn gặp nhau)
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const meetingDate = tomorrow.toISOString().slice(0, 10);

        await createMeeting({
          data: {
            title: effectiveOppTitle
              ? `Đàm phán 1-1 (${effectiveOppTitle.slice(0, 30)}): ${senderName.trim()} & ${target.name.trim()}`
              : `Kết nối 1-1: ${senderName.trim()} & ${target.name.trim()}`,
            type: "committee",
            date: meetingDate,
            time: "09:30",
            location: "Văn phòng Hiệp hội CEO 1983 / Trực tuyến",
            attendees: 2,
            status: "upcoming",
            department: "Hẹn gặp kết nối 1-1",
            targetMembers: [
              {
                name: senderName.trim(),
                company: senderCompany.trim() || "Doanh nghiệp CEO 1983",
                phone: senderPhone.trim(),
                role: "Người mời hẹn gặp",
              },
              {
                name: target.name.trim(),
                code: target.code,
                company: target.company || "Hội viên CEO 1983",
                title: target.title || "Hội viên",
                userId: target.userId,
                role: "Đối tác được hẹn gặp",
              },
            ],
            zoomUrl: "https://meet.jit.si/CEO1983_Connect_1on1",
          },
        });

        // Gửi lịch hẹn kết nối 1-1 lên Backend để lưu vào database và bắn thông báo real-time tới đối tác
        try {
          await fetchNestApi("/meetings/connection-appointments", {
            method: "POST",
            body: JSON.stringify({
              targetCode: target.code,
              targetUserId: target.userId,
              targetName: target.name,
              targetCompany: target.company,
              targetAvatar: target.avatar,
              senderName: senderName.trim(),
              senderCompany: senderCompany.trim(),
              senderPhone: senderPhone.trim(),
              purpose: purpose.trim(),
              date: meetingDate,
              time: "09:30 - 10:30",
              venueType: "online",
              venue: "https://meet.jit.si/CEO1983_Connect_1on1",
              title: effectiveOppTitle
                ? `Đàm phán 1-1 (${effectiveOppTitle.slice(0, 30)}): ${senderName.trim()} & ${target.name.trim()}`
                : `Hẹn gặp kết nối: ${senderName.trim()} & ${target.name.trim()}`,
            }),
          });
        } catch (apiErr) {
          console.warn("Lưu cuộc gặp lên Backend lỗi:", apiErr);
        }

        // 1. Lưu vào danh mục cuộc gặp cá nhân vba_connection_appointments
        try {
          const appointmentItem = {
            id: `meet_${Date.now()}`,
            title: effectiveOppTitle
              ? `Đàm phán 1-1 (${effectiveOppTitle.slice(0, 30)}): ${senderName.trim()} & ${target.name.trim()}`
              : `Hẹn gặp kết nối: ${senderName.trim()} & ${target.name.trim()}`,
            hostName: senderName.trim(),
            hostCompany: senderCompany.trim() || "Doanh nghiệp CEO 1983",
            hostPhone: senderPhone.trim(),
            partnerName: target.name.trim(),
            partnerCompany: target.company || "Hội viên CEO 1983",
            partnerCode: target.code,
            partnerPhone: (target as any).phone,
            partnerAvatar: target.avatar,
            date: meetingDate,
            time: "09:30 - 10:30",
            venueType: "online" as const,
            venue: "Văn phòng Hiệp hội CEO 1983 / Trực tuyến",
            onlineUrl: "https://meet.jit.si/CEO1983_Connect_1on1",
            notes: purpose.trim(),
            status: "pending",
            createdAt: new Date().toISOString(),
          };
          const curAppointments = JSON.parse(localStorage.getItem("vba_connection_appointments") || "[]");
          curAppointments.unshift(appointmentItem);
          localStorage.setItem("vba_connection_appointments", JSON.stringify(curAppointments));
        } catch {}

        // 2. Đẩy thông báo lời mời hẹn gặp vào hộp thư vba_notifications
        try {
          const notifObj = {
            id: `meet_inv_${Date.now()}`,
            title: `Lời mời hẹn gặp kết nối 1-1 từ ${senderName.trim()}`,
            body: `${senderName.trim()} (${senderCompany.trim() || "Doanh nghiệp"}) đã gửi lời mời hẹn gặp kết nối giao thương với bạn: "${purpose.trim()}". Bấm xem chi tiết để mở Danh mục Hẹn gặp kết nối.`,
            message: `${senderName.trim()} (${senderCompany.trim() || "Doanh nghiệp"}) đã gửi lời mời hẹn gặp kết nối giao thương với bạn: "${purpose.trim()}"`,
            time: new Date().toISOString(),
            type: "meeting",
            notificationKind: "meeting_invitation",
            senderId: senderName.trim(),
            avatar: target.avatar,
            safeDisplayData: {
              senderName: senderName.trim(),
              companyName: senderCompany.trim(),
              purpose: purpose.trim(),
              targetRoute: "/association/members",
              targetSearch: { tab: "meetings" },
            },
            unread: true,
            personal: true,
          };
          const rawNotifs = JSON.parse(localStorage.getItem("vba_notifications") || "[]");
          rawNotifs.unshift(notifObj);
          localStorage.setItem("vba_notifications", JSON.stringify(rawNotifs.slice(0, 50)));
          window.dispatchEvent(new CustomEvent("notifications-updated"));
        } catch {}
      } catch (err: any) {
        console.warn("Lưu cuộc gặp lên CRM lỗi:", err?.message);
      }

      toast.success(`Đã gửi lời mời hẹn gặp giao thương tới ${target.name}!`, {
        description: "Thông điệp và thông tin hẹn gặp đã được chuyển tới hộp thư của hội viên và đồng bộ vào CRM.",
      });

      onSuccess?.();
      onClose();

      // Offer quick link to open conversation
      setTimeout(() => {
        void navigate({
          to: "/association/messages",
          search: { peerCode: target.code, peerName: target.name },
        });
      }, 400);
    } catch {
      toast.error("Không thể gửi lời mời kết nối. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Backdrop tap to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content sliding up from bottom */}
      <div
        className="relative z-10 w-full max-w-lg mx-auto max-h-[92vh] flex flex-col rounded-t-3xl border-t border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Hẹn gặp & Bàn chiến lược giao thương</span>
                <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gửi thông điệp đề xuất hợp tác trực tiếp tới hội viên
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Target Member Card Summary */}
        <div className="mx-5 mt-3.5 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-3 shrink-0">
          {target.avatar ? (
            <img
              src={resolveMediaUrl(target.avatar) || target.avatar}
              alt={target.name}
              className="h-11 w-11 rounded-xl object-cover shrink-0 ring-1 ring-amber-500/30"
            />
          ) : (
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#003B95] to-[#00224F] text-amber-300 font-bold text-sm grid place-items-center shrink-0">
              {target.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{target.name}</span>
              <span className="text-[9.5px] px-1.5 py-0.5 rounded-sm bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold">
                {target.code}
              </span>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400/90 truncate font-medium">
              {target.title || target.industry || "Hội viên CEO 1983"}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <Building2 className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500" />
              <span>{target.company || "CLB Doanh Nhân CEO 1983"}</span>
            </p>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="business-connect-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-3.5 space-y-3.5 text-xs [scrollbar-width:thin]"
        >
          {/* Sender Information (4 mandatory business fields) */}
          <div className="space-y-2.5">
            <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Thông tin của bạn (Người gửi lời mời)
            </span>

            {/* Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Họ và tên của bạn *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Số điện thoại liên hệ *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="tel"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="VD: 0912 345 678"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Công ty / Doanh nghiệp *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  required
                  value={senderCompany}
                  onChange={(e) => setSenderCompany(e.target.value)}
                  placeholder="VD: Công ty Cổ phần Đầu tư..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Connection Purpose / Message */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Nội dung kết nối & Đề xuất hẹn gặp *
            </label>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {quickPurposes.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurpose(p)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="VD: Trân trọng hẹn gặp Anh/Chị trao đổi về giải pháp cung ứng vật tư & cơ hội hợp tác chiến lược trong Quý 4..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden resize-none leading-relaxed"
            />
          </div>

          {/* Link to Opportunity (Requirement 11) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                <span>Liên kết Cơ hội Giao thương (Tùy chọn)</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Đính kèm hồ sơ cơ hội</span>
            </label>

            {myOpportunities.length > 0 ? (
              <select
                value={selectedOpportunityId}
                onChange={(e) => setSelectedOpportunityId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden cursor-pointer"
              >
                <option value="">-- Không đính kèm cơ hội cụ thể --</option>
                {myOpportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    [{opp.tag || "Cơ hội"}] {opp.title}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-[10.5px] text-slate-400 dark:text-slate-500 italic">
                Bạn chưa có tin đăng cơ hội giao thương nào. Lời mời kết nối vẫn được gửi đầy đủ với thông điệp trên.
              </p>
            )}
          </div>
        </form>

        {/* Footer Submit Button */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0B132B]/80 shrink-0">
          <button
            type="submit"
            form="business-connect-form"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3 text-xs shadow-lg shadow-amber-500/10 active:scale-98 transition cursor-pointer disabled:opacity-60"
          >
            <Send className="h-4 w-4 text-slate-950" />
            <span>{isSubmitting ? "Đang gửi thông điệp..." : "Gửi lời mời hẹn gặp giao thương"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
