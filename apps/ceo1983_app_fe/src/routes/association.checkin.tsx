import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  QrCode,
  Wifi,
  ScanLine,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  XCircle,
  Clock,
  MapPin,
  History,
  CloudOff,
  Cloud,
  User,
  UserPlus,
  MessageSquare,
  Building2,
  BadgeCheck,
  ShieldCheck,
  ShieldAlert,
  Ticket,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  KeyRound,
  RotateCcw,
  Search,
  Settings2,
  X,
  Copy,
  Download,
  ExternalLink,
  Share2,
  Lock,
} from "lucide-react";
import { MemberHeader } from "@/components/member/MemberShell";
import {
  getMyCheckinState,
  checkInMyself,
  getMyMember,
  type MyCheckinRecord,
  type CheckinStatus,
} from "@/lib/member-app.functions";
import { useServerData } from "@/hooks/use-server-data";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/lib/i18n";
import { extractScanCode } from "@/lib/scan";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { fetchNestApi, resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";
import heroImg from "@/assets/vba-hero.jpg";
import {
  ScannedTicketDetailModal,
  type ScannedTicketData,
} from "@/components/events/ScannedTicketDetailModal";

export const Route = createFileRoute("/association/checkin")({
  component: CheckinScreen,
});

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

function CheckinScreen() {
  const t = useT();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fetchMember = useServerFn(getMyMember);
  const { data: member } = useServerData<any>(() => fetchMember(), null, "vba_my_member");

  // 2 Primary Tabs: "Quét vé & Check-in" vs "Mã QR Sự Kiện"
  const [mainTab, setMainTab] = useState<"scan" | "event_qr">("scan");
  const mode = "qr";
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<MyCheckinRecord | null>(null);
  const [history, setHistory] = useState<MyCheckinRecord[]>([]);
  const [online, setOnline] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Real backend DB data for events and registrations
  const { data: serverEventsData } = useServerData<any[]>(
    () => fetchNestApi<any[]>("/events").catch(() => []),
    [],
    "vba_events_checkin"
  );
  const { data: serverRegistrations, reload: reloadRegistrations } = useServerData<any[]>(
    () => fetchNestApi<any[]>("/events/registrations").catch(() => []),
    [],
    "vba_registrations_checkin"
  );

  // Find current user's registration from real DB (ignoring cancelled ones)
  const myRealRegistration = useMemo(() => {
    if (!serverRegistrations || serverRegistrations.length === 0) return null;
    return (
      serverRegistrations.find(
        (r: any) =>
          r.status !== "cancelled" &&
          r.status !== "canceled" &&
          ((member?.code && r.memberCode === member.code) ||
          (user?.email && r.email === user.email) ||
          (user?.id && (r.userId === user.id || r.id === user.id)))
      ) || null
    );
  }, [serverRegistrations, member, user]);

  const activeEvent = useMemo(() => {
    if (myRealRegistration?.eventId && serverEventsData) {
      const match = serverEventsData.find((e: any) => e.id === myRealRegistration.eventId);
      if (match) return match;
    }
    return serverEventsData?.[0] || null;
  }, [serverEventsData, myRealRegistration]);

  // Manual ticket lookup input
  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  // Scanned Ticket Details for Media Department Member
  const [scannedTicket, setScannedTicket] = useState<ScannedTicketData | null>(null);

  // Scanned Member fallback (for card scan)
  const [scannedMember, setScannedMember] = useState<{
    code: string;
    name: string;
    personName: string;
    personTitle: string;
    avatar?: string | null;
    coverUrl?: string | null;
    userId?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null>(null);

  // Registered event ticket pass for member (ignore cancelled)
  const registeredEventPass = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const records = JSON.parse(localStorage.getItem("vba_registered_event_records") || "[]");
      if (Array.isArray(records) && records.length > 0) {
        const valid = records.filter((r: any) => r.status !== "cancelled" && r.status !== "canceled");
        return valid[0] || null;
      }
    } catch {}
    return null;
  }, []);

  // Listen to event status changes (registration / cancellation)
  useEffect(() => {
    const handleEventsChanged = () => {
      reloadRegistrations();
    };
    window.addEventListener("vba.events.changed", handleEventsChanged);
    window.addEventListener("vba-event-registered", handleEventsChanged);
    window.addEventListener("storage", handleEventsChanged);
    return () => {
      window.removeEventListener("vba.events.changed", handleEventsChanged);
      window.removeEventListener("vba-event-registered", handleEventsChanged);
      window.removeEventListener("storage", handleEventsChanged);
    };
  }, [reloadRegistrations]);

  // Media Department override (for testing only)
  const [mediaOverride, setMediaOverride] = useState<boolean>(false);

  // Events where current user is specifically assigned as QR scanner in qr_scanners
  // Riêng Quản trị, Chủ tịch, Admin luôn có toàn quyền quét mã check-in ở tất cả các sự kiện
  const assignedEvents = useMemo(() => {
    if (!serverEventsData || serverEventsData.length === 0) return [];
    if (mediaOverride) return serverEventsData;

    const role = (user?.role || member?.role || "").toLowerCase().trim();
    const isSuperOrAdmin =
      Boolean((user as any)?.isAdmin) ||
      Boolean((user as any)?.isPresident) ||
      user?.permissions?.includes("admin:full_access") ||
      user?.permissions?.includes("event:scan_qr") ||
      role === "quan_tri" ||
      role === "admin" ||
      role === "chu_tich" ||
      role === "platform_admin" ||
      role.includes("quản trị") ||
      role.includes("chủ tịch") ||
      role.includes("admin");

    if (isSuperOrAdmin) return serverEventsData;

    const myIds = [
      user?.id,
      member?.id,
      member?.code,
      member?.phone,
      member?.email,
      (user as any)?.email,
    ]
      .filter(Boolean)
      .map((x) => String(x).toLowerCase().trim());

    return serverEventsData.filter((ev: any) => {
      let scanners = ev.qrScanners || ev.qrStaff || ev.qr_scanners || ev.qr_staff_ids || [];
      if (typeof scanners === "string") {
        try {
          scanners = JSON.parse(scanners);
        } catch {
          scanners = [];
        }
      }
      if (!Array.isArray(scanners) || scanners.length === 0) return false;
      return scanners.some((s: any) => {
        if (typeof s === "string") {
          const lower = s.toLowerCase().trim();
          return myIds.some((id) => lower === id || lower.includes(id));
        }
        if (typeof s === "object" && s !== null) {
          const objVals = [s.id, s.code, s.userId, s.memberCode, s.phone, s.email, s.name]
            .filter(Boolean)
            .map((x) => String(x).toLowerCase().trim());
          return myIds.some((id) => objVals.includes(id));
        }
        return false;
      });
    });
  }, [serverEventsData, member, user, mediaOverride]);

  const [selectedScannerEventId, setSelectedScannerEventId] = useState<string>("");

  useEffect(() => {
    if (assignedEvents.length > 0) {
      if (!selectedScannerEventId || !assignedEvents.some((e: any) => e.id === selectedScannerEventId)) {
        setSelectedScannerEventId(assignedEvents[0].id);
      }
    }
  }, [assignedEvents, selectedScannerEventId]);

  const currentScanningEvent = useMemo(() => {
    return assignedEvents.find((e: any) => e.id === selectedScannerEventId) || assignedEvents[0] || null;
  }, [assignedEvents, selectedScannerEventId]);

  // Check if current user is allowed to scan:
  // Must be strictly selected in assignedEvents (qr_scanners of an event)
  const isMediaDepartment = useMemo(() => {
    if (mediaOverride) return true;
    return assignedEvents.length > 0;
  }, [mediaOverride, assignedEvents]);

  const toggleMediaOverride = () => {
    const next = !mediaOverride;
    setMediaOverride(next);
    if (next) {
      toast.success("Đã kích hoạt vai trò Ban Truyền Thông để kiểm thử!");
    } else {
      toast.info("Đã tắt vai trò Ban Truyền Thông kiểm thử.");
    }
  };

  const fetchState = useServerFn(getMyCheckinState);
  const submitCheckin = useServerFn(checkInMyself);

  const statusMap: Record<
    CheckinStatus,
    { label: string; sub: string; Icon: typeof CheckCircle2; color: string; bg: string }
  > = {
    success: {
      label: t("m.checkin.statusSuccessLabel"),
      sub: t("m.checkin.statusSuccessSub"),
      Icon: CheckCircle2,
      color: "#3fbf7f",
      bg: "rgba(63,191,127,0.14)",
    },
    already: {
      label: t("m.checkin.statusAlreadyLabel"),
      sub: t("m.checkin.statusAlreadySub"),
      Icon: AlertTriangle,
      color: "#e8a04c",
      bg: "rgba(232,160,76,0.14)",
    },
    invalid: {
      label: t("m.checkin.statusInvalidLabel"),
      sub: t("m.checkin.statusInvalidSub"),
      Icon: XCircle,
      color: "#ff6b6b",
      bg: "rgba(255,107,107,0.14)",
    },
  };

  const refresh = useCallback(async () => {
    try {
      const rows = await fetchState();
      setHistory(rows);
    } catch {
      /* keep last known server-fetched state */
    }
  }, [fetchState]);

  useEffect(() => {
    setOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    void refresh();
    const goOnline = () => {
      setOnline(true);
      void refresh();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [refresh]);

  // --- Real QR (camera via useQrScanner) + NFC scanning ---
  const nfcAbort = useRef<AbortController | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { videoRef, status: qrStatus } = useQrScanner({
    active: scanning && mode === "qr" && isMediaDepartment,
    onDetect: (val) => {
      void handlePayload(val);
    },
  });

  useEffect(() => {
    if (qrStatus === "denied") {
      setError(t("m.checkin.cameraError") + " — Camera bị chặn, vui lòng cấp quyền trong cài đặt trình duyệt.");
      setScanning(false);
    } else if (qrStatus === "unsupported") {
      setError("Trình duyệt không hỗ trợ truy cập camera.");
      setScanning(false);
    } else if (qrStatus === "error") {
      setError(t("m.checkin.cameraError"));
      setScanning(false);
    }
  }, [qrStatus, t]);

  const stopScan = useCallback(() => {
    try {
      nfcAbort.current?.abort();
    } catch {
      /* ignore */
    }
    nfcAbort.current = null;
    setScanning(false);
  }, []);

  // Helper to load checked-in registry
  const getCheckedInRegistry = (): Record<string, { checkedInAt: string; scannedBy: string }> => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("vba_checkedin_tickets") || "{}");
    } catch {
      return {};
    }
  };

  // Debounced handler: inspect payload for Ticket QR or Card QR
  const lastScan = useRef<{ payload: string; t: number } | null>(null);
  const handlePayload = useCallback(
    async (raw: string) => {
      const resolved = extractScanCode(raw) || raw.trim();
      if (!resolved) return;
      const now = Date.now();
      if (
        lastScan.current &&
        lastScan.current.payload === resolved &&
        now - lastScan.current.t < 2500
      ) {
        return;
      }
      lastScan.current = { payload: resolved, t: now };

      // Stop camera while modal is open
      stopScan();

      // Check checked-in tickets registry
      const checkedInMap = getCheckedInRegistry();

      // Fetch latest registrations and events from backend
      let currentRegs: any[] = serverRegistrations || [];
      if (!currentRegs || currentRegs.length === 0) {
        try {
          currentRegs = await fetchNestApi<any[]>("/events/registrations").catch(() => []);
        } catch {}
      }

      let currentEvents: any[] = serverEventsData || [];
      if (!currentEvents || currentEvents.length === 0) {
        try {
          currentEvents = await fetchNestApi<any[]>("/events").catch(() => []);
        } catch {}
      }

      // Chức năng soát vé sự kiện chỉ quét mã QR vé sự kiện của người có vé
      // Nếu quét nhầm mã QR sự kiện / form đăng ký thì từ chối và yêu cầu xuất trình Thẻ vé
      if (
        resolved.startsWith("event_checkin:") ||
        resolved.startsWith("EVENT_CHECKIN:") ||
        resolved.includes("/events/")
      ) {
        toast.error("Đây là mã QR sự kiện/đăng ký, không phải vé đại biểu!", {
          description: "Chức năng soát vé chỉ quét mã QR trên Thẻ vé điện tử của người đã có vé. Vui lòng yêu cầu đại biểu xuất trình vé!",
          duration: 5000,
        });
        setError("Mã QR sự kiện không thể dùng để soát vé. Vui lòng quét mã trên Thẻ vé điện tử của đại biểu!");
        return;
      }

      // PRIMARY CHECK: Call backend scan-ticket API for accurate cross-event and registration lookup
      try {
        const scanRes = await fetchNestApi<any>("/checkin/scan-ticket", {
          method: "POST",
          body: JSON.stringify({
            payload: resolved,
            currentEventId: currentScanningEvent?.id || activeEvent?.id,
            confirm: false,
          }),
        }).catch(() => null);

        if (scanRes && scanRes.success && scanRes.attendeeName) {
          if (scanRes.eventMismatch) {
            toast.warning("Vé không thuộc sự kiện đang chọn soát vé!", {
              description: `Vé của ${scanRes.attendeeName} thuộc: "${scanRes.eventTitle}". Sự kiện bàn đang soát: "${scanRes.currentEventTitle || currentScanningEvent?.name || activeEvent?.name}"`,
              duration: 8000,
            });
          }
          setScannedTicket({
            ticketCode: scanRes.ticketCode,
            attendeeName: scanRes.attendeeName,
            attendeePhone: scanRes.attendeePhone,
            attendeeCompany: scanRes.attendeeCompany,
            attendeePosition: scanRes.attendeePosition,
            attendeeAvatar: scanRes.attendeeAvatar,
            memberCode: scanRes.memberCode,
            eventId: scanRes.eventId,
            eventTitle: scanRes.eventTitle,
            eventDate: scanRes.eventDate,
            eventLocation: scanRes.eventLocation,
            ticketType: scanRes.ticketType,
            seatAssignment: scanRes.seatAssignment,
            luckyNumber: scanRes.luckyNumber,
            ticketCount: scanRes.ticketCount || 1,
            isCheckedIn: scanRes.isCheckedIn,
            checkedInAt: scanRes.checkedInAt,
            scannedBy: scanRes.scannedBy,
            eventMismatch: scanRes.eventMismatch,
            currentEventId: scanRes.currentEventId,
            currentEventTitle: scanRes.currentEventTitle,
          });
          return;
        }
      } catch (err) {
        console.warn("Scan ticket backend call failed, falling back to local resolver", err);
      }

      // CASE 0B: Attendee Ticket QR scanned by Gatekeeper (event_ticket:EVENT_ID:MEMBER_CODE:SEAT:LUCKY)
      if (resolved.startsWith("event_ticket:") || resolved.startsWith("EVENT_TICKET:")) {
        const parts = resolved.split(":");
        const eventId = parts[1] || "current-event";
        const mCode = parts[2] || "";
        const seat = parts[3] ? decodeURIComponent(parts[3]) : "";
        const lucky = parts[4] ? decodeURIComponent(parts[4]) : "";
        const matchedEvent = currentEvents.find((e: any) => e.id === eventId) || currentEvents[0];

        // 1. Look up real registration in DB
        const regMatch = currentRegs.find(
          (r: any) => r.memberCode === mCode || r.id === mCode || r.ticketCode === mCode
        );

        if (regMatch) {
          const ticketCode = regMatch.id || `TKT-${eventId}-${mCode}`;
          const isChecked = Boolean(regMatch.checkedInAt) || !!checkedInMap[ticketCode];

          setScannedTicket({
            ticketCode,
            attendeeName: regMatch.memberName || regMatch.name || "Đại biểu Tham dự",
            attendeePhone: regMatch.phone || regMatch.email || "—",
            attendeeCompany: regMatch.company || (member as any)?.companyName || "CLB Doanh nhân CEO 1983",
            attendeePosition: regMatch.position || regMatch.ticketType || "Hội viên chính thức",
            eventTitle: matchedEvent?.name || matchedEvent?.title || regMatch.eventTitle || "Đại hội Hội viên CLB CEO 1983",
            eventDate: matchedEvent?.date ? new Date(matchedEvent.date).toLocaleDateString("vi-VN") : "27/09/2026",
            eventLocation: matchedEvent?.location || "Trung tâm Hội nghị Quốc gia, Hà Nội",
            ticketType: regMatch.ticketType || "Vé VIP Hội Viên",
            seatAssignment: regMatch.seatAssignment || seat || "Bàn VIP 02 - Ghế 04",
            luckyNumber: regMatch.luckyNumber || lucky || `#${mCode.slice(-4)}`,
            ticketCount: 1,
            isCheckedIn: isChecked,
            checkedInAt: regMatch.checkedInAt || checkedInMap[ticketCode]?.checkedInAt || null,
            scannedBy: checkedInMap[ticketCode]?.scannedBy || "Ban Truyền Thông CEO 1983",
          });
          return;
        }

        // 2. Look up member public card in DB
        if (mCode) {
          try {
            const cardData = await fetchNestApi<any>(`/business-cards/public-card/${mCode}`).catch(() => null);
            if (cardData && (cardData.fullName || cardData.name || cardData.memberCode)) {
              const ticketCode = `TKT-${eventId}-${mCode}`;
              const isChecked = !!checkedInMap[ticketCode];

              setScannedTicket({
                ticketCode,
                attendeeName: cardData.fullName || cardData.displayName || cardData.name || "Hội viên Doanh Nhân",
                attendeePhone: cardData.phone || "—",
                attendeeCompany: cardData.companyName || cardData.company || "Công ty thành viên CEO 1983",
                attendeePosition: cardData.executiveRole || cardData.jobTitle || "Ban Thường Trực • Hội viên CEO 1983",
                attendeeAvatar: cardData.avatarUrl || cardData.avatar || null,
                eventTitle: matchedEvent?.name || "Đại hội Hội viên CLB CEO 1983 & Tuyên dương Doanh nghiệp 2026",
                eventDate: matchedEvent?.date ? new Date(matchedEvent.date).toLocaleDateString("vi-VN") : "27/09/2026",
                eventLocation: matchedEvent?.location || "Trung tâm Hội nghị Quốc gia, Hà Nội",
                ticketType: "Vé Mời Danh Dự (VIP Member Pass)",
                seatAssignment: seat || "Bàn VIP 01 - Ghế 01",
                luckyNumber: lucky || `#${mCode.slice(-4).toUpperCase()}`,
                ticketCount: 1,
                isCheckedIn: isChecked,
                checkedInAt: checkedInMap[ticketCode]?.checkedInAt || null,
                scannedBy: checkedInMap[ticketCode]?.scannedBy || "Ban Truyền Thông CEO 1983",
              });
              return;
            }
          } catch {}
        }

        toast.error("Không tìm thấy thông tin vé đại biểu trong hệ thống!", {
          description: `Mã hội viên [${mCode || resolved}] chưa đăng ký sự kiện này.`,
          duration: 5000,
        });
        setError(`Mã đại biểu "${mCode || resolved}" chưa có thông tin đăng ký sự kiện!`);
        return;
      }

      // CASE 1: JSON payload encoded in Event Ticket QR
      let parsedJson: any = null;
      try {
        if (resolved.startsWith("{") && resolved.endsWith("}")) {
          parsedJson = JSON.parse(resolved);
        }
      } catch {}

      if (parsedJson && (parsedJson.ticketCode || parsedJson.invoiceNo || parsedJson.eventId || parsedJson.memberCode)) {
        const tCode = parsedJson.ticketCode || parsedJson.invoiceNo || parsedJson.id || "";
        const mCode = parsedJson.memberCode || "";

        const regMatch = currentRegs.find(
          (r: any) => (tCode && (r.id === tCode || r.ticketCode === tCode)) || (mCode && r.memberCode === mCode)
        );

        if (regMatch) {
          const ticketCode = regMatch.id || tCode;
          const matchedEvent = currentEvents.find((e: any) => e.id === regMatch.eventId) || currentEvents[0];
          const isChecked = Boolean(regMatch.checkedInAt) || !!checkedInMap[ticketCode];

          setScannedTicket({
            ticketCode,
            attendeeName: regMatch.memberName || regMatch.name || "Đại biểu danh dự",
            attendeePhone: regMatch.phone || regMatch.email || "—",
            attendeeCompany: regMatch.company || "Công ty thành viên CEO 1983",
            attendeePosition: regMatch.position || regMatch.ticketType || "Lãnh đạo Doanh nghiệp",
            eventTitle: matchedEvent?.name || regMatch.eventTitle || "Đại hội Hội viên CLB CEO 1983",
            eventDate: matchedEvent?.date ? new Date(matchedEvent.date).toLocaleDateString("vi-VN") : "27/09/2026",
            eventLocation: matchedEvent?.location || "Trung tâm Hội nghị Quốc gia, Hà Nội",
            ticketType: regMatch.ticketType || "VIP Standard Pass",
            seatAssignment: regMatch.seatAssignment || "Bàn VIP 08 - Ghế 02",
            luckyNumber: regMatch.luckyNumber || `#${1000 + (now % 8999)}`,
            ticketCount: 1,
            isCheckedIn: isChecked,
            checkedInAt: regMatch.checkedInAt || checkedInMap[ticketCode]?.checkedInAt || null,
            scannedBy: checkedInMap[ticketCode]?.scannedBy || "Ban Truyền Thông CEO 1983",
          });
          return;
        }

        if (parsedJson.attendeeName || parsedJson.name) {
          const ticketCode = tCode || `TKT-${now}`;
          const isChecked = !!checkedInMap[ticketCode];
          setScannedTicket({
            ticketCode,
            attendeeName: parsedJson.attendeeName || parsedJson.name,
            attendeePhone: parsedJson.attendeePhone || parsedJson.phone || "—",
            attendeeCompany: parsedJson.attendeeCompany || parsedJson.company || "CLB Doanh Nhân CEO 1983",
            attendeePosition: parsedJson.attendeePosition || parsedJson.position || "Đại biểu",
            eventTitle: parsedJson.eventTitle || currentEvents[0]?.name || "Đại hội Hội viên CLB CEO 1983",
            eventDate: parsedJson.eventDate || "27/09/2026",
            eventLocation: parsedJson.eventLocation || "Trung tâm Hội nghị Quốc gia, Hà Nội",
            ticketType: parsedJson.ticketType || "VIP Standard Pass",
            seatAssignment: parsedJson.seatAssignment || "Bàn VIP 08 - Ghế 02",
            luckyNumber: parsedJson.luckyNumber || `#${1000 + (now % 8999)}`,
            ticketCount: parsedJson.ticketCount || 1,
            isCheckedIn: isChecked,
            checkedInAt: checkedInMap[ticketCode]?.checkedInAt || null,
            scannedBy: checkedInMap[ticketCode]?.scannedBy || "Ban Truyền Thông CEO 1983",
          });
          return;
        }

        toast.error("Mã vé không tồn tại trong hệ thống đăng ký sự kiện!");
        setError("Mã vé không hợp lệ hoặc chưa được đăng ký trong hệ thống!");
        return;
      }

      // CASE 2: Real Database Ticket / Registration Lookup (REG-..., TKT-..., EVT-..., UUID, or manual input)
      const ticketMatch = resolved.match(/(REG-[0-9A-Za-z-]+|TKT-[0-9A-Za-z-]+|EVT-[0-9A-Za-z-]+)/i);
      const searchTarget = (ticketMatch ? ticketMatch[1] : resolved).toUpperCase();

      const foundReg = currentRegs.find(
        (r: any) =>
          r.id?.toUpperCase() === searchTarget ||
          r.id?.toUpperCase() === resolved.toUpperCase() ||
          r.ticketCode?.toUpperCase() === searchTarget ||
          r.ticketCode?.toUpperCase() === resolved.toUpperCase() ||
          r.memberCode?.toUpperCase() === searchTarget ||
          r.memberCode?.toUpperCase() === resolved.toUpperCase() ||
          r.qrPayload === resolved
      );

      if (foundReg) {
        const ticketCode = foundReg.id;
        const matchedEvent = currentEvents.find((e: any) => e.id === foundReg.eventId) || currentEvents[0];
        const isChecked = Boolean(foundReg.checkedInAt) || !!checkedInMap[ticketCode];

        setScannedTicket({
          ticketCode,
          attendeeName: foundReg.memberName || foundReg.name || "Đại biểu tham dự",
          attendeePhone: foundReg.phone || foundReg.email || "—",
          attendeeCompany: foundReg.company || "Công ty thành viên CLB CEO 1983",
          attendeePosition: foundReg.position || foundReg.ticketType || "Hội viên chính thức",
          eventTitle: matchedEvent?.name || matchedEvent?.title || foundReg.eventTitle || "Đại hội Hội viên CLB CEO 1983",
          eventDate: matchedEvent?.date ? new Date(matchedEvent.date).toLocaleDateString("vi-VN") : "27/09/2026",
          eventLocation: matchedEvent?.location || "Trung tâm Hội nghị Quốc gia, Hà Nội",
          ticketType: foundReg.ticketType || "Vé Tham Dự Hội Viên",
          seatAssignment: foundReg.seatAssignment || "Bàn VIP 02 - Ghế 04",
          luckyNumber: foundReg.luckyNumber || `#${foundReg.id.slice(-4).toUpperCase()}`,
          ticketCount: 1,
          isCheckedIn: isChecked,
          checkedInAt: foundReg.checkedInAt || checkedInMap[ticketCode]?.checkedInAt || null,
          scannedBy: checkedInMap[ticketCode]?.scannedBy || "Ban Truyền Thông CEO 1983",
        });
        return;
      }

      // CASE 3: Public Card / Member Code (M1983-...)
      const cardMatch =
        resolved.match(/(M1983-[0-9A-Za-z-]+)/i) ||
        (raw.includes("/card/") ? raw.split("/card/")[1]?.split(/[\/?#]/)[0] : null);
      const memberCode = cardMatch ? (typeof cardMatch === "string" ? cardMatch : cardMatch[1]) : null;

      if (memberCode) {
        try {
          const cardData = await fetchNestApi<any>(`/business-cards/public-card/${memberCode}`);
          if (cardData && (cardData.fullName || cardData.name || cardData.memberCode)) {
            const ticketCode = `TKT-${memberCode.toUpperCase()}`;
            const isChecked = !!checkedInMap[ticketCode];
            const matchedEvent = currentEvents[0];

            setScannedTicket({
              ticketCode,
              attendeeName: cardData.fullName || cardData.displayName || cardData.name || "Hội viên Doanh Nhân",
              attendeePhone: cardData.phone || "—",
              attendeeCompany: cardData.companyName || cardData.company || "Công ty thành viên CEO 1983",
              attendeePosition: cardData.executiveRole || cardData.jobTitle || "Ban Thường Trực • Hội viên CEO 1983",
              attendeeAvatar: cardData.avatarUrl || cardData.avatar || null,
              eventTitle: matchedEvent?.name || "Đại hội Hội viên CLB CEO 1983 & Tuyên dương Doanh nghiệp 2026",
              eventDate: matchedEvent?.date ? new Date(matchedEvent.date).toLocaleDateString("vi-VN") : "27/09/2026",
              eventLocation: matchedEvent?.location || "Trung tâm Hội nghị Quốc gia, Hà Nội",
              ticketType: "Vé Mời Danh Dự (VIP Member Pass)",
              seatAssignment: "Bàn VIP 01 - Ban Chủ Tọa - Ghế 01",
              luckyNumber: `#${memberCode.slice(-4).toUpperCase()}`,
              ticketCount: 1,
              isCheckedIn: isChecked,
              checkedInAt: checkedInMap[ticketCode]?.checkedInAt || null,
              scannedBy: checkedInMap[ticketCode]?.scannedBy || "Ban Truyền Thông CEO 1983",
            });
            return;
          }
        } catch {}
      }

      // CASE 4: Check against local stored registered event records (for local testing records)
      let foundRecord: any = null;
      try {
        const stored = JSON.parse(localStorage.getItem("vba_registered_event_records") || "[]");
        foundRecord = stored.find(
          (r: any) =>
            r.ticketCode === resolved ||
            r.id === resolved ||
            r.invoiceNo === resolved ||
            resolved.includes(r.ticketCode) ||
            resolved.includes(r.id)
        );
      } catch {}

      if (foundRecord) {
        const ticketCode = foundRecord.ticketCode || foundRecord.id;
        const isChecked = !!checkedInMap[ticketCode];
        setScannedTicket({
          ticketCode,
          attendeeName: foundRecord.name || member?.name || "Đại biểu danh dự",
          attendeePhone: foundRecord.phone || member?.phone || "—",
          attendeeCompany: foundRecord.company || (member as any)?.companyName || "CLB Doanh Nhân CEO 1983",
          attendeePosition: foundRecord.position || member?.title || "Hội viên chính thức",
          eventTitle: foundRecord.eventTitle || foundRecord.name || currentEvents[0]?.name || "Đại hội Hội viên CLB CEO 1983",
          eventDate: foundRecord.date || "27/09/2026",
          eventLocation: foundRecord.place || "Trung tâm Hội nghị Quốc gia, Hà Nội",
          ticketType: foundRecord.ticketType || "VIP Standard Pass",
          seatAssignment: foundRecord.seatAssignment || "Bàn VIP 02 - Ghế 04",
          luckyNumber: foundRecord.luckyNumber || "#1983",
          ticketCount: foundRecord.ticketCount || 1,
          isCheckedIn: isChecked,
          checkedInAt: checkedInMap[ticketCode]?.checkedInAt || null,
          scannedBy: checkedInMap[ticketCode]?.scannedBy || "Ban Truyền Thông CEO 1983",
        });
        return;
      }

      // CASE 5: If code does NOT exist in real DB registrations or member cards
      toast.error("Mã vé không tồn tại trong hệ thống đăng ký sự kiện!", {
        description: `Mã [${resolved.slice(0, 30)}] không có trong cơ sở dữ liệu đăng ký sự kiện. Vui lòng kiểm tra lại vé của đại biểu.`,
        duration: 6000,
      });
      setError(`Mã vé "${resolved.slice(0, 40)}" không tồn tại trong hệ thống đăng ký sự kiện!`);
    },
    [stopScan, member, serverEventsData, serverRegistrations, currentScanningEvent, activeEvent],
  );

  // Confirm Check-in action from Media Department member (sync to real DB)
  const handleConfirmTicketCheckIn = async (updatedTicket: ScannedTicketData) => {
    try {
      const checkedInMap = getCheckedInRegistry();
      checkedInMap[updatedTicket.ticketCode] = {
        checkedInAt: updatedTicket.checkedInAt || new Date().toLocaleString("vi-VN"),
        scannedBy: updatedTicket.scannedBy || "Ban Soát Vé CEO 1983",
      };
      localStorage.setItem("vba_checkedin_tickets", JSON.stringify(checkedInMap));
      setScannedTicket(updatedTicket);

      // 1. Call real backend scan-ticket API with confirm: true to record checkin for User A
      await fetchNestApi("/checkin/scan-ticket", {
        method: "POST",
        body: JSON.stringify({
          payload: lastScan.current?.payload || updatedTicket.ticketCode,
          currentEventId: currentScanningEvent?.id || activeEvent?.id,
          confirm: true,
        }),
      }).catch(() => null);

      // 2. Call fallback checkin endpoint
      await fetchNestApi("/checkin", {
        method: "POST",
        body: JSON.stringify({ attendeeId: updatedTicket.ticketCode }),
      }).catch(() => null);

      try {
        void reloadRegistrations();
      } catch {}

      // Add to local history list for display
      const newRec: MyCheckinRecord = {
        id: `local-checkin-${Date.now()}`,
        eventId: updatedTicket.ticketCode,
        eventTitle: `${updatedTicket.attendeeName} (${updatedTicket.ticketCode})`,
        status: "success",
        method: mode,
        at: new Date().toISOString(),
        luckyNumber: updatedTicket.luckyNumber,
      } as any;
      setHistory((prev) => [newRec, ...prev]);
    } catch {}
  };

  const startScan = useCallback(() => {
    if (!isMediaDepartment) return;
    setError(null);
    setResult(null);
    setScanning(true);
  }, [isMediaDepartment]);

  function toggleScan() {
    if (scanning) stopScan();
    else void startScan();
  }

  useEffect(() => {
    stopScan();
  }, [mode, stopScan]);

  useEffect(() => {
    return () => {
      stopScan();
    };
  }, [stopScan]);

  const hasRealTicket = Boolean(myRealRegistration || registeredEventPass);

  const [selectedEventId, setSelectedEventId] = useState<string>("");

  useEffect(() => {
    if (activeEvent?.id && !selectedEventId) {
      setSelectedEventId(activeEvent.id);
    }
  }, [activeEvent, selectedEventId]);

  const currentDisplayEvent = useMemo(() => {
    if (selectedEventId && serverEventsData) {
      const match = serverEventsData.find((e: any) => e.id === selectedEventId);
      if (match) return match;
    }
    return activeEvent || serverEventsData?.[0] || null;
  }, [selectedEventId, serverEventsData, activeEvent]);

  const ticketEventTitle =
    myRealRegistration?.eventTitle ||
    registeredEventPass?.name ||
    currentDisplayEvent?.name ||
    currentDisplayEvent?.title ||
    "Sự kiện Hiệp hội CEO 1983";
  const ticketEventDate = currentDisplayEvent?.date
    ? new Date(currentDisplayEvent.date).toLocaleDateString("vi-VN") + " • " + (currentDisplayEvent.time || "07:30")
    : (registeredEventPass?.time || "Theo lịch sự kiện");
  const ticketEventLocation =
    currentDisplayEvent?.location || registeredEventPass?.place || "Trung tâm Hội nghị Quốc gia, Hà Nội";
  const attendeeName =
    myRealRegistration?.memberName || member?.name || user?.fullName || (user as any)?.name || "Đại biểu Hội viên CLB CEO 1983";
  const attendeePosition =
    myRealRegistration?.position ||
    (member as any)?.jobTitle ||
    (member as any)?.executiveRole ||
    (member as any)?.title ||
    "Thành viên, UV BCH";
  const attendeeTicketType =
    myRealRegistration?.ticketType ||
    registeredEventPass?.ticketType ||
    "Vé Tiêu Chuẩn (1 vé)";
  const attendeeTime =
    currentDisplayEvent?.time
      ? `${currentDisplayEvent.time} | ${currentDisplayEvent.date ? new Date(currentDisplayEvent.date).toLocaleDateString("vi-VN") : "2026"}`
      : (registeredEventPass?.time || "08:00 | 2026");
  const attendeeMemberCode = myRealRegistration?.memberCode || member?.code || "M1983";
  const attendeeCompany =
    (member as any)?.companyName || (user as any)?.company || (member as any)?.company || "CLB Doanh nhân CEO 1983";
  const attendeeSeat =
    myRealRegistration?.seatAssignment || (member as any)?.seatAssignment || registeredEventPass?.seatAssignment || "Bàn VIP 02 - Ghế 04";
  const attendeeLuckyRaw =
    myRealRegistration?.luckyNumber || registeredEventPass?.luckyNumber || `#${(member?.code || "88").slice(-3)}`;
  const attendeeLucky = attendeeLuckyRaw.startsWith("#") ? attendeeLuckyRaw : `#${attendeeLuckyRaw}`;
  const myTicketCode =
    myRealRegistration?.ticketCode ||
    myRealRegistration?.id ||
    registeredEventPass?.ticketCode ||
    `TKT-${currentDisplayEvent?.id || "EVT"}-${attendeeMemberCode}`;
  const displayTicketCode =
    myRealRegistration?.ticketCode ||
    registeredEventPass?.ticketCode ||
    (myTicketCode.startsWith("REG-EV-")
      ? myTicketCode
      : `REG-EV-${(myRealRegistration?.id || attendeeMemberCode).replace(/[^a-zA-Z0-9]/g, "").slice(-5).toUpperCase()}`);
  const myQrPayload = `event_ticket:${currentDisplayEvent?.id || "EVT-1983"}:${attendeeMemberCode}:${encodeURIComponent(attendeeSeat)}:${encodeURIComponent(attendeeLucky)}`;
  const myQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(myQrPayload)}`;
  const isChecked = Boolean(myRealRegistration?.checkedInAt) || Boolean(getCheckedInRegistry()[myTicketCode]);

  const guestRegUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://crm.ceo1983.viconnect.vn";
    const eId = currentDisplayEvent?.id || activeEvent?.id || "EVT-1983";
    return `${origin}/events/${eId}/register?source=zalo_guest`;
  }, [currentDisplayEvent, activeEvent]);

  const guestQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(guestRegUrl)}`;

  const handleCopyLink = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      toast.success("Đã sao chép liên kết vào bộ nhớ tạm!");
    } else {
      toast.info("Vui lòng sao chép liên kết: " + text);
    }
  };

  const handleDownloadQr = async (qrImageUrl: string, filename: string) => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success("Đã tải mã QR về máy thành công!");
    } catch {
      window.open(qrImageUrl, "_blank");
    }
  };

  return (
    <div className="vba-animate min-h-screen pb-16 bg-slate-50 dark:bg-[#070d19]">
      <MemberHeader title="Soát Vé & Mã QR Sự Kiện" back />

      {/* Top 2 Primary Tabs: Quét vé & Check-in vs Mã QR Sự Kiện */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-white/10 shadow-inner">
          <button
            type="button"
            onClick={() => setMainTab("scan")}
            className={`py-3 px-2 text-xs sm:text-sm font-extrabold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              mainTab === "scan"
                ? "bg-[#003B95] text-white shadow-md border border-amber-400/50"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ScanLine className="h-4 w-4 shrink-0" />
            <span className="truncate">Quét Vé & Check-in</span>
          </button>
          <button
            type="button"
            onClick={() => {
              stopScan();
              setMainTab("event_qr");
            }}
            className={`py-3 px-2 text-xs sm:text-sm font-extrabold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              mainTab === "event_qr"
                ? "bg-[#003B95] text-white shadow-md border border-amber-400/50"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <QrCode className="h-4 w-4 shrink-0" />
            <span className="truncate">Mã QR Sự Kiện</span>
          </button>
        </div>
      </div>

      {mainTab === "scan" ? (
        isMediaDepartment ? (
          <div>
            {/* Media Department Active Badge */}
            <div id="tour-checkin-media-badge" className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-[#001D4A] via-[#003B95] to-[#002B70] p-3 text-white shadow-md border border-amber-400/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500 text-slate-950 shrink-0 font-black">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">
                    QUYỀN HẠN HỘI VIÊN CHÍNH THỨC
                  </span>
                  <h4 className="text-xs font-extrabold text-white truncate">
                    Ban Truyền Thông & Sự Kiện CEO 1983
                  </h4>
                </div>
              </div>

              {mediaOverride && (
                <button
                  type="button"
                  onClick={toggleMediaOverride}
                  title="Đang bật vai trò kiểm thử. Bấm để tắt."
                  className="shrink-0 px-2 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-[10px] font-bold text-amber-300 transition cursor-pointer"
                >
                  Tắt test
                </button>
              )}
            </div>

            {/* Quick helper tip */}
            <div className="mx-4 mt-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-2.5 text-[11px] text-sky-900 dark:text-sky-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>Quét mã Standee đặt tại cổng sự kiện hoặc quét mã vé của đại biểu để check-in.</span>
            </div>

            {/* Assigned Event Selector or Active Event Indicator */}
            {assignedEvents.length > 1 ? (
              <div className="px-4 pt-3">
                <div className="rounded-2xl border-2 border-[#003B95] bg-white dark:bg-slate-900 p-3 shadow-md">
                  <div className="flex items-center justify-between text-xs font-bold text-[#003B95] dark:text-blue-400 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>Sự kiện đang soát vé ({assignedEvents.length} sự kiện được phân công):</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 font-extrabold">
                      Chuyển sự kiện
                    </span>
                  </div>
                  <select
                    value={currentScanningEvent?.id || ""}
                    onChange={(e) => setSelectedScannerEventId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-[#003B95]"
                  >
                    {assignedEvents.map((ev: any) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} ({ev.date})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : currentScanningEvent ? (
              <div className="px-4 pt-3">
                <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 p-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="h-4 w-4 text-[#003B95] shrink-0" />
                    <span className="font-bold text-foreground truncate">
                      {currentScanningEvent.name}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#003B95] text-white font-bold shrink-0">
                    {currentScanningEvent.date}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Scanner viewport */}
            <div className="px-4 pt-4">
              <div className="vba-card relative grid aspect-square place-items-center overflow-hidden p-0 border border-slate-200 dark:border-white/10 shadow-xs rounded-3xl bg-slate-950">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(#003B95 1px,transparent 1px),linear-gradient(90deg,#003B95 1px,transparent 1px)",
                    backgroundSize: "26px 26px",
                  }}
                />
                <video
                  ref={videoRef}
                  autoPlay
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ opacity: scanning ? 1 : 0 }}
                  muted
                  playsInline
                />
                <div className="relative h-[64%] w-[64%] pointer-events-none">
                  <span className="absolute -left-1 -top-1 h-10 w-10 rounded-tl-2xl border-l-[4px] border-t-[4px] border-amber-400" />
                  <span className="absolute -right-1 -top-1 h-10 w-10 rounded-tr-2xl border-r-[4px] border-t-[4px] border-amber-400" />
                  <span className="absolute -bottom-1 -left-1 h-10 w-10 rounded-bl-2xl border-b-[4px] border-l-[4px] border-amber-400" />
                  <span className="absolute -bottom-1 -right-1 h-10 w-10 rounded-br-2xl border-b-[4px] border-r-[4px] border-amber-400" />
                  {scanning && (
                    <span className="absolute inset-x-2 top-2 h-1 animate-[mscan_1.4s_ease-in-out_infinite] rounded-full bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.9)]" />
                  )}
                  {!scanning && (
                    <ScanLine className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-amber-400/80" />
                  )}
                </div>
              </div>

              {error && (
                <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-600 dark:text-red-400 font-semibold">
                  {error}
                </p>
              )}

              {/* Scan Button */}
              <button
                type="button"
                onClick={toggleScan}
                disabled={submitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-black text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 border border-amber-500 active:scale-[0.99] transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-60"
              >
                <ScanLine className="h-4 w-4 text-white" />
                <span className="text-white">
                  {scanning ? t("m.checkin.stopScan") : "Bắt Đầu Quét Mã QR"}
                </span>
              </button>

              {/* Manual Lookup Accordion Toggle */}
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="text-xs font-bold text-[#003B95] dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>{showManualInput ? "Thu gọn nhập mã thủ công" : "Nhập mã vé hoặc mã đại biểu thủ công"}</span>
                </button>
              </div>

              {/* Manual input box */}
              {showManualInput && (
                <div className="mt-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Nhập mã vé (VD: REG-EV1-983, M1983-001)"
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-bold uppercase focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!manualCode.trim()) {
                          toast.error("Vui lòng nhập mã vé đại biểu!");
                          return;
                        }
                        void handlePayload(manualCode.trim());
                      }}
                      className="px-4 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs transition cursor-pointer shadow-xs"
                    >
                      Tra cứu
                    </button>
                  </div>
                  <p className="text-[10.5px] text-slate-400">
                    * Hỗ trợ tra cứu nhanh khi camera điện thoại không nhận diện được mã QR.
                  </p>
                </div>
              )}
            </div>

            {/* Result */}
            {result && (
              <div className="px-4 pt-4">
                <ResultCard rec={result} statusMap={statusMap} />
              </div>
            )}

            {/* Connection status */}
            <div className="px-4 pt-5">
              <div className="vba-card flex items-center gap-3 p-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                  style={{
                    background: online ? "rgba(63,191,127,0.14)" : "rgba(255,107,107,0.14)",
                  }}
                >
                  {online ? (
                    <Cloud className="h-4.5 w-4.5" style={{ color: "#3fbf7f" }} />
                  ) : (
                    <CloudOff className="h-4.5 w-4.5" style={{ color: "#ff6b6b" }} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-[var(--vba-text)]">
                    {online ? "Hệ thống Soát vé Trực tuyến (CRM Đồng bộ)" : t("m.checkin.offline")}
                  </div>
                  <div className="text-[11px] text-[var(--vba-text-muted)]">
                    {online ? "Sẵn sàng ghi nhận check-in đại biểu theo thời gian thực" : t("m.checkin.syncSubOffline")}
                  </div>
                </div>
              </div>
            </div>

            {/* History (server-authoritative) */}
            <div className="px-4 pb-4 pt-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-[var(--vba-gold)]" />
                  <h2 className="text-[14px] font-bold text-[var(--vba-text)]">
                    Lịch sử soát vé của Ban Truyền Thông
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  {history.length} lượt
                </span>
              </div>
              {history.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[var(--vba-border-soft)] py-8 text-center text-[12px] text-[var(--vba-text-muted)] bg-white/40 dark:bg-white/[0.02]">
                  Chưa có lượt quét vé nào. Bấm <b>"Bắt Đầu Quét Mã QR"</b> để điểm danh đại biểu.
                </p>
              ) : (
                <div className="space-y-2">
                  {history.map((r: any) => {
                    const s = statusMap[r.status as CheckinStatus] || statusMap.success;
                    return (
                      <div key={r.id} className="vba-card flex items-center gap-3 p-3">
                        <span
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                          style={{ background: s.bg }}
                        >
                          <s.Icon className="h-4.5 w-4.5" style={{ color: s.color }} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-semibold text-[var(--vba-text)]">
                            {r.eventTitle}
                          </div>
                          <div className="flex items-center justify-between gap-1.5 text-[11px] text-[var(--vba-text-muted)]">
                            <span>Quét mã QR · {fmtTime(r.at)}</span>
                            {r.luckyNumber && (
                              <span className="inline-flex items-center rounded-md bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                                🎟️ Số vé: {r.luckyNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Permission Gate if !isMediaDepartment */
          <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 text-center shadow-md">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-[#003B95]/10 dark:bg-blue-950/40 border border-[#003B95]/20 flex items-center justify-center text-[#003B95] dark:text-amber-400 mb-4 shadow-sm">
                <Lock className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-[11px] font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Khu Vực Phân Quyền Soát Vé</span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Chỉ Dành Cho Ban Truyền Thông & BTC
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                Tài khoản của bạn chưa được phân công quyền soát vé cho sự kiện này. Quyền quét vé qua camera chỉ cấp cho Ban Truyền Thông, Ban Tổ Chức hoặc Quản trị viên được tích quyền tại hệ thống CRM.
              </p>

              <div className="mt-6 flex flex-col gap-2.5 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => setMainTab("event_qr")}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#002B70] to-[#003B95] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-amber-300" />
                  <span>Chuyển Sang Mã QR Sự Kiện</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  to="/association/events"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition text-center"
                >
                  Xem danh sách sự kiện
                </Link>
              </div>
            </div>

            {/* Tester Override Switcher for Admins/Testers */}
            <div className="rounded-2xl border border-dashed border-amber-400/60 bg-amber-500/5 p-4 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <Settings2 className="h-4 w-4 text-amber-500" />
                <span>Chế độ kiểm thử dành cho Quản trị & Tester</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Bạn muốn trải nghiệm tính năng quét vé sự kiện của Ban Truyền Thông? Bấm nút dưới đây để kích hoạt vai trò kiểm thử.
              </p>
              <button
                type="button"
                onClick={toggleMediaOverride}
                className="mt-1 px-4 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
              >
                🧪 Kích hoạt vai trò Ban Truyền Thông (Kiểm thử)
              </button>
            </div>
          </div>
        )
      ) : (
        /* Event QR Hub (mainTab === "event_qr") */
        <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-6">
          {/* Event Selector for QR Hub (if more than 1 event) */}
          {serverEventsData && serverEventsData.length > 1 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                Chọn sự kiện xem mã QR:
              </label>
              <select
                value={currentDisplayEvent?.id || ""}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-[#003B95]"
              >
                {serverEventsData.map((ev: any) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.date})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SUB-CARD 1: Thẻ Vé & QR Điểm Danh Hội Viên */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-[#003B95] dark:text-amber-400" />
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  1. Thẻ Vé & QR Điểm Danh Hội Viên
                </h3>
              </div>
              <span className="text-[10.5px] font-bold text-slate-500">Cá nhân</span>
            </div>

            {hasRealTicket ? (
              <div id="tour-checkin-ticket" className="overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl">
                {/* Header Ticket Banner */}
                <div className="bg-gradient-to-br from-[#001D4A] via-[#003B95] to-[#002B70] p-4 text-white relative text-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/60 px-3 py-1 text-[11px] font-extrabold text-amber-300 uppercase tracking-wider mb-2">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    <span>VÉ THAM DỰ SỰ KIỆN CHÍNH THỨC</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white leading-snug uppercase">
                    {ticketEventTitle}
                  </h3>
                  <p className="text-xs text-white/80 mt-1 flex items-center justify-center gap-1">
                    <span>📍</span>
                    <span>{ticketEventLocation}</span>
                  </p>
                </div>

                {/* Ticket Body with QR Code */}
                <div className="p-4 sm:p-5 text-center space-y-3.5">
                  <div className="bg-white p-3.5 rounded-2xl border-2 border-dashed border-amber-400/60 inline-block shadow-sm">
                    <div className="relative mx-auto w-52 h-52 sm:w-56 sm:h-56 flex items-center justify-center">
                      <img
                        src={myQrImageUrl}
                        alt="QR Thẻ vé sự kiện"
                        className="w-full h-full object-contain"
                      />
                      {isChecked && (
                        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center text-emerald-400 p-3">
                          <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-bounce" />
                          <span className="mt-2 text-sm font-black text-white">ĐÃ CHECK-IN THÀNH CÔNG</span>
                          <span className="text-[11px] text-emerald-300 font-semibold">Chào mừng Quý Đại biểu!</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-mono font-black text-[#003B95] mt-2.5 tracking-wider">
                      MÃ VÉ: {displayTicketCode}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      {isChecked ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Đã điểm danh vào hội trường
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <Ticket className="h-3.5 w-3.5" />
                          Vé hợp lệ • Sẵn sàng check-in
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attendee Details Card */}
                  <div id="tour-checkin-seat" className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Đại biểu tham dự:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{attendeeName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Chức vụ:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{attendeePosition}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Doanh nghiệp:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{attendeeCompany}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Thời gian:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{attendeeTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Hạng vé:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{attendeeTicketType}</span>
                    </div>

                    {/* Randomly Assigned Seat Display */}
                    <div className="flex justify-between items-center bg-indigo-50/80 dark:bg-indigo-950/40 rounded-lg p-2.5 border border-indigo-200/60 dark:border-indigo-800/60">
                      <div className="text-left">
                        <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase block">
                          VỊ TRÍ CHỖ NGỒI (HỆ THỐNG XẾP TỰ ĐỘNG):
                        </span>
                        <span className="font-bold text-xs text-indigo-950 dark:text-indigo-100 mt-0.5 block">
                          {attendeeSeat}
                        </span>
                      </div>
                      <span className="text-[9.5px] text-indigo-500/80 dark:text-indigo-400 text-right italic max-w-[120px] leading-tight">
                        Chỉ BTT, BQT và Admin mới có quyền đổi chỗ
                      </span>
                    </div>

                    {/* Lucky Draw Box */}
                    <div className="flex justify-between items-center bg-amber-50/80 dark:bg-amber-950/40 rounded-lg p-2 border border-amber-300/60 dark:border-amber-700/60">
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        Số may mắn (Quay thưởng):
                      </span>
                      <span className="font-mono font-black text-sm text-amber-700 dark:text-amber-300 bg-white dark:bg-slate-800 px-3 py-0.5 rounded-md border border-amber-400/50 shadow-xs">
                        {attendeeLucky}
                      </span>
                    </div>
                  </div>

                  {/* Informational notice */}
                  <div className="rounded-lg bg-blue-50/90 dark:bg-blue-950/60 p-3 text-[11px] leading-relaxed text-blue-900 dark:text-blue-300 text-left border border-blue-200/60 dark:border-blue-900/40">
                    ℹ️ <b>Lưu ý chỗ ngồi & check-in:</b> Chỗ ngồi được hệ thống phân bổ theo sơ đồ hội trường.
                    Khi đến sự kiện, Quý Đại biểu vui lòng xuất trình mã QR này để Ban Truyền Thông quét xác nhận và
                    hướng dẫn vào đúng vị trí bàn ghế.
                  </div>

                  {/* Action Buttons for Ticket Pass */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDownloadQr(myQrImageUrl, `The-Ve-${displayTicketCode}.png`)}
                      className="py-2.5 px-3 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <Download className="h-4 w-4 text-amber-300" />
                      <span>Tải Thẻ Vé QR</span>
                    </button>

                    <Link
                      to="/association/events"
                      className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 text-center"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Lịch Trình</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-xs">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-[#003B95]/10 dark:bg-blue-950/40 border border-[#003B95]/20 flex items-center justify-center text-[#003B95] dark:text-blue-400 mb-3">
                  <Ticket className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Bạn chưa có vé tham dự sự kiện này
                </h4>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Đăng ký vé sự kiện để nhận ngay số bàn ghế tự động và mã QR điểm danh vào hội trường.
                </p>
                <div className="mt-4">
                  <Link
                    to="/association/events"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#002B70] to-[#003B95] text-white font-bold text-xs shadow-md transition active:scale-95 inline-flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Đăng Ký Tham Dự Sự Kiện</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* SUB-CARD 2: Mã QR Đăng Ký Khách Mời (Zalo / Web) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  2. Mã QR Đăng Ký Khách Mời (Zalo / Web)
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Công khai
              </span>
            </div>

            <div className="overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl">
              {/* Banner */}
              <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-[#002B70] p-4 text-white text-center relative">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/40 px-3 py-1 text-[11px] font-extrabold text-white uppercase tracking-wider mb-2">
                  <Share2 className="h-3 w-3 text-amber-300" />
                  <span>MÃ QR DÀNH CHO KHÁCH MỜI & ĐẠI BIỂU</span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                  {currentDisplayEvent?.name || "Sự kiện CLB Doanh Nhân CEO 1983"}
                </h4>
                <p className="text-[11.5px] text-white/80 mt-1">
                  Quét mã bằng Zalo hoặc Camera điện thoại để mở form đăng ký vé
                </p>
              </div>

              {/* QR Code Body */}
              <div className="p-4 sm:p-5 text-center space-y-3.5">
                <div className="bg-white p-3.5 rounded-2xl border-2 border-dashed border-emerald-400/60 inline-block shadow-sm">
                  <div className="relative mx-auto w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
                    <img
                      src={guestQrImageUrl}
                      alt="QR Đăng ký khách mời"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-1 right-1 rounded-md bg-blue-600 text-white px-1.5 py-0.5 text-[9px] font-black shadow-xs">
                      ZALO / WEB
                    </div>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-400 mt-2 tracking-wide">
                    MÃ ĐĂNG KÝ: {currentDisplayEvent?.id || "EVT-1983"}
                  </div>
                </div>

                {/* Copyable Link Box */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200 dark:border-slate-700 text-left space-y-2">
                  <span className="block text-[10.5px] font-bold text-slate-500 dark:text-slate-400">
                    Đường dẫn đăng ký công khai:
                  </span>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-200 dark:border-slate-800">
                    <input
                      type="text"
                      readOnly
                      value={guestRegUrl}
                      className="flex-1 min-w-0 bg-transparent text-xs font-mono text-slate-700 dark:text-slate-300 outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyLink(guestRegUrl)}
                      className="shrink-0 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Sao chép</span>
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 p-3 text-[11px] leading-relaxed text-emerald-900 dark:text-emerald-300 text-left border border-emerald-200/60 dark:border-emerald-900/40">
                  💡 <b>Hướng dẫn sử dụng:</b> Bạn có thể tải mã QR này để in Standee, in Backdrop hoặc gửi hình ảnh qua Zalo cho đối tác. Khách mời quét mã bằng Zalo sẽ mở trực tiếp form đăng ký đại biểu mà không cần tài khoản hội viên.
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDownloadQr(guestQrImageUrl, `QR-Khach-Moi-${currentDisplayEvent?.id || "EVT"}.png`)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Tải Mã QR Ảnh</span>
                  </button>

                  <a
                    href={guestRegUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Mở Form ĐK</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 1. SCANNED TICKET DETAIL MODAL (Core requirement for Media Team) */}
      {/* ----------------------------------------------------------------- */}
      <ScannedTicketDetailModal
        open={!!scannedTicket}
        ticket={scannedTicket}
        onClose={() => {
          setScannedTicket(null);
          // Resume scanner for next attendee
          if (mode === "qr") {
            setScanning(true);
          }
        }}
        onConfirmCheckIn={handleConfirmTicketCheckIn}
      />

      {/* 2. Scanned Member Profile Modal (Fallback for Card Scan) */}
      {scannedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setScannedMember(null)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-3xl bg-white dark:bg-[#0f172a] shadow-2xl text-slate-900 dark:text-white animate-scale-in border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cover photo banner */}
            <div className="relative h-28 w-full overflow-hidden bg-slate-900">
              <img
                src={
                  scannedMember.coverUrl
                    ? resolveMediaUrl(scannedMember.coverUrl) || scannedMember.coverUrl
                    : heroImg
                }
                alt="Cover"
                className="h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <button
                onClick={() => setScannedMember(null)}
                className="absolute top-3 right-3 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/75 transition"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-4 text-[10.5px] font-bold text-white/90 drop-shadow-sm flex items-center gap-1">
                <span>CLB DOANH NHÂN CEO 1983</span>
              </div>
            </div>

            {/* Body content */}
            <div className="p-5 pt-0 text-center space-y-3">
              {/* Overlapping Avatar with Verified Badge */}
              <div className="relative -mt-10 mx-auto w-20 h-20">
                {scannedMember.avatar && resolveMediaUrl(scannedMember.avatar) ? (
                  <img
                    src={resolveMediaUrl(scannedMember.avatar)!}
                    alt={scannedMember.personName}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                    className="w-full h-full rounded-2xl object-cover ring-3 ring-white dark:ring-[#0f172a] shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-[#003B95] dark:text-amber-400 font-bold text-xl ring-3 ring-white dark:ring-[#0f172a] shadow-lg">
                    <User className="h-10 w-10" />
                  </div>
                )}
                <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 text-amber-500 fill-white dark:fill-slate-900" />
              </div>

              {/* Name & Association Role */}
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {scannedMember.personName || "Hội viên CLB CEO 1983"}
                </h3>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-600 dark:text-amber-400">
                    {scannedMember.personTitle || "Ban Thường Trực • Hội viên CEO 1983"}
                  </span>
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    {scannedMember.code}
                  </span>
                </div>
              </div>

              {/* Enterprise / Company name */}
              {scannedMember.name && (
                <div className="rounded-xl bg-slate-50 dark:bg-white/[0.04] p-2.5 border border-slate-100 dark:border-white/5 text-[12px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5">
                  <Building2 className="h-4 w-4 text-[#003B95] dark:text-amber-400 shrink-0" />
                  <span className="truncate">{scannedMember.name}</span>
                </div>
              )}

              {/* Action Buttons: Message & Connect */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const pName = scannedMember.personName || scannedMember.name;
                    const cCode = scannedMember.code;
                    setScannedMember(null);
                    navigate({
                      to: "/association/messages" as any,
                      search: { peerCode: cCode, peerName: pName } as any,
                    });
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 py-2.5 text-[12px] font-bold text-[#003B95] dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  Nhắn tin
                </button>

                <button
                  type="button"
                  disabled={connecting}
                  onClick={async () => {
                    setConnecting(true);
                    try {
                      await fetchNestApi("/network/requests", {
                        method: "POST",
                        body: JSON.stringify({
                          targetUserId: scannedMember.userId || scannedMember.code,
                          memberCode: scannedMember.code,
                          message: `Xin chào! Tôi đã quét mã QR của bạn và rất mong được kết nối!`,
                        }),
                      });
                      toast.success("Đã gửi lời mời kết nối thành công!");
                      setScannedMember(null);
                    } catch {
                      toast.error("Không thể gửi lời mời kết nối");
                    } finally {
                      setConnecting(false);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#003B95] hover:bg-[#002B70] border border-amber-400/40 py-2.5 text-[12px] font-bold text-white transition active:scale-95 cursor-pointer shadow-md shadow-[#003B95]/20 disabled:opacity-60"
                >
                  <UserPlus className="h-4 w-4 text-amber-300" />
                  <span>{connecting ? "Đang gửi..." : "Kết nối ngay"}</span>
                </button>
              </div>

              <div className="pt-1">
                <Link
                  to="/card/$code"
                  params={{ code: scannedMember.code }}
                  className="text-[11.5px] font-semibold text-slate-500 hover:text-[#003B95] dark:text-slate-400 dark:hover:text-amber-400 underline"
                >
                  Xem chi tiết thẻ VIP doanh nhân
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({
  rec,
  statusMap,
}: {
  rec: MyCheckinRecord;
  statusMap: Record<
    CheckinStatus,
    { label: string; sub: string; Icon: typeof CheckCircle2; color: string; bg: string }
  >;
}) {
  const s = statusMap[rec.status];
  return (
    <div className="vba-card p-4">
      <div className="flex items-center gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
          style={{ background: s.bg }}
        >
          <s.Icon className="h-6 w-6" style={{ color: s.color }} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-bold" style={{ color: s.color }}>
            {s.label}
          </div>
          <div className="truncate text-[12px] text-[var(--vba-text-muted)]">{s.sub}</div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 text-[12px] text-[var(--vba-text-muted)]">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-[var(--vba-gold)]" />
          <span className="truncate text-[var(--vba-text)]">{rec.eventTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-[var(--vba-gold)]" />
          <span>{fmtTime(rec.at)}</span>
        </div>
      </div>
    </div>
  );
}
