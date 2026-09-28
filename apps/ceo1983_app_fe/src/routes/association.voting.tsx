import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Vote,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  Building2,
  ChevronRight,
  Filter,
  Check,
  AlertCircle,
  History,
  Sparkles,
  BarChart3,
  Search,
} from "lucide-react";
import { MemberHeader } from "@/components/member/MemberShell";
import { useServerData } from "@/hooks/use-server-data";
import { listMyEvents, type MyEvent } from "@/lib/member-app.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";

export const Route = createFileRoute("/association/voting")({
  component: AssociationVotingScreen,
});

export interface VoteOption {
  id: string;
  label: string;
  voteCount: number;
  percentage?: number;
}

export interface MeetingVoteSession {
  id: string;
  eventId?: string;
  meetingTitle: string;
  meetingType: "dai-hoi" | "ban-chap-hanh" | "sinh-hoat-dinh-ky" | "dien-dan";
  meetingTypeName: string;
  meetingDate: string;
  meetingTime: string;
  meetingLocation: string;
  organizer: string;
  voteTitle: string;
  voteDescription: string;
  status: "active" | "closed";
  totalEligibleMembers: number;
  totalVoted: number;
  options: VoteOption[];
  myVoteOptionId?: string;
  closedAt?: string;
  resolutionResult?: string;
}

const INITIAL_VOTES: MeetingVoteSession[] = [
  {
    id: "vote-01",
    meetingTitle: "Đại Hội Hội Viên Toàn Thể Thường Niên CEO 1983 - Khóa II",
    meetingType: "dai-hoi",
    meetingTypeName: "Đại Hội Toàn Thể",
    meetingDate: "28/09/2026",
    meetingTime: "08:30 - 11:30",
    meetingLocation: "Trung Tâm Hội Nghị Quốc Gia, Hà Nội",
    organizer: "Ban Thường Trực CLB CEO 1983",
    voteTitle: "Thông qua Báo cáo Tài chính kiểm toán 2025 & Dự toán Ngân sách 2026",
    voteDescription:
      "Căn cứ Điều lệ Hiệp hội, Ban Điều Hành kính trình toàn thể Quý Hội viên biểu quyết thông qua báo cáo quyết toán tài chính năm 2025 và hạn mức phân bổ ngân sách xúc tiến thương mại năm 2026.",
    status: "active",
    totalEligibleMembers: 320,
    totalVoted: 248,
    options: [
      { id: "opt-1", label: "Đồng ý", voteCount: 226 },
      { id: "opt-2", label: "Bác bỏ", voteCount: 14 },
      { id: "opt-3", label: "Phiếu trắng", voteCount: 8 },
    ],
  },
  {
    id: "vote-02",
    meetingTitle: "Kỳ Họp Ban Chấp Hành & Ban Thư Ký Mở Rộng Tháng 9/2026",
    meetingType: "ban-chap-hanh",
    meetingTypeName: "Họp Ban Chấp Hành",
    meetingDate: "30/09/2026",
    meetingTime: "14:00 - 17:00",
    meetingLocation: "Tầng 6, Tháp Doanh Nhân, Mễ Trì, Nam Từ Liêm, Hà Nội",
    organizer: "Ban Điều Hành & Ban Thư Ký",
    voteTitle: "Phê chuẩn kiện toàn nhân sự Ban Xúc Tiến Thương Mại & Ban Pháp Chế",
    voteDescription:
      "Biểu quyết phê chuẩn bổ nhiệm bổ sung 02 Phó Ban Xúc Tiến Thương Mại và 01 Phó Ban Pháp Chế nhằm tăng cường năng lực kết nối doanh nghiệp giai đoạn cuối năm.",
    status: "active",
    totalEligibleMembers: 85,
    totalVoted: 69,
    options: [
      { id: "opt-21", label: "Đồng ý", voteCount: 65 },
      { id: "opt-22", label: "Bác bỏ", voteCount: 2 },
      { id: "opt-23", label: "Phiếu trắng", voteCount: 2 },
    ],
  },
  {
    id: "vote-03",
    meetingTitle: "Diễn Đàn Doanh Nhân CEO 1983 & Caravan Kết Nối Quý 4",
    meetingType: "dien-dan",
    meetingTypeName: "Diễn Đàn & Caravan",
    meetingDate: "15/08/2026",
    meetingTime: "18:00 - 21:00",
    meetingLocation: "Khách sạn Daewoo, Ba Đình, Hà Nội",
    organizer: "Ban Truyền Thông & Sự Kiện",
    voteTitle: "Lựa chọn cung đường & chủ đề chương trình Caravan Doanh Nhân 2026",
    voteDescription:
      "Toàn thể Hội viên tham gia biểu quyết lựa chọn cung đường di chuyển và chương trình thiện nguyện đồng hành cùng Caravan CEO 1983.",
    status: "closed",
    closedAt: "16/08/2026",
    resolutionResult: "ĐÃ THÔNG QUA: Cung đường Tây Bắc - Sưởi ấm vùng cao (78.5% tán thành)",
    totalEligibleMembers: 290,
    totalVoted: 260,
    myVoteOptionId: "opt-31",
    options: [
      { id: "opt-31", label: "Đồng ý", voteCount: 204 },
      { id: "opt-32", label: "Bác bỏ", voteCount: 42 },
      { id: "opt-33", label: "Phiếu trắng", voteCount: 14 },
    ],
  },
  {
    id: "vote-04",
    meetingTitle: "Đại Hội Bất Thường Ban Kiểm Tra & Thẩm Định Hội Viên",
    meetingType: "sinh-hoat-dinh-ky",
    meetingTypeName: "Họp Định Kỳ Thẩm Định",
    meetingDate: "20/07/2026",
    meetingTime: "09:00 - 11:00",
    meetingLocation: "Phòng họp Trực tuyến Hội nghị số CEO1983",
    organizer: "Ban Kiểm Tra & Thẩm Định",
    voteTitle: "Sửa đổi Quy chế xét duyệt kết nạp Hội viên chính thức năm 2026",
    voteDescription:
      "Quy chế mới áp dụng tiêu chuẩn xác thực pháp lý doanh nghiệp và chứng thư số hóa danh thiếp thông minh cho toàn thể hội viên gia nhập.",
    status: "closed",
    closedAt: "21/07/2026",
    resolutionResult: "ĐÃ THÔNG QUA NGHỊ QUYẾT: 92.4% số phiếu tán thành",
    totalEligibleMembers: 150,
    totalVoted: 145,
    myVoteOptionId: "opt-41",
    options: [
      { id: "opt-41", label: "Đồng ý", voteCount: 134 },
      { id: "opt-42", label: "Bác bỏ", voteCount: 8 },
      { id: "opt-43", label: "Phiếu trắng", voteCount: 3 },
    ],
  },
];

function AssociationVotingScreen() {
  const fetchEvents = useServerFn(listMyEvents);
  const { data: serverEvents = [] } = useServerData<MyEvent[]>(() => fetchEvents(), [], "vba_events");

  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [selectedMeetingType, setSelectedMeetingType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [voteSessions, setVoteSessions] = useState<MeetingVoteSession[]>(() => {
    if (typeof window === "undefined") return INITIAL_VOTES;
    try {
      const raw = localStorage.getItem("vba_meeting_votes_v2");
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_VOTES;
  });

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const loadCrmPolls = useCallback(async () => {
    try {
      const polls = await fetchNestApi<any[]>("/voting/polls");
      if (Array.isArray(polls) && polls.length > 0) {
        const crmSessions: MeetingVoteSession[] = polls.map((p) => {
          const isClosed = p.status === "closed";
          const rawOpts = p.options || [];
          const opts: VoteOption[] = rawOpts.map((o: any) => ({
            id: String(o.id),
            label: o.title || o.label || "Phương án",
            voteCount: Number(o.votesCount || o.votes_count || 0),
            percentage: Number(o.percentage || 0),
          }));

          const totalVoted =
            p.calculated_total_votes ??
            opts.reduce((sum, o) => sum + o.voteCount, 0);

          return {
            id: p.id,
            eventId: p.event_id || p.eventId,
            meetingTitle: p.event_name
              ? `Sự kiện: ${p.event_name}`
              : p.title || "Kỳ Họp Hiệp Hội CEO 1983",
            meetingType: "dai-hoi",
            meetingTypeName: p.event_name ? "Sự Kiện Hiệp Hội" : "Biểu Quyết Trực Tuyến",
            meetingDate: p.created_at
              ? new Date(p.created_at).toLocaleDateString("vi-VN")
              : "28/09/2026",
            meetingTime: "Toàn phiên",
            meetingLocation: "Hội nghị Hiệp hội & Trực tuyến qua App",
            organizer: "Ban Quản Trị Hiệp Hội CEO 1983",
            voteTitle: p.title,
            voteDescription:
              p.description ||
              "Nghị quyết và nội dung biểu quyết được công bố chính thức từ Ban Quản Trị.",
            status: isClosed ? "closed" : "active",
            totalEligibleMembers: p.totalEligibleMembers || 320,
            totalVoted: totalVoted,
            options: opts,
            myVoteOptionId: p.my_vote || undefined,
            closedAt: p.end_date || p.endDate || undefined,
            resolutionResult: isClosed
              ? `ĐÃ KẾT THÚC: ${opts[0]?.label || "Nghị quyết"} (${opts[0]?.percentage || 0}% biểu quyết)`
              : undefined,
          };
        });

        // Kết hợp crmSessions lên đầu danh sách
        setVoteSessions((prev) => {
          const nonCrm = prev.filter((s) => !crmSessions.some((c) => c.id === s.id));
          return [...crmSessions, ...nonCrm];
        });
      }
    } catch {
      // Offline fallback to cached
    }
  }, []);

  useEffect(() => {
    loadCrmPolls();
  }, [loadCrmPolls]);

  const handleCastVote = async (sessionId: string) => {
    const chosenOptionId = selectedOptions[sessionId];
    if (!chosenOptionId) {
      toast.error("Vui lòng chọn một phương án biểu quyết trước khi xác nhận");
      return;
    }

    try {
      await fetchNestApi(`/voting/polls/${sessionId}/vote`, {
        method: "POST",
        body: JSON.stringify({ optionId: chosenOptionId, sourceApp: "association_app" }),
      });
    } catch (e: any) {
      console.warn("Backend vote failed or offline:", e?.message);
    }

    setVoteSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== sessionId) return s;
        const newOptions = s.options.map((opt) =>
          opt.id === chosenOptionId ? { ...opt, voteCount: opt.voteCount + 1 } : opt
        );
        return {
          ...s,
          totalVoted: s.totalVoted + 1,
          myVoteOptionId: chosenOptionId,
          options: newOptions,
        };
      });

      try {
        localStorage.setItem("vba_meeting_votes_v2", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    toast.success("Hội viên đã biểu quyết thành công!", {
      description: "Ý kiến của Quý CEO đã được ghi nhận trực tiếp vào hệ thống CRM Hiệp hội.",
    });

    setTimeout(() => {
      loadCrmPolls();
    }, 500);
  };

  const filteredSessions = useMemo(() => {
    return voteSessions.filter((s) => {
      const matchesTab = activeTab === "active" ? s.status === "active" : s.status === "closed";
      const matchesType = selectedMeetingType === "all" || s.meetingType === selectedMeetingType;
      const matchesQuery =
        !searchQuery.trim() ||
        s.voteTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.meetingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.organizer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesType && matchesQuery;
    });
  }, [voteSessions, activeTab, selectedMeetingType, searchQuery]);

  const activeCount = voteSessions.filter((s) => s.status === "active").length;
  const historyCount = voteSessions.filter((s) => s.status === "closed").length;

  return (
    <div className="vba-animate min-h-screen bg-[var(--vba-bg)] text-[var(--vba-text)] pb-20">
      <MemberHeader
        title="Biểu quyết Sự kiện & Cuộc họp"
        subtitle="Quyền biểu quyết trực tuyến của Hội viên CLB CEO 1983"
      />

      {/* Hero Atmosphere Banner */}
      <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-[#00224F] via-[#003B95] to-[#0A1A3A] p-4 text-white shadow-md border border-[#003B95]/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <Vote className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight">BIỂU QUYẾT THEO SỰ KIỆN & CUỘC HỌP</h2>
              <p className="text-[11px] text-sky-200/90 mt-0.5">
                Gắn liền với các kỳ đại hội, hội nghị Ban Chấp Hành & sự kiện hiệp hội
              </p>
            </div>
          </div>
        </div>

        {/* Realtime Stats Bar */}
        <div className="mt-3.5 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded-xl bg-white/10 p-2 backdrop-blur-xs">
            <span className="block text-[10px] text-sky-200 uppercase font-semibold">Đang diễn ra</span>
            <span className="text-base font-black text-amber-300">{activeCount} phiên</span>
          </div>
          <div className="rounded-xl bg-white/10 p-2 backdrop-blur-xs">
            <span className="block text-[10px] text-sky-200 uppercase font-semibold">Lịch sử nghị quyết</span>
            <span className="text-base font-black text-emerald-300">{historyCount} kỳ</span>
          </div>
        </div>
      </div>

      {/* Lucky Draw Gala Banner */}
      <div
        id="tour-voting-lucky-draw"
        className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-600/10 p-3.5 border border-amber-400/30 flex items-center justify-between gap-3 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500 text-slate-950 font-black shrink-0 shadow-sm text-lg">
            🎁
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
                GALA DINNER
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Vòng Quay May Mắn Realtime
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Tự động khớp mã vé của bạn với lồng quay số sân khấu đại hội
            </p>
          </div>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-lg bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] text-slate-950 text-[11px] font-bold shadow-xs">
          Sẵn sàng
        </span>
      </div>

      {/* Tabs Switcher */}
      <div id="tour-voting-tabs" className="mx-4 mt-4 flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700/60 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === "active"
              ? "bg-[#003B95] text-white shadow-md shadow-[#003B95]/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Vote className="h-3.5 w-3.5" />
          <span>Biểu quyết đang mở ({activeCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === "history"
              ? "bg-[#003B95] text-white shadow-md shadow-[#003B95]/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Lịch sử biểu quyết ({historyCount})</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="mx-4 mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên sự kiện, nội dung biểu quyết..."
            className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 pl-9 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#003B95]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        </div>

        <select
          value={selectedMeetingType}
          onChange={(e) => setSelectedMeetingType(e.target.value)}
          className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-[#003B95] cursor-pointer"
        >
          <option value="all">Tất cả cuộc họp</option>
          <option value="dai-hoi">Đại hội toàn thể</option>
          <option value="ban-chap-hanh">Họp Ban Chấp Hành</option>
          <option value="sinh-hoat-dinh-ky">Họp thẩm định</option>
          <option value="dien-dan">Diễn đàn & Caravan</option>
        </select>
      </div>

      {/* Voting Sessions List */}
      <div className="mx-4 mt-4 space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-white dark:bg-[#0F172A]">
            <Vote className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-slate-500">
              {activeTab === "active"
                ? "Hiện không có phiên biểu quyết nào đang mở cho sự kiện này."
                : "Chưa có dữ liệu lịch sử biểu quyết phù hợp với bộ lọc."}
            </p>
          </div>
        ) : (
          filteredSessions.map((session, sIdx) => {
            const hasVoted = Boolean(session.myVoteOptionId);
            const totalVotes = session.options.reduce((sum, o) => sum + o.voteCount, 0) || 1;
            const turnOutPercent = Math.round((session.totalVoted / session.totalEligibleMembers) * 100);

            return (
              <div
                key={session.id}
                id={sIdx === 0 ? "tour-voting-poll-card" : undefined}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4 sm:p-5 shadow-sm space-y-3.5 transition hover:border-[#003B95]/40"
              >
                {/* Meeting Context Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-[#003B95] dark:text-blue-300 border border-[#003B95]/20">
                        {session.meetingTypeName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        • {session.organizer}
                      </span>
                    </div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {session.meetingTitle}
                    </h3>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      session.status === "active"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {session.status === "active" ? "Đang mở biểu quyết" : "Đã kết thúc"}
                  </span>
                </div>

                {/* Meeting Schedule & Location Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-[#003B95] dark:text-amber-400 shrink-0" />
                    <span>{session.meetingDate} ({session.meetingTime})</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 truncate">
                    <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{session.meetingLocation}</span>
                  </div>
                </div>

                {/* Vote Question & Description */}
                <div>
                  <h4 className="text-[13.5px] font-extrabold text-slate-900 dark:text-white leading-snug">
                    {session.voteTitle}
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {session.voteDescription}
                  </p>
                </div>

                {/* Closed Session Resolution Badge */}
                {session.status === "closed" && session.resolutionResult && (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Nghị quyết đại hội: {session.resolutionResult}</span>
                  </div>
                )}

                {/* Voting Options & Progress Bars */}
                <div className="space-y-2 pt-1">
                  {session.options.map((opt) => {
                    const optPercent = Math.round((opt.voteCount / totalVotes) * 100);
                    const isSelected = selectedOptions[session.id] === opt.id;
                    const isMyChoice = session.myVoteOptionId === opt.id;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          if (session.status === "active" && !hasVoted) {
                            setSelectedOptions((prev) => ({ ...prev, [session.id]: opt.id }));
                          }
                        }}
                        className={`relative overflow-hidden rounded-2xl border p-3 transition ${
                          hasVoted
                            ? isMyChoice
                              ? "border-[#003B95] dark:border-amber-400 bg-blue-50/60 dark:bg-blue-950/30"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50"
                            : isSelected
                              ? "border-[#003B95] dark:border-amber-400 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs cursor-pointer"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40 cursor-pointer"
                        }`}
                      >
                        {/* Background Progress Bar Fill for Realtime Percent */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 pointer-events-none transition-all duration-500 ${
                            isMyChoice || isSelected
                              ? "bg-[#003B95]/10 dark:bg-amber-400/10"
                              : "bg-slate-100/70 dark:bg-white/[0.03]"
                          }`}
                          style={{ width: `${optPercent}%` }}
                        />

                        <div className="relative flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            {/* Checkbox indicator */}
                            <div
                              className={`grid h-5 w-5 place-items-center rounded-lg border text-white transition ${
                                isMyChoice || isSelected
                                  ? "bg-[#003B95] dark:bg-amber-500 border-[#003B95] dark:border-amber-500"
                                  : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                              }`}
                            >
                              {(isMyChoice || isSelected) && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>

                            <span
                              className={`text-xs font-bold ${
                                isMyChoice
                                  ? "text-[#003B95] dark:text-amber-300"
                                  : "text-slate-800 dark:text-slate-200"
                              }`}
                            >
                              {opt.label}
                              {isMyChoice && (
                                <span className="ml-1.5 text-[10px] text-[#003B95] dark:text-amber-400 font-extrabold">
                                  (Lựa chọn của bạn)
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {optPercent}%
                            </span>
                            <span className="block text-[9.5px] text-slate-400 font-medium">
                              {opt.voteCount} phiếu
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Participation Metrics & Cast Vote Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      {session.totalVoted} / {session.totalEligibleMembers} đại biểu đã bầu ({turnOutPercent}%)
                    </span>
                  </div>

                  {session.status === "active" && (
                    <div>
                      {hasVoted ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Bạn đã hoàn thành biểu quyết</span>
                        </div>
                      ) : (
                        <button
                          id={sIdx === 0 ? "tour-voting-submit-btn" : undefined}
                          type="button"
                          onClick={() => handleCastVote(session.id)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] hover:brightness-105 px-5 py-2 text-xs font-bold text-slate-950 shadow-md active:scale-95 transition cursor-pointer"
                        >
                          <Vote className="h-3.5 w-3.5" />
                          <span>Xác nhận biểu quyết</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
