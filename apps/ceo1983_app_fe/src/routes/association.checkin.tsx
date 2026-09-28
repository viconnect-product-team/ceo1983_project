import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  QrCode,
  Wifi,
  ScanLine,
  CheckCircle2,
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
import { extractNdefPayload, type NdefReadingEventLike } from "@/hooks/use-nfc-scanner";
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

  // Mode and camera
  const [checkinMethod, setCheckinMethod] = useState<"scan" | "ticket">("scan");
  const [mode, setMode] = useState<"qr" | "nfc">("qr");
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

  // Find current user's registration from real DB
  const myRealRegistration = useMemo(() => {
    if (!serverRegistrations || serverRegistrations.length === 0) return null;
    return (
      serverRegistrations.find(
        (r: any) =>
          (member?.code && r.memberCode === member.code) ||
          (user?.email && r.email === user.email) ||
          (user?.id && (r.userId === user.id || r.id === user.id))
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
  // Registered event ticket pass for member
  const registeredEventPass = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const records = JSON.parse(localStorage.getItem("vba_registered_event_records") || "[]");
      if (Array.isArray(records) && records.length > 0) {
        return records[0];
      }
    } catch {}
    return null;
  }, []);

  // Media Department override (for testing)
  const [mediaOverride, setMediaOverride] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("vba_is_media_department_member") === "true";
  });

  // Check if current user belongs to Media Department (Ban Truyền Thông)
  const isMediaDepartment = useMemo(() => {
    if (mediaOverride) return true;
    if (
      user?.role === "admin" ||
      user?.role === "superadmin" ||
      user?.role === "platform_admin" ||
      user?.role === "truong_ban_truyen_thong"
    ) {
      return true;
    }

    let customProfile: any = null;
    try {
      if (typeof window !== "undefined") {
        customProfile = JSON.parse(
          localStorage.getItem(`vba_custom_profile_${user?.id}`) ||
            localStorage.getItem("vba_custom_profile") ||
            "{}"
        );
      }
    } catch {}

    const textToMatch = [
      user?.role,
      user?.department,
      user?.boardName,
      user?.title,
      member?.role,
      member?.department,
      member?.title,
      customProfile?.department,
      customProfile?.boardName,
      customProfile?.role,
      customProfile?.title,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      textToMatch.includes("truyền thông") ||
      textToMatch.includes("media") ||
      textToMatch.includes("truong_ban_truyen_thong")
    );
  }, [user, member, mediaOverride]);

  const toggleMediaOverride = () => {
    const next = !mediaOverride;
    setMediaOverride(next);
    try {
      if (typeof window !== "undefined") {
        if (next) {
          localStorage.setItem("vba_is_media_department_member", "true");
          toast.success("Đã kích hoạt vai trò Ban Truyền Thông để kiểm thử!");
        } else {
          localStorage.removeItem("vba_is_media_department_member");
          toast.info("Đã tắt vai trò Ban Truyền Thông kiểm thử.");
        }
      }
    } catch {}
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

      // CASE 0: Event Standee QR Code scanned by attendee (event_checkin:EVENT_ID or event_checkin:EVENT_ID:NAME)
      if (resolved.startsWith("event_checkin:") || resolved.startsWith("EVENT_CHECKIN:")) {
        const parts = resolved.split(":");
        const eventId = parts[1] || "current-event";
        const matchedEvent = currentEvents.find((e: any) => e.id === eventId);
        const eventTitle = parts[2]
          ? decodeURIComponent(parts[2])
          : (matchedEvent?.name || matchedEvent?.title || "Đại hội Hội viên CLB CEO 1983 & Tuyên dương Doanh nghiệp 2026");
        const memberCode = member?.code || (user as any)?.code || "M1983-001";
        const myName = member?.name || (user as any)?.name || (user as any)?.fullName || "Đại biểu Hội viên CEO 1983";
        const myPhone = member?.phone || (user as any)?.phone || "—";
        const myCompany = (member as any)?.companyName || (user as any)?.company || "Doanh nghiệp Thành viên CEO 1983";
        const ticketCode = `SELF-${eventId}-${memberCode}`;
        const mySeat = (member as any)?.seatAssignment || "Bàn VIP 02 - Ghế 05 (Khu vực Đại biểu Danh dự)";
        const myLucky = `#${Math.floor(1000 + Math.random() * 8999)}`;

        const checkinRecord = {
          checkedInAt: new Date().toLocaleString("vi-VN"),
          scannedBy: "Tự quét mã QR Standee sự kiện",
          seatAssignment: mySeat,
          luckyNumber: myLucky,
          eventId,
          eventTitle,
        };
        checkedInMap[ticketCode] = checkinRecord;
        localStorage.setItem("vba_checkedin_tickets", JSON.stringify(checkedInMap));

        toast.success("Check-in sự kiện thành công!", {
          description: `Vị trí: ${mySeat} • Mã bốc thăm: ${myLucky}`,
          duration: 6000,
        });

        setScannedTicket({
          ticketCode,
          attendeeName: myName,
          attendeePhone: myPhone,
          attendeeCompany: myCompany,
          attendeePosition: member?.title || "Hội viên chính thức",
          eventTitle,
          eventDate: matchedEvent?.date ? new Date(matchedEvent.date).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN"),
          eventLocation: matchedEvent?.location || "Trung tâm Hội nghị Quốc gia, Hà Nội",
          ticketType: "Vé Tham Dự Hội Viên",
          seatAssignment: mySeat,
          luckyNumber: myLucky,
          ticketCount: 1,
          isCheckedIn: true,
          checkedInAt: checkinRecord.checkedInAt,
          scannedBy: checkinRecord.scannedBy,
        });
        return;
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
    [stopScan, member, serverEventsData, serverRegistrations],
  );

  // Confirm Check-in action from Media Department member (sync to real DB)
  const handleConfirmTicketCheckIn = async (updatedTicket: ScannedTicketData) => {
    try {
      const checkedInMap = getCheckedInRegistry();
      checkedInMap[updatedTicket.ticketCode] = {
        checkedInAt: updatedTicket.checkedInAt || new Date().toLocaleString("vi-VN"),
        scannedBy: updatedTicket.scannedBy || "Ban Truyền Thông CEO 1983",
      };
      localStorage.setItem("vba_checkedin_tickets", JSON.stringify(checkedInMap));
      setScannedTicket(updatedTicket);

      // Call real backend API to mark checked in
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

  const startScan = useCallback(async () => {
    if (!isMediaDepartment) return;
    setError(null);
    setResult(null);
    if (mode === "qr") {
      setScanning(true);
    } else {
      if (typeof window === "undefined") {
        setError(t("m.checkin.nfcNotSupported"));
        return;
      }

      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor);
      if (!window.isSecureContext && !isLocal) {
        setError("Chạm NFC yêu cầu kết nối bảo mật HTTPS hoặc ứng dụng di động CEO 1983.");
        return;
      }

      const NDEFReader = (window as unknown as { NDEFReader?: new () => any }).NDEFReader;
      if (!NDEFReader || typeof NDEFReader !== "function") {
        setError("Thiết bị hoặc trình duyệt chưa hỗ trợ Web NFC. Vui lòng mở bằng Google Chrome trên Android hoặc chuyển sang quét QR.");
        return;
      }

      try {
        const reader = new NDEFReader();
        const abort = new AbortController();
        nfcAbort.current = abort;
        await reader.scan({ signal: abort.signal });
        reader.onreading = (ev: NdefReadingEventLike) => {
          const payload = extractNdefPayload(ev);
          if (payload) {
            void handlePayload(payload);
          }
        };
        reader.onreadingerror = () => {
          /* tag moved or partial read */
        };
        setScanning(true);
      } catch (e: any) {
        if (e?.name === "NotAllowedError" || e?.message?.includes("not allowed") || e?.message?.includes("permission")) {
          setError("Quyền NFC bị từ chối. Hãy cho phép quyền NFC trong cài đặt trình duyệt Chrome.");
        } else {
          setError("Không thể bật NFC. Hãy kiểm tra xem NFC đã được bật trong Cài đặt của máy và mở khóa màn hình.");
        }
        setScanning(false);
      }
    }
  }, [mode, handlePayload, t, isMediaDepartment]);

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

  // -------------------------------------------------------------
  // PERMISSION GATE: If user does NOT belong to Media Department
  // -------------------------------------------------------------
  if (!isMediaDepartment) {
    const ticketEventTitle =
      myRealRegistration?.eventTitle ||
      registeredEventPass?.name ||
      activeEvent?.name ||
      activeEvent?.title ||
      "Đại hội Hội viên CLB Doanh Nhân CEO 1983 & Tuyên dương Doanh Nghiệp 2026";
    const ticketEventDate = activeEvent?.date
      ? new Date(activeEvent.date).toLocaleDateString("vi-VN") + " • " + (activeEvent.time || "07:30")
      : (registeredEventPass?.time || "27/09/2026 • 07:30");
    const ticketEventLocation =
      activeEvent?.location || registeredEventPass?.place || "Trung tâm Hội nghị Quốc gia, Hà Nội";
    const attendeeName =
      myRealRegistration?.memberName || member?.name || user?.fullName || (user as any)?.name || "Đại biểu Hội viên CLB CEO 1983";
    const attendeeMemberCode = myRealRegistration?.memberCode || member?.code || "M1983-001";
    const attendeeCompany =
      (member as any)?.companyName || (user as any)?.company || (member as any)?.company || "CLB Doanh nhân CEO 1983";
    const attendeeSeat =
      myRealRegistration?.seatAssignment || (member as any)?.seatAssignment || registeredEventPass?.seatAssignment || "Bàn VIP 02 - Ghế 04";
    const attendeeLucky =
      myRealRegistration?.luckyNumber || registeredEventPass?.luckyNumber || `#1983-${(member?.code || "88").slice(-3)}`;
    const myTicketCode =
      myRealRegistration?.id || registeredEventPass?.ticketCode || `TKT-${activeEvent?.id || "EVT"}-${attendeeMemberCode}`;
    const myQrPayload = `event_ticket:${activeEvent?.id || "EVT-1983"}:${attendeeMemberCode}:${encodeURIComponent(attendeeSeat)}:${encodeURIComponent(attendeeLucky)}`;
    const isChecked = Boolean(myRealRegistration?.checkedInAt) || Boolean(getCheckedInRegistry()[myTicketCode]);

    return (
      <div className="vba-animate min-h-screen pb-16 bg-slate-50 dark:bg-[#070d19]">
        <MemberHeader title="Thẻ Vé Sự Kiện Điện Tử" back />

        <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
          {/* Official Event Ticket Pass Card */}
          <div id="tour-checkin-ticket" className="overflow-hidden rounded-3xl border-2 border-[#003B95] bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl">
            {/* Header ribbon */}
            <div className="bg-gradient-to-r from-[#001D4A] via-[#003B95] to-[#2E3192] px-4 py-3 text-center text-xs font-black text-amber-300 tracking-wider uppercase flex items-center justify-center gap-2 border-b border-amber-400/40">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>THẺ VÉ ĐIỆN TỬ • ĐẠI BIỂU HỘI VIÊN CHÍNH THỨC</span>
            </div>

            <div className="p-6 text-center space-y-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-3 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  <BadgeCheck className="h-3.5 w-3.5 text-amber-500" />
                  VIP EVENT PASS 2026
                </span>
                <h3 className="mt-2 text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {ticketEventTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{ticketEventDate}</span>
                  <span>•</span>
                  <span>{ticketEventLocation}</span>
                </p>
              </div>

              {/* QR Code Container */}
              <div className="relative mx-auto w-60 h-60 rounded-3xl bg-white p-3 shadow-lg border-2 border-amber-400/80 flex flex-col items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(myQrPayload)}`}
                  alt="QR Thẻ vé sự kiện"
                  className="w-full h-full object-contain"
                />
                {isChecked && (
                  <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center text-emerald-400 p-3">
                    <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-bounce" />
                    <span className="mt-2 text-sm font-black text-white">ĐÃ CHECK-IN THÀNH CÔNG</span>
                    <span className="text-[11px] text-emerald-300 font-semibold">Chào mừng Quý Đại biểu!</span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border">
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

              {/* Attendee Details Card */}
              <div id="tour-checkin-seat" className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 text-left space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Đại biểu:</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{attendeeName}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Mã hội viên:</span>
                  <span className="text-xs font-mono font-bold text-[#003B95] dark:text-amber-400">{attendeeMemberCode}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Đơn vị / Doanh nghiệp:</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{attendeeCompany}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Vị trí chỗ ngồi:</span>
                  <span className="text-xs font-extrabold text-[#003B95] dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300/60">
                    {attendeeSeat}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Số may mắn bốc thăm:</span>
                  <span className="text-xs font-extrabold text-[#003B95] dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300/60">
                    {attendeeLucky}
                  </span>
                </div>
              </div>

              {/* Instructions banner */}
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-800/80 text-left space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-black text-amber-900 dark:text-amber-300">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Hướng dẫn điểm danh tại sự kiện:</span>
                </div>
                <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                  Quý Đại biểu vui lòng giữ màn hình sáng và <b>xuất trình mã QR trên thẻ này cho Ban Truyền Thông / Ban Tổ Chức</b> tại quầy đón tiếp để quét xác nhận check-in vào hội trường và nhận bộ tài liệu sự kiện.
                </p>
              </div>

              {/* Security & Permissions notice */}
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-3.5 text-left text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 text-[#003B95] dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#003B95] dark:text-blue-300">
                    Quy định phân quyền sự kiện
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-blue-800 dark:text-blue-300/90">
                    Tài khoản của bạn là Đại biểu / Hội viên tham dự. Theo quy chế bảo mật, bạn không có quyền mở máy quét camera để quét mã người khác. Quyền soát vé chỉ được cấp cho Ban Truyền Thông & Ban Tổ Chức.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2.5">
                <Link
                  to="/association/events"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer text-center"
                >
                  Xem Lịch Trình Sự Kiện & Hội Thảo
                </Link>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/association" })}
                  className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium text-xs transition cursor-pointer"
                >
                  Quay Về Trang Chủ
                </button>
              </div>
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
      </div>
    );
  }

  // -------------------------------------------------------------
  // MEDIA DEPARTMENT SCANNER INTERFACE
  // -------------------------------------------------------------
  return (
    <div className="vba-animate min-h-screen pb-16 bg-slate-50 dark:bg-[#070d19]">
      <MemberHeader title="Soát Vé Sự Kiện (Ban Truyền Thông)" back />

      {/* Media Department Active Badge */}
      <div id="tour-checkin-media-badge" className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-[#001D4A] via-[#003B95] to-[#2E3192] p-3 text-white shadow-md border border-amber-400/40 flex items-center justify-between gap-2">
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

      {/* 2 hình thức Check-in: 1 là quét Standee/Vé, 2 là xuất trình QR vé của tôi */}
      <div className="px-4 pt-3">
        <div id="tour-checkin-mode-toggle" className="flex rounded-2xl bg-slate-100 dark:bg-slate-900/60 p-1 border border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setCheckinMethod("scan")}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              checkinMethod === "scan"
                ? "bg-[#2E3192] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground"
            }`}
          >
            <ScanLine className="h-4 w-4" />
            <span>Hình thức 1: Quét mã QR</span>
          </button>
          <button
            type="button"
            onClick={() => {
              stopScan();
              setCheckinMethod("ticket");
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              checkinMethod === "ticket"
                ? "bg-[#2E3192] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-foreground"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Hình thức 2: Xuất trình mã QR</span>
          </button>
        </div>
      </div>

      {checkinMethod === "ticket" ? (
        <div className="px-4 pt-3">
          <div className="overflow-hidden rounded-3xl border-2 border-[#003B95] bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl">
            {/* Header ribbon */}
            <div className="bg-[#003B95] px-4 py-2.5 text-center text-xs font-extrabold text-white tracking-wider uppercase">
              Vé Điện Tử & Thẻ Check-in Sự Kiện
            </div>
            <div className="p-6 text-center space-y-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 py-1 text-[11px] font-bold text-[#003B95] dark:text-blue-300">
                  <Sparkles className="h-3 w-3" /> VIP EVENT PASS 2026
                </span>
                <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {registeredEventPass?.eventTitle || "Đại hội Hội viên CLB Doanh Nhân CEO 1983 & Tuyên dương Doanh Nghiệp"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {registeredEventPass?.time || "27/09/2026 • 07:30"} • {registeredEventPass?.location || "Trung tâm Hội nghị Quốc gia, Hà Nội"}
                </p>
              </div>

              {/* QR code container */}
              <div className="mx-auto w-56 h-56 rounded-2xl bg-white p-3 shadow-md border-2 border-[#003B95] flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`event_ticket:${registeredEventPass?.eventId || registeredEventPass?.id || "EVT-1983-CONGRESS"}:${member?.code || "M1983-001"}:${encodeURIComponent((member as any)?.seatAssignment || "Bàn VIP 02 - Ghế 04")}:${encodeURIComponent(registeredEventPass?.luckyNumber || "#1983-88")}`)}`}
                  alt="QR Vé sự kiện"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[11px] text-[#003B95] dark:text-blue-400 font-medium">
                Xuất trình mã QR sự kiện này cho Ban Lễ tân hoặc Cán bộ soát vé tại cửa để quét check-in vào hội trường
              </p>

              {/* Attendee Details Card */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 text-left space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Đại biểu:</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{member?.name || (user as any)?.name || "Hội viên CLB CEO 1983"}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Mã hội viên:</span>
                  <span className="text-xs font-mono font-bold text-[#003B95] dark:text-blue-400">{member?.code || "M1983-001"}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Chức vụ / Đơn vị:</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{(member as any)?.companyName || member?.title || "CLB Doanh nhân CEO 1983"}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Vị trí chỗ ngồi:</span>
                  <span className="text-xs font-extrabold text-[#003B95] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {(member as any)?.seatAssignment || "Bàn VIP 02 - Ghế 04"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Mã may mắn bốc thăm:</span>
                  <span className="text-xs font-extrabold text-[#003B95] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {registeredEventPass?.luckyNumber || `#1983-${(member?.code || "88").slice(-3)}`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCheckinMethod("scan")}
                className="w-full py-3 rounded-xl bg-[#003B95] text-white font-bold text-xs hover:bg-[#002b6e] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <ScanLine className="h-4 w-4" />
                <span>Chuyển sang Quét mã Standee sự kiện</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Quick helper tip */}
          <div className="mx-4 mt-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-2.5 text-[11px] text-sky-900 dark:text-sky-200 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Quét mã Standee đặt tại cổng sự kiện hoặc quét mã vé của đại biểu để check-in.</span>
          </div>

          {/* Mode toggle */}
          <div className="px-4 pt-3">
            <div className="relative grid grid-cols-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/60 p-1">
              <span
                className="absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-xl transition-transform duration-300 bg-[#2E3192] shadow-sm"
                style={{
                  transform: mode === "qr" ? "translateX(0)" : "translateX(calc(100% + 0.5rem))",
                }}
              />
              <button
                onClick={() => setMode("qr")}
                className="relative z-10 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition cursor-pointer"
                style={{ color: mode === "qr" ? "#FFFFFF" : "#64748B" }}
              >
                <QrCode className="h-4 w-4" style={{ color: mode === "qr" ? "#FFFFFF" : "#64748B" }} />
                <span>{t("m.checkin.modeQr")}</span>
              </button>
              <button
                onClick={() => setMode("nfc")}
                className="relative z-10 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition cursor-pointer"
                style={{ color: mode === "nfc" ? "#FFFFFF" : "#64748B" }}
              >
                <Wifi className="h-4 w-4" style={{ color: mode === "nfc" ? "#FFFFFF" : "#64748B" }} />
                <span>{t("m.checkin.modeNfc")}</span>
              </button>
            </div>
          </div>

          {/* Scanner viewport */}
          <div className="px-4 pt-4">
            <div className="vba-card relative grid aspect-square place-items-center overflow-hidden p-0 border border-slate-200 dark:border-white/10 shadow-xs rounded-3xl bg-slate-950">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(#2E3192 1px,transparent 1px),linear-gradient(90deg,#2E3192 1px,transparent 1px)",
                  backgroundSize: "26px 26px",
                }}
              />
              {mode === "qr" ? (
                <>
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
                </>
              ) : (
                <div className="relative grid place-items-center">
                  {scanning &&
                    [0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="absolute h-28 w-28 animate-ping rounded-full border-2 border-amber-400 opacity-40"
                        style={{ animationDelay: `${i * 0.4}s`, animationDuration: "1.8s" }}
                      />
                    ))}
                  <span className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-[#003B95] to-[#2E3192] text-white shadow-lg border-2 border-amber-400/60">
                    <Wifi className="h-10 w-10 -rotate-90 text-amber-300" />
                  </span>
                  {scanning && (
                    <p className="mt-3 text-center text-[12px] font-bold text-amber-300">
                      Áp thẻ VIP đại biểu vào vị trí giữa lưng điện thoại
                    </p>
                  )}
                </div>
              )}
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
              style={{ backgroundColor: "#2E3192", color: "#FFFFFF" }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-bold text-white bg-[#2E3192] hover:bg-[#19194D] active:scale-[0.99] transition-all shadow-md shadow-[#2E3192]/25 cursor-pointer disabled:opacity-60"
            >
              <ScanLine className="h-4 w-4 text-white" />
              <span className="text-white">
                {scanning
                  ? t("m.checkin.stopScan")
                  : mode === "qr"
                    ? "Bắt Đầu Quét Mã QR"
                    : "Bắt Đầu Chạm Thẻ NFC"}
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
        </>
      )}

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
            Chưa có lượt quét vé nào. Bấm <b>"Bắt Đầu Quét Mã QR Vé"</b> để điểm danh đại biểu.
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
                      <span>{r.method === "qr" ? "QR Code" : "NFC"} · {fmtTime(r.at)}</span>
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
                  style={{ backgroundColor: "#2E3192", color: "#ffffff" }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#2E3192] hover:bg-[#19194D] py-2.5 text-[12px] font-bold text-white transition active:scale-95 cursor-pointer shadow-md shadow-[#2E3192]/20 disabled:opacity-60"
                >
                  <UserPlus className="h-4 w-4" />
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
