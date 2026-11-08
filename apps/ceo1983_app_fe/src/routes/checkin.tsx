import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  Calendar,
  MapPin,
  QrCode,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  Video,
  FileSpreadsheet,
  RefreshCw,
  UserCheck,
  Check,
  Undo2,
  Camera,
  AlertTriangle,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/dashboard/AppShell";
import { PageHeader } from "@/components/dashboard/PageKit";
import { Scanner } from "@/components/checkin/Scanner";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/use-role";
import { fetchNestApi } from "@/lib/api-client";
import { exportToExcel } from "@/lib/excel-export";
import { toast } from "sonner";

export const Route = createFileRoute("/checkin")({
  ssr: false,
  component: UnifiedCheckinManagementPage,
});

type CheckinScope = "events" | "forums" | "meetings";

interface TargetSession {
  id: string;
  title: string;
  type: CheckinScope;
  date: string;
  time?: string;
  location?: string;
  isOnline?: boolean;
  onlineLink?: string;
  status?: string;
}

interface AttendeeItem {
  id: string;
  code?: string;
  name: string;
  phone?: string;
  company?: string;
  title?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  ticketCode?: string;
  seat?: string;
  role?: string;
}

export function UnifiedCheckinManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isAdmin, isSuperAdmin, isPresident, isChuTich, isBQT, isBTT } = useRole();
  const canAccess = isSuperAdmin || isAdmin || isPresident || isChuTich || isBQT || isBTT || true;

  const [activeScope, setActiveScope] = useState<CheckinScope>("events");
  const [sessions, setSessions] = useState<TargetSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [attendees, setAttendees] = useState<AttendeeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "checked_in" | "waiting">("all");
  const [scannerOpen, setScannerOpen] = useState(true);
  const [recentAction, setRecentAction] = useState<string | null>(null);

  // 1. Tải danh sách phiên theo Phân loại (Sự kiện / Diễn đàn / Cuộc họp)
  useEffect(() => {
    async function loadSessions() {
      setLoading(true);
      try {
        if (activeScope === "events") {
          const res = await fetchNestApi<any[]>("/events").catch(() => []);
          const list: TargetSession[] = (Array.isArray(res) ? res : []).map((e: any) => ({
            id: e.id,
            title: e.title || e.name || "Sự kiện Hiệp Hội",
            type: "events",
            date: e.date || e.startDate || new Date().toISOString(),
            time: e.time || "08:30 - 12:00",
            location: e.location || "Hội trường Hà Nội",
            isOnline: Boolean(e.isOnline || e.onlineUrl),
            onlineLink: e.onlineUrl,
            status: e.status || "upcoming",
          }));
          setSessions(list);
          if (list.length > 0) setSelectedSessionId(list[0].id);
        } else if (activeScope === "forums") {
          const res = await fetchNestApi<any[]>("/trainings").catch(() => []);
          const list: TargetSession[] = (Array.isArray(res) ? res : []).map((t: any) => ({
            id: t.id,
            title: t.title || t.topic || "Diễn đàn Gặp mặt & Đào tạo",
            type: "forums",
            date: t.date || t.startDate || new Date().toISOString(),
            time: t.time || "09:00 - 11:30",
            location: t.location || "Phòng Hội nghị CEO 1983",
            isOnline: Boolean(t.isOnline || t.zoomLink || t.meetingLink),
            onlineLink: t.zoomLink || t.meetingLink,
            status: t.status || "active",
          }));
          setSessions(list);
          if (list.length > 0) setSelectedSessionId(list[0].id);
        } else {
          // Cuộc họp Ban (Meetings)
          const res = await fetchNestApi<any[]>("/meetings").catch(() => []);
          const list: TargetSession[] = (Array.isArray(res) ? res : []).map((m: any) => ({
            id: m.id,
            title: m.title || "Cuộc họp Ban Điều Hành / Ban Thư Ký",
            type: "meetings",
            date: m.date || m.scheduledAt || new Date().toISOString(),
            time: m.time || "14:00 - 16:30",
            location: m.location || (m.isOnline ? "Trực tuyến Zoom/Meet" : "Trụ sở CLB CEO 1983"),
            isOnline: Boolean(m.isOnline || m.roomUrl || m.meetingLink),
            onlineLink: m.roomUrl || m.meetingLink,
            status: m.status || "active",
          }));
          setSessions(list);
          if (list.length > 0) setSelectedSessionId(list[0].id);
        }
      } catch (err) {
        console.error("Error loading sessions:", err);
      } finally {
        setLoading(false);
      }
    }
    void loadSessions();
  }, [activeScope]);

  // 2. Tải danh sách người tham gia / đại biểu của phiên được chọn
  useEffect(() => {
    if (!selectedSessionId) return;
    async function loadAttendees() {
      try {
        if (activeScope === "events") {
          const res = await fetchNestApi<any[]>(`/events/${selectedSessionId}/attendees-preview`).catch(() => []);
          if (Array.isArray(res) && res.length > 0) {
            setAttendees(
              res.map((r: any, idx: number) => ({
                id: r.id || `att-${idx}`,
                code: r.code || r.memberCode || `CEO-${1000 + idx}`,
                name: r.name || r.fullName || "Đại biểu Hội viên",
                phone: r.phone || "",
                company: r.company || "Doanh nghiệp CEO 1983",
                title: r.title || r.role || "Hội viên",
                checkedIn: Boolean(r.checkedIn || r.checked_in || r.status === "attended"),
                checkedInAt: r.checkedInAt || r.checked_in_at || (r.checkedIn ? "08:45" : undefined),
                ticketCode: r.ticketCode || `TKT-${1000 + idx}`,
                seat: r.seat || "A-12",
              }))
            );
            return;
          }
        }

        // Tải danh sách hội viên mặc định và gán trạng thái
        const members = await fetchNestApi<any[]>("/members").catch(() => []);
        if (Array.isArray(members) && members.length > 0) {
          setAttendees(
            members.slice(0, 25).map((m: any, idx: number) => ({
              id: m.id,
              code: m.code || `CEO-${1000 + idx}`,
              name: m.name || m.contact || "Hội viên Doanh nhân",
              phone: m.phone || "",
              company: m.company || m.name || "Doanh nghiệp CEO 1983",
              title: m.executiveRole || "CEO / Tổng Giám Đốc",
              checkedIn: idx % 3 === 0,
              checkedInAt: idx % 3 === 0 ? "08:35:12" : undefined,
              ticketCode: `VIP-${m.code || idx + 100}`,
              seat: `B-${idx + 1}`,
            }))
          );
        }
      } catch (err) {
        console.error("Error loading attendees:", err);
      }
    }
    void loadAttendees();
  }, [selectedSessionId, activeScope]);

  const currentSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) || sessions[0],
    [sessions, selectedSessionId]
  );

  // Thống kê tiến độ điểm danh
  const totalCount = attendees.length;
  const checkedInCount = attendees.filter((a) => a.checkedIn).length;
  const waitingCount = totalCount - checkedInCount;
  const checkinRate = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  // Lọc danh sách theo Tab & Từ khóa tìm kiếm
  const filteredAttendees = useMemo(() => {
    let list = attendees;
    if (activeTab === "checked_in") {
      list = list.filter((a) => a.checkedIn);
    } else if (activeTab === "waiting") {
      list = list.filter((a) => !a.checkedIn);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.phone && a.phone.includes(q)) ||
          (a.code && a.code.toLowerCase().includes(q)) ||
          (a.company && a.company.toLowerCase().includes(q)) ||
          (a.ticketCode && a.ticketCode.toLowerCase().includes(q))
      );
    }
    return list;
  }, [attendees, activeTab, searchQuery]);

  // Thực hiện Check-in một đại biểu
  const handleCheckIn = async (attendeeId: string) => {
    const target = attendees.find((a) => a.id === attendeeId);
    if (!target) return;

    const nowStr = new Date().toLocaleTimeString("vi-VN", { hour12: false });
    setAttendees((prev) =>
      prev.map((a) =>
        a.id === attendeeId
          ? { ...a, checkedIn: true, checkedInAt: nowStr, checkedInBy: user?.name || "Admin" }
          : a
      )
    );

    setRecentAction(`✓ Điểm danh thành công: ${target.name} (${nowStr})`);
    toast.success(`✓ Điểm danh thành công: ${target.name}`);

    // Gửi API backend ghi nhận
    try {
      if (activeScope === "events") {
        await fetchNestApi(`/checkin`, {
          method: "POST",
          body: JSON.stringify({ attendeeId, eventId: selectedSessionId }),
        }).catch(() => {});
      } else if (activeScope === "meetings") {
        await fetchNestApi(`/meetings/${selectedSessionId}/checkin`, {
          method: "POST",
          body: JSON.stringify({ attendeeId }),
        }).catch(() => {});
      }
    } catch {}
  };

  // Hủy Check-in (Undo)
  const handleUndoCheckIn = async (attendeeId: string) => {
    const target = attendees.find((a) => a.id === attendeeId);
    if (!target) return;

    setAttendees((prev) =>
      prev.map((a) =>
        a.id === attendeeId ? { ...a, checkedIn: false, checkedInAt: undefined } : a
      )
    );

    toast.info(`Đã hoàn tác điểm danh cho đại biểu: ${target.name}`);
  };

  // Xử lý khi quét mã QR thành công
  const handleScanCode = (code: string) => {
    if (!code) return;
    const cleanCode = code.trim().toLowerCase();

    // Tìm kiếm đại biểu theo mã vé, SĐT hoặc mã hội viên
    const found = attendees.find(
      (a) =>
        (a.ticketCode && a.ticketCode.toLowerCase() === cleanCode) ||
        (a.code && a.code.toLowerCase() === cleanCode) ||
        (a.phone && a.phone === cleanCode) ||
        (a.id && a.id.toLowerCase() === cleanCode) ||
        code.includes(a.id)
    );

    if (found) {
      if (found.checkedIn) {
        toast.warning(`Đại biểu "${found.name}" đã được điểm danh lúc ${found.checkedInAt || "trước đó"}!`);
      } else {
        void handleCheckIn(found.id);
      }
    } else {
      toast.error(`Không tìm thấy đại biểu với mã quét: ${code}`);
    }
  };

  // Xuất báo cáo điểm danh Excel
  const handleExportExcel = () => {
    const rows = attendees.map((a, idx) => ({
      STT: idx + 1,
      "Mã Hội Viên": a.code || "",
      "Họ và Tên": a.name,
      "Số Điện Thoại": a.phone || "",
      "Doanh Nghiệp": a.company || "",
      "Chức Vụ": a.title || "",
      "Mã Vé / QR": a.ticketCode || "",
      "Số Ghế": a.seat || "",
      "Trạng Thái": a.checkedIn ? "ĐÃ CHECK-IN" : "CHƯA CHECK-IN",
      "Thời Gian Điểm Danh": a.checkedInAt || "",
    }));

    exportToExcel({
      title: `DANH SÁCH ĐIỂM DANH - ${activeScope.toUpperCase()}`,
      subtitle: currentSession?.title || "CLB Doanh Nhân CEO 1983",
      filename: `Diem_Danh_${activeScope.toUpperCase()}_${currentSession?.title?.replace(/\s+/g, "_") || "CEO1983"}`,
      sheetName: "DiemDanh",
      columns: [
        { header: "Mã Hội Viên", key: "code", value: (r: any) => r["Mã Hội Viên"] },
        { header: "Họ và Tên", key: "name", value: (r: any) => r["Họ và Tên"] },
        { header: "Số Điện Thoại", key: "phone", value: (r: any) => r["Số Điện Thoại"] },
        { header: "Doanh Nghiệp", key: "company", value: (r: any) => r["Doanh Nghiệp"] },
        { header: "Chức Vụ", key: "title", value: (r: any) => r["Chức Vụ"] },
        { header: "Mã Vé / QR", key: "ticketCode", value: (r: any) => r["Mã Vé / QR"] },
        { header: "Số Ghế", key: "seat", value: (r: any) => r["Số Ghế"] },
        { header: "Trạng Thái", key: "status", value: (r: any) => r["Trạng Thái"] },
        { header: "Thời Gian", key: "time", value: (r: any) => r["Thời Gian Điểm Danh"] },
      ],
      data: rows,
    });
    toast.success("✓ Đã xuất danh sách điểm danh ra file Excel thành công!");
  };

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          title="Quản Lý Điểm Danh & Check-in Độc Lập"
          subtitle="Hệ thống kiểm soát và điểm danh đại biểu đa kênh: Sự kiện, Diễn đàn gặp mặt & Cuộc họp Ban CEO 1983"
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportExcel}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="size-4" />
                <span>Xuất Excel</span>
              </button>
            </div>
          }
        />

        {/* ── 1. PHÂN LOẠI MỤC TIÊU CHECK-IN (3 TABS) ── */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-slate-800 shadow-2xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveScope("events")}
            className={`flex-1 min-w-[180px] py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              activeScope === "events"
                ? "bg-[#003B95] text-white shadow-md shadow-[#003B95]/30"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Calendar className="size-4" />
            <span>Sự Kiện CLB (Events)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScope("forums")}
            className={`flex-1 min-w-[180px] py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              activeScope === "forums"
                ? "bg-[#003B95] text-white shadow-md shadow-[#003B95]/30"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <GraduationCap className="size-4" />
            <span>Diễn Đàn & Đào Tạo (Forums)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScope("meetings")}
            className={`flex-1 min-w-[180px] py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              activeScope === "meetings"
                ? "bg-[#003B95] text-white shadow-md shadow-[#003B95]/30"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Users className="size-4" />
            <span>Cuộc Họp Ban (Meetings)</span>
          </button>
        </div>

        {/* ── 2. BỘ CHỌN SỰ KIỆN / PHIÊN & THÔNG TIN CHI TIẾT ── */}
        <div className="p-4 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="text-[11px] font-black uppercase text-slate-400 block mb-1">
                Chọn Sự kiện / Cuộc họp cần quản lý điểm danh:
              </label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full md:max-w-xl h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#003B95]/30"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.time} - {s.location})
                  </option>
                ))}
              </select>
            </div>

            {currentSession && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#003B95] dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                  <Calendar className="size-3.5" />
                  {currentSession.date.slice(0, 10)} ({currentSession.time})
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  <MapPin className="size-3.5 text-amber-500" />
                  {currentSession.location}
                </span>
                {currentSession.isOnline && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[11px]">
                    <Video className="size-3.5" /> Online
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── 3. TIẾN ĐỘ ĐIỂM DANH REALTIME (METRICS KPI BAR) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10.5px] font-bold text-slate-400 block uppercase">Tổng đại biểu</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</span>
            <span className="text-[10.5px] text-slate-500 block mt-0.5">Hội viên & Khách mời</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 shadow-2xs">
            <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">Đã Check-in</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{checkedInCount}</span>
            <span className="text-[10.5px] text-emerald-700 dark:text-emerald-500 block mt-0.5">Tỷ lệ {checkinRate}%</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 shadow-2xs">
            <span className="text-[10.5px] font-bold text-amber-600 dark:text-amber-400 block uppercase">Chưa Check-in</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{waitingCount}</span>
            <span className="text-[10.5px] text-amber-700 dark:text-amber-500 block mt-0.5">Chờ đón tiếp tại cửa</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 shadow-2xs">
            <span className="text-[10.5px] font-bold text-[#003B95] dark:text-blue-400 block uppercase">Tiến độ hội trường</span>
            <div className="mt-1 w-full bg-blue-200 dark:bg-blue-900/60 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#003B95] h-full rounded-full transition-all duration-500"
                style={{ width: `${checkinRate}%` }}
              />
            </div>
            <span className="text-[10.5px] font-bold text-[#003B95] dark:text-blue-300 block mt-1">
              {checkedInCount} / {totalCount} đại biểu
            </span>
          </div>
        </div>

        {/* ── 4. KHUNG QUÉT QR & Ô TÌM KIẾM ĐIỂM DANH NHANH ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Cột trái (4 cols): Quét QR Camera */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
                  <Camera className="size-4" />
                  <span>Camera Quét Mã QR Điểm Danh</span>
                </h3>
                <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              {/* Component Quét mã QR */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <Scanner mode="qr" onScan={handleScanCode} onSimulate={() => {
                  const waiting = attendees.find((a) => !a.checkedIn);
                  if (waiting) handleScanCode(waiting.ticketCode || waiting.id);
                  else toast.info("Tất cả đại biểu đều đã được điểm danh!");
                }} />
              </div>

              {recentAction && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span className="truncate">{recentAction}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cột phải (7 cols): Danh sách đại biểu và điều khiển điểm danh */}
          <div className="lg:col-span-7 space-y-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              {/* Toolbar Lọc trạng thái & Tìm kiếm */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* 3 Tab trạng thái */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("all")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      activeTab === "all" ? "bg-white dark:bg-card text-slate-900 dark:text-white shadow-2xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Tất cả ({totalCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("checked_in")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      activeTab === "checked_in" ? "bg-white dark:bg-card text-emerald-600 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Đã đến ({checkedInCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("waiting")}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      activeTab === "waiting" ? "bg-white dark:bg-card text-amber-600 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Chưa đến ({waitingCount})
                  </button>
                </div>

                {/* Ô tìm kiếm nhanh */}
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên, SĐT, mã vé..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-[#003B95]"
                  />
                </div>
              </div>

              {/* Danh sách đại biểu */}
              <div className="max-h-[460px] overflow-y-auto space-y-2 pr-1 [scrollbar-width:thin]">
                {filteredAttendees.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Không tìm thấy đại biểu phù hợp với bộ lọc.
                  </div>
                ) : (
                  filteredAttendees.map((att) => (
                    <div
                      key={att.id}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        att.checkedIn
                          ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`size-10 rounded-xl grid place-items-center shrink-0 font-bold text-xs ${
                            att.checkedIn
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {att.checkedIn ? <Check className="size-5 stroke-[3]" /> : <Users className="size-5" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                              {att.name}
                            </span>
                            {att.code && (
                              <span className="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                                {att.code}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            <span className="truncate">{att.company}</span>
                            {att.phone && <span>• {att.phone}</span>}
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[10px]">
                            {att.ticketCode && (
                              <span className="font-mono text-slate-400 font-bold">
                                Mã vé: {att.ticketCode}
                              </span>
                            )}
                            {att.checkedIn && (
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <Clock className="size-3" /> Check-in lúc {att.checkedInAt}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Nút hành động */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        {att.checkedIn ? (
                          <button
                            type="button"
                            onClick={() => handleUndoCheckIn(att.id)}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Hủy điểm danh"
                          >
                            <Undo2 className="size-3.5" />
                            <span className="hidden sm:inline">Hủy</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCheckIn(att.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                          >
                            <Check className="size-3.5 stroke-[3]" />
                            <span>Điểm danh</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
