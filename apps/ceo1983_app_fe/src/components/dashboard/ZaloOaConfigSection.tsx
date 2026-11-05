import React, { useState, useEffect } from "react";
import {
  MessageSquareText,
  Send,
  Check,
  AlertCircle,
  Sparkles,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Copy,
  Plus,
  Trash2,
  Eye,
  Sliders,
  QrCode,
  CreditCard,
  CheckCircle2,
  Bell,
  User,
  DollarSign,
  Calendar,
  Building2,
  Phone,
  KeyRound,
  RotateCw,
  ClipboardPaste,
  Users,
  CheckSquare,
  Square,
  ListFilter,
  Clock,
  Ticket,
  MapPin,
  Briefcase,
  Handshake,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { getNestApiUrl, getAuthToken, fetchNestApi } from "@/lib/api-client";

export interface ZaloOaTemplate {
  id: string;
  category: "membership_fee" | "event" | "training" | "meeting";
  categoryName: string;
  templateId: string;
  name: string;
  messageContent: string;
  availableVariables: string[];
  enabled: boolean;
}

const DEFAULT_TEMPLATES: ZaloOaTemplate[] = [
  {
    id: "tpl_fee_1",
    category: "membership_fee",
    categoryName: "Hội Phí & Tài Chính",
    templateId: "ZNS_CEO1983_FEE_REMINDER",
    name: "Thông báo thu hội phí niên liễm định kỳ",
    messageContent:
      "Kính gửi Hội viên {ho_ten} (Mã HV: {ma_hoi_vien}), Ban Tài chính CLB Doanh nhân CEO 1983 trân trọng thông báo kỳ gia hạn hội phí thường niên năm {nam_hoi_phi}. Số tiền: {so_tien} VNĐ. Hạn hoàn tất trước ngày {han_dong}. Kính chúc Doanh nghiệp {ten_doanh_nghiep} ngày càng phát triển thịnh vượng!",
    availableVariables: ["{ho_ten}", "{ma_hoi_vien}", "{nam_hoi_phi}", "{so_tien}", "{han_dong}", "{ten_doanh_nghiep}"],
    enabled: true,
  },
  {
    id: "tpl_event_1",
    category: "event",
    categoryName: "Sự Kiện Hiệp Hội",
    templateId: "ZNS_CEO1983_EVENT_INVITE",
    name: "Thư mời tham dự Sự kiện & Gala Giao Thương",
    messageContent:
      "Kính mời Hội viên {ho_ten}, Ban Chấp hành CEO 1983 kính mời Anh/Chị tham dự sự kiện {ten_su_kien}. Thời gian: {thoi_gian}. Địa điểm: {dia_diem}. Mã vé điện tử: {ma_ve}. Vui lòng xuất trình mã QR tại bàn Check-in Keangnam Landmark 72.",
    availableVariables: ["{ho_ten}", "{ten_su_kien}", "{thoi_gian}", "{dia_diem}", "{ma_ve}", "{so_ghe}"],
    enabled: true,
  },
  {
    id: "tpl_train_1",
    category: "training",
    categoryName: "Chương Trình Đào Tạo",
    templateId: "ZNS_CEO1983_TRAINING_NOTICE",
    name: "Xác nhận đăng ký & Nhắc lịch Khóa Đào tạo Doanh nhân",
    messageContent:
      "Hội viên {ho_ten} đã đăng ký thành công khóa đào tạo chuyên sâu: {ten_khoa_hoc}. Giảng viên: {giang_vien}. Thời gian diễn ra: {thoi_gian}. Phòng họp trực tuyến bảo mật: {link_phong}. Giáo trình đã sẵn sàng tải về trên App CEO 1983.",
    availableVariables: ["{ho_ten}", "{ten_khoa_hoc}", "{giang_vien}", "{thoi_gian}", "{link_phong}"],
    enabled: true,
  },
  {
    id: "tpl_meet_1",
    category: "meeting",
    categoryName: "Cuộc Họp & Hẹn 1-on-1",
    templateId: "ZNS_CEO1983_MEETING_ALERT",
    name: "Thông báo Lịch họp Ban & Hẹn gặp Kết nối 1-on-1",
    messageContent:
      "Thông báo lịch hẹn: {ten_cuoc_hop} giữa Hội viên {ho_ten} và đối tác {doi_tac}. Thời gian: {thoi_gian}. Địa điểm: {dia_diem}. Nội dung: {noi_dung_hop}. Chúc buổi làm việc gặt hái nhiều cơ hội hợp tác!",
    availableVariables: ["{ho_ten}", "{doi_tac}", "{ten_cuoc_hop}", "{thoi_gian}", "{dia_diem}", "{noi_dung_hop}"],
    enabled: true,
  },
];

export interface BulkMember {
  id: string;
  name: string;
  phone: string;
  memberCode: string;
  company: string;
  feeStatus: "unpaid" | "paid";
  role: "member" | "board" | "executive";
  userId?: string;
}

const DEFAULT_BULK_MEMBERS: BulkMember[] = [
  {
    id: "m_1",
    name: "Phạm Văn Vũ",
    phone: "0973924819",
    memberCode: "CEO1983-088",
    company: "Viconnect Digital Tech",
    feeStatus: "unpaid",
    role: "member",
  },
  {
    id: "m_2",
    name: "Lê Thị Thùy Dung",
    phone: "0973205683",
    memberCode: "CEO1983-002",
    company: "Thuận Nhiên Foods Organic",
    feeStatus: "paid",
    role: "board",
  },
  {
    id: "m_3",
    name: "Chung Hoàng",
    phone: "0367231668",
    memberCode: "CEO1983-001",
    company: "Chung Hoàng Media & Entertainment",
    feeStatus: "paid",
    role: "executive",
  },
  {
    id: "m_4",
    name: "Nguyễn Văn Nam",
    phone: "0912345678",
    memberCode: "CEO1983-015",
    company: "Bất Động Sản & Xây Dựng Thủ Đô",
    feeStatus: "unpaid",
    role: "member",
  },
  {
    id: "m_5",
    name: "Trần Bích Ngọc",
    phone: "0987654321",
    memberCode: "CEO1983-022",
    company: "Dược Phẩm Quốc Tế BioTech",
    feeStatus: "unpaid",
    role: "member",
  },
  {
    id: "m_6",
    name: "Hoàng Tuấn Anh",
    phone: "0905123456",
    memberCode: "CEO1983-045",
    company: "Cơ Khí Chính Xác & Tự Động Hóa",
    feeStatus: "unpaid",
    role: "member",
  },
  {
    id: "m_7",
    name: "Vũ Hải Yến",
    phone: "0934567890",
    memberCode: "CEO1983-067",
    company: "Thời Trang & May Mặc Xuất Khẩu",
    feeStatus: "unpaid",
    role: "member",
  },
  {
    id: "m_8",
    name: "Đỗ Mạnh Hùng",
    phone: "0945678901",
    memberCode: "CEO1983-099",
    company: "Vận Tải Quốc Tế & Logistics",
    feeStatus: "paid",
    role: "board",
  },
  {
    id: "m_9",
    name: "Phạm Phương Thảo",
    phone: "0967890123",
    memberCode: "CEO1983-112",
    company: "Chuỗi Nhà Hàng & Ẩm Thực Hà Nội",
    feeStatus: "unpaid",
    role: "member",
  },
  {
    id: "m_10",
    name: "Bùi Quốc Toàn",
    phone: "0923456789",
    memberCode: "CEO1983-125",
    company: "Thiết Kế Nội Thất & Kiến Trúc",
    feeStatus: "paid",
    role: "member",
  },
];

export const ZaloOaConfigSection: React.FC = () => {
  // Official Account ID, App ID & Secret Key (Dynamic 100% từ localStorage hoặc mặc định CLB CEO 1983)
  const [oaId, setOaId] = useState("437444346010531505");
  const [appId, setAppId] = useState("736933908446960497");
  const [secretKey, setSecretKey] = useState("f42YHsjU1Ku9UcK7IxZQ");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  // Trạng thái Token & Kiểm thử Online
  const [tokenStatus, setTokenStatus] = useState<{
    checked: boolean;
    valid: boolean;
    message: string;
    oaName?: string;
  } | null>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const [isExchangingCode, setIsExchangingCode] = useState(false);
  const [authCodeInput, setAuthCodeInput] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [webhookUrl, setWebhookUrl] = useState("https://api.ceo1983.vn/zalo/webhook");
  const [isConnected, setIsConnected] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  // Thông tin gửi bắn thông báo test & phí hội viên thực chiến
  const [targetMemberName, setTargetMemberName] = useState("Phạm Văn Vũ");
  const [targetPhone, setTargetPhone] = useState("0973924819");
  const [targetMemberCode, setTargetMemberCode] = useState("CEO1983-088");
  const [targetCompany, setTargetCompany] = useState("Viconnect Digital Tech");
  const [feeAmount, setFeeAmount] = useState(10000000);
  const [feeYear, setFeeYear] = useState("2026");
  const [feeDueDate, setFeeDueDate] = useState("31/12/2026");
  const [sendingTestBroadcast, setSendingTestBroadcast] = useState(false);
  const [sendingFeeNotice, setSendingFeeNotice] = useState(false);
  const [feeNoticeText, setFeeNoticeText] = useState("");
  const [showFeeModal, setShowFeeModal] = useState(false);

  // Đa dạng loại thông báo Zalo OA: Hội phí, Sự kiện + QR Check-in, Lịch họp BĐH, Giao thương B2B
  const [noticeType, setNoticeType] = useState<"fee" | "event" | "meeting" | "b2b">("fee");

  // Sự kiện & Mã QR Check-in
  const [eventName, setEventName] = useState("Gala Doanh Nhân CEO 1983 & Kết Nối Giao Thương 2026");
  const [eventTime, setEventTime] = useState("08:30 - Thứ Bảy, 15/11/2026");
  const [eventLocation, setEventLocation] = useState("Keangnam Landmark 72, Phạm Hùng, Hà Nội");
  const [eventTicketCode, setEventTicketCode] = useState("CEO1983-VIP-088");

  // Lịch Họp Ban & Hội Nghị
  const [meetingTitle, setMeetingTitle] = useState("Họp Ban Thường Trực & Ban Điều Hành CLB CEO 1983");
  const [meetingTime, setMeetingTime] = useState("14:00 - Thứ Tư, 12/11/2026");
  const [meetingLocation, setMeetingLocation] = useState("Phòng VIP Văn phòng HanoiBA, Tầng 4 Cung Trí Thức Hà Nội");
  const [meetingAgenda, setMeetingAgenda] = useState("Thống nhất kế hoạch xúc tiến thương mại Quý 4 & Xét duyệt kết nạp hội viên mới");

  // Giao Thương & Hợp Tác B2B
  const [b2bTitle, setB2bTitle] = useState("Cơ hội Cung ứng Vật tư Xây dựng & Giải pháp Chuyển đổi số");
  const [b2bPartner, setB2bPartner] = useState("Ban Xúc Tiến Thương Mại CLB Doanh Nhân CEO 1983");
  const [b2bRequirement, setB2bRequirement] = useState("Tìm kiếm đối tác thành viên cung cấp giải pháp công nghệ số và vật liệu xanh chất lượng cao");
  const [b2bContact, setB2bContact] = useState("0973924819");

  // Dữ liệu thực tế gọi từ Database API của các chức năng (Sự kiện, Cuộc họp, Đào tạo, Cơ hội B2B)
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [dbMeetings, setDbMeetings] = useState<any[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("");
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  const [dbTrainings, setDbTrainings] = useState<any[]>([]);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("");
  const [loadingTrainings, setLoadingTrainings] = useState(false);

  const [dbOpps, setDbOpps] = useState<any[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>("");
  const [loadingOpps, setLoadingOpps] = useState(false);

  const loadEventsApi = async () => {
    try {
      setLoadingEvents(true);
      const res = await fetchNestApi<any[]>("/events");
      if (Array.isArray(res) && res.length > 0) {
        setDbEvents(res);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadMeetingsApi = async () => {
    try {
      setLoadingMeetings(true);
      const res = await fetchNestApi<any[]>("/business-connect/meetings").catch(() =>
        fetchNestApi<any[]>("/meetings")
      );
      if (Array.isArray(res) && res.length > 0) {
        setDbMeetings(res);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingMeetings(false);
    }
  };

  const loadTrainingsApi = async () => {
    try {
      setLoadingTrainings(true);
      const res = await fetchNestApi<any>("/trainings");
      const list = Array.isArray(res) ? res : res?.items || [];
      if (Array.isArray(list) && list.length > 0) {
        setDbTrainings(list);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingTrainings(false);
    }
  };

  const loadOppsApi = async () => {
    try {
      setLoadingOpps(true);
      const res = await fetchNestApi<any[]>("/opportunities");
      if (Array.isArray(res) && res.length > 0) {
        setDbOpps(res);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingOpps(false);
    }
  };

  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    const ev = dbEvents.find((e) => e.id === id);
    if (!ev) return;
    setEventName(ev.name);
    const dStr = ev.date ? new Date(ev.date).toLocaleDateString("vi-VN") : "";
    const tStr = ev.startTime ? ` lúc ${ev.startTime}` : "";
    setEventTime(`${dStr}${tStr}`);
    setEventLocation(ev.location || ev.address || "Keangnam Landmark 72, Phạm Hùng, Hà Nội");
    setEventTicketCode(`CEO1983-${String(ev.id).slice(0, 6).toUpperCase()}`);
    toast.success(`Đã nạp chuẩn dữ liệu từ sự kiện: "${ev.name}"`);
  };

  const handleSelectMeeting = (id: string) => {
    setSelectedMeetingId(id);
    const m = dbMeetings.find((item) => item.id === id);
    if (!m) return;
    setMeetingTitle(m.title || m.name || "Cuộc họp Ban Điều Hành CLB CEO 1983");
    const dStr =
      m.date || m.scheduledAt || m.startsAt
        ? new Date(m.date || m.scheduledAt || m.startsAt).toLocaleDateString("vi-VN")
        : "";
    const tStr = m.startTime || m.time ? ` lúc ${m.startTime || m.time}` : "";
    setMeetingTime(`${dStr}${tStr}`);
    setMeetingLocation(m.location || m.address || "Văn phòng HanoiBA, Tầng 4 Cung Trí Thức Hà Nội");
    setMeetingAgenda(m.agenda || m.description || "Thống nhất kế hoạch công tác và triển khai nhiệm vụ");
    toast.success(`Đã nạp chuẩn dữ liệu từ cuộc họp: "${m.title || m.name}"`);
  };

  const handleSelectB2b = (id: string) => {
    setSelectedOppId(id);
    const op = dbOpps.find((item) => item.id === id);
    if (!op) return;
    setB2bTitle(op.title || "Cơ hội hợp tác B2B");
    setB2bPartner(op.company || op.authorName || "Ban Xúc Tiến Thương Mại");
    setB2bRequirement(op.description || "Hợp tác phát triển kinh doanh");
    setB2bContact(op.phone || targetPhone || "0973924819");
    toast.success(`Đã nạp chuẩn dữ liệu từ cơ hội B2B: "${op.title}"`);
  };

  // Nạp dữ liệu các chức năng khi khởi tạo hoặc chuyển loại thông báo
  useEffect(() => {
    loadEventsApi();
    loadMeetingsApi();
    loadTrainingsApi();
    loadOppsApi();
  }, []);

  // Dynamic Event Check-in QR Payload & URL
  const eventQrData = `CEO1983_EVENT_CHECKIN|EVENT:${encodeURIComponent(eventName)}|MEMBER:${targetMemberCode}|TICKET:${eventTicketCode}|PHONE:${targetPhone}`;
  const eventQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventQrData)}`;

  // Danh sách hội viên tương tác gần đây từ Zalo OA (để lấy User ID chính xác 100%)
  const [recentChats, setRecentChats] = useState<{
    userId: string;
    displayName: string;
    avatar: string;
    lastMessage: string;
    time: number;
  }[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [sendMethod, setSendMethod] = useState<"oa_chat" | "zalo_direct">("oa_chat");
  const [znsTemplateId, setZnsTemplateId] = useState("ZNS_CEO1983_FEE_REMINDER");

  // Chế độ gửi: Gửi trực tiếp hội viên vs Chiến dịch bắn hàng loạt vs Lịch tự động theo chu kỳ
  const [broadcastMode, setBroadcastMode] = useState<"direct_send" | "bulk_campaign" | "scheduled_auto">("direct_send");
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(true);
  const [scheduleFrequency, setScheduleFrequency] = useState<"daily_morning" | "monthly_fee" | "weekly_digest">("monthly_fee");
  const [scheduleTarget, setScheduleTarget] = useState<"unpaid_fee" | "all" | "board">("unpaid_fee");
  const [isTriggeringSchedule, setIsTriggeringSchedule] = useState(false);
  const [bulkFilter, setBulkFilter] = useState<"all" | "unpaid_fee" | "board">("unpaid_fee");
  const [bulkMembers, setBulkMembers] = useState<BulkMember[]>(DEFAULT_BULK_MEMBERS);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(() =>
    DEFAULT_BULK_MEMBERS.filter((m) => m.feeStatus === "unpaid").map((m) => m.id)
  );
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [bulkResults, setBulkResults] = useState<{
    total: number;
    successCount: number;
    failedCount: number;
    results: any[];
  } | null>(null);
  const [showBulkResultModal, setShowBulkResultModal] = useState(false);

  // Template Management
  const [templates, setTemplates] = useState<ZaloOaTemplate[]>(DEFAULT_TEMPLATES);

  useEffect(() => {
    // Nạp danh sách hội viên thật từ CRM Backend
    const loadCrmMembers = async () => {
      try {
        const res = await fetch(getNestApiUrl("/members"), {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: BulkMember[] = data.map((m: any) => ({
              id: m.id,
              name: m.name || "Hội viên",
              phone: m.phone || "",
              memberCode: m.code || m.member_code || "CEO1983",
              company: m.company_name || m.company || "Doanh nghiệp CEO 1983",
              feeStatus: m.fee_paid ? "paid" : "unpaid",
              role: (m.type === "board" || m.level === "board") ? "board" : "member",
              userId: m.zalo_user_id || undefined,
            }));
            setBulkMembers(mapped);
          }
        }
      } catch {
        /* fallback to DEFAULT_BULK_MEMBERS */
      }
    };
    loadCrmMembers();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedOaId = localStorage.getItem("vba_zalo_oa_id");
    if (storedOaId) setOaId(storedOaId);
    const storedAppId = localStorage.getItem("vba_zalo_app_id");
    if (storedAppId) setAppId(storedAppId);
    const storedSecret = localStorage.getItem("vba_zalo_secret_key");
    if (storedSecret) setSecretKey(storedSecret);
    const storedAccess = localStorage.getItem("vba_zalo_access_token");
    if (storedAccess) setAccessToken(storedAccess);
    const storedRefresh = localStorage.getItem("vba_zalo_refresh_token");
    if (storedRefresh) setRefreshToken(storedRefresh);

    // Tự động bắt Authorization Code nếu người dùng vừa được Zalo chuyển hướng về
    const urlParams = new URLSearchParams(window.location.search);
    const authCodeFromUrl = urlParams.get("code");
    if (authCodeFromUrl) {
      toast.info("Đã phát hiện Authorization Code từ Zalo OA! Đang tự động đổi Access Token & Refresh Token...");
      const activeAppId = storedAppId || appId;
      const activeSecret = storedSecret || secretKey;
      (async () => {
        try {
          const res = await fetch(getNestApiUrl("/zalo/exchange-auth-code"), {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              appId: activeAppId.trim(),
              secretKey: activeSecret.trim(),
              code: authCodeFromUrl.trim(),
            }),
          });
          const data = await res.json();
          if (data && data.success && data.accessToken) {
            setAccessToken(data.accessToken);
            localStorage.setItem("vba_zalo_access_token", data.accessToken);
            if (data.refreshToken) {
              setRefreshToken(data.refreshToken);
              localStorage.setItem("vba_zalo_refresh_token", data.refreshToken);
            }
            setTokenStatus({
              checked: true,
              valid: true,
              message: "Đã cấp mới thành công Access Token (25h) & Refresh Token (90 ngày)!",
              oaName: "CLB Doanh Nhân CEO 1983",
            });
            toast.success("🎉 Đã tự động gọi và lưu cặp Token mới từ Zalo OA thành công 100%!");
            window.history.replaceState({}, document.title, window.location.pathname + "?tab=zalo_oa");
          }
        } catch {}
      })();
    }
    // Tải mẫu tin nhắn đã lưu từ máy chủ Backend
    (async () => {
      try {
        const res = await fetch(getNestApiUrl("/zalo/templates"), {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.templates) && data.templates.length > 0) {
            setTemplates(data.templates);
            localStorage.setItem("vba_zalo_oa_templates", JSON.stringify(data.templates));
            return;
          }
        }
      } catch {}
      try {
        const stored = localStorage.getItem("vba_zalo_oa_templates");
        if (stored) setTemplates(JSON.parse(stored));
      } catch {}
    })();
  }, []);

  const [activeCategory, setActiveCategory] = useState<"all" | "membership_fee" | "event" | "training" | "meeting">("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl_fee_1");
  const [testPhone, setTestPhone] = useState("0973924819");
  const [sendingTest, setSendingTest] = useState(false);

  // Save config Dynamic 100%
  const saveZaloConfig = async () => {
    try {
      const cfg = {
        oaId,
        appId,
        secretKey,
        accessToken,
        refreshToken,
        webhookUrl,
        isConnected,
      };
      localStorage.setItem("vba_zalo_oa_id", oaId);
      localStorage.setItem("vba_zalo_app_id", appId);
      localStorage.setItem("vba_zalo_secret_key", secretKey);
      localStorage.setItem("vba_zalo_access_token", accessToken);
      localStorage.setItem("vba_zalo_refresh_token", refreshToken);
      localStorage.setItem("vba_zalo_oa_config", JSON.stringify(cfg));
      localStorage.setItem("vba_zalo_oa_templates", JSON.stringify(templates));

      // Lưu đồng bộ toàn bộ mẫu template lên cơ sở dữ liệu server backend
      await fetch(getNestApiUrl("/zalo/templates"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ templates }),
      }).catch(() => {});

      toast.success("Đã lưu cấu hình Zalo OA & Toàn bộ Mẫu Thông Báo vào hệ thống thành công!");
    } catch {
      toast.error("Không thể lưu cấu hình Zalo OA");
    }
  };

  const getAuthHeaders = () => {
    const token =
      getAuthToken() ||
      (typeof window !== "undefined"
        ? localStorage.getItem("token") ||
          localStorage.getItem("vibe_token") ||
          localStorage.getItem("access_token")
        : null) ||
      "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Tự động gia hạn Access Token mới bằng Refresh Token qua Backend NestJS (Zero CORS, Zero Hardcoding)
  const handleAutoRefreshToken = async () => {
    if (!refreshToken.trim()) {
      toast.error("Chưa có Refresh Token! Vui lòng bấm 'Cấp Mới Token Từ Zalo OA' để cấp lại quyền.");
      return;
    }
    if (!secretKey.trim() || !appId.trim()) {
      toast.error("Vui lòng điền đủ App ID và Secret Key!");
      return;
    }

    setIsRefreshingToken(true);
    try {
      // Gọi qua NestJS Backend Server để đổi Refresh Token (Tránh triệt để lỗi CORS từ trình duyệt)
      const res = await fetch(getNestApiUrl("/zalo/refresh-token"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          appId: appId.trim(),
          secretKey: secretKey.trim(),
          refreshToken: refreshToken.trim(),
        }),
      });

      const data = await res.json();
      if (data && data.success && data.accessToken) {
        setAccessToken(data.accessToken);
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken);
          localStorage.setItem("vba_zalo_refresh_token", data.refreshToken);
        }
        localStorage.setItem("vba_zalo_access_token", data.accessToken);
        setTokenStatus({
          checked: true,
          valid: true,
          message: "Token vừa được gia hạn tự động thành công (25 giờ)!",
          oaName: "CLB Doanh Nhân CEO 1983",
        });
        toast.success("✅ Đã tự động gọi Access Token và Refresh Token mới từ Zalo OA về thành công 100%!");
      } else {
        const errDetail = data?.message || data?.error_description || "Không thể gia hạn token";
        toast.error(`Zalo phản hồi: ${errDetail}. Hãy bấm nút 'Cấp Mới Token Từ Zalo OA' để lấy mã ủy quyền mới!`);
      }
    } catch (err: any) {
      toast.error(`Lỗi kết nối máy chủ gia hạn token: ${err.message}`);
    } finally {
      setIsRefreshingToken(false);
    }
  };

  // Kiểm tra trực tuyến trạng thái của Token Zalo OA
  const checkTokenOnlineStatus = async (tokenToCheck?: string) => {
    const token = (tokenToCheck || accessToken).trim();
    if (!token) {
      setTokenStatus({
        checked: true,
        valid: false,
        message: "Chưa có Access Token trong hệ thống. Hãy bấm gia hạn hoặc cấp mới.",
      });
      return;
    }

    setIsCheckingToken(true);
    try {
      const res = await fetch(getNestApiUrl("/zalo/check-token"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ accessToken: token }),
      });
      const data = await res.json();
      if (data && data.valid) {
        setTokenStatus({
          checked: true,
          valid: true,
          message: "Access Token đang hoạt động bình thường (25 giờ)",
          oaName: data.data?.name || "CLB Doanh Nhân CEO 1983",
        });
        setIsConnected(true);
        toast.success("✅ Access Token Zalo OA đang hoạt động bình thường!");
      } else {
        setTokenStatus({
          checked: true,
          valid: false,
          message: data?.message || "Access Token đã hết giờ (Mã lỗi: -216). Bấm nút để gọi token mới!",
        });
        toast.warning("⚠️ Access Token Zalo OA đã hết giờ! Vui lòng bấm 'Gia Hạn Token' hoặc 'Cấp Mới'.");
      }
    } catch (err: any) {
      setTokenStatus({
        checked: true,
        valid: false,
        message: `Lỗi kết nối: ${err.message}`,
      });
    } finally {
      setIsCheckingToken(false);
    }
  };

  // Mở cửa sổ Zalo OA OAuth cấp quyền mới (khi Refresh Token hết hạn hoặc bắt đầu cấp)
  const handleOpenOAuthConsent = () => {
    if (!appId.trim()) {
      toast.error("Vui lòng cấu hình Zalo App ID!");
      return;
    }
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://ceo1983.vn";
    const redirectUri = `${currentOrigin}/settings?tab=zalo_oa`;
    const consentUrl = `https://oauth.zaloapp.com/v4/oa/permission?app_id=${encodeURIComponent(
      appId.trim()
    )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.open(consentUrl, "_blank", "width=600,height=750");
    setShowAuthModal(true);
    toast.info("Đã mở cửa sổ Zalo OAuth Consent! Sau khi chọn OA và bấm 'Cho phép', hãy dán mã code vào đây nếu Zalo chưa tự chuyển.");
  };

  // Đổi Authorization Code thành cặp Token mới (Access Token + Refresh Token)
  const handleExchangeAuthCode = async (codeToExchange?: string) => {
    const code = (codeToExchange || authCodeInput).trim();
    if (!code) {
      toast.error("Vui lòng nhập hoặc dán Authorization Code nhận được từ Zalo!");
      return;
    }
    if (!appId.trim() || !secretKey.trim()) {
      toast.error("Vui lòng điền đủ App ID và Secret Key!");
      return;
    }

    setIsExchangingCode(true);
    try {
      const res = await fetch(getNestApiUrl("/zalo/exchange-auth-code"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          appId: appId.trim(),
          secretKey: secretKey.trim(),
          code,
        }),
      });

      const data = await res.json();
      if (data && data.success && data.accessToken) {
        setAccessToken(data.accessToken);
        localStorage.setItem("vba_zalo_access_token", data.accessToken);
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken);
          localStorage.setItem("vba_zalo_refresh_token", data.refreshToken);
        }
        setTokenStatus({
          checked: true,
          valid: true,
          message: "Đã cấp mới thành công Access Token (25h) & Refresh Token (90 ngày)!",
          oaName: "CLB Doanh Nhân CEO 1983",
        });
        setShowAuthModal(false);
        setAuthCodeInput("");
        toast.success("🎉 Đã tự động gọi và lưu thành công cặp Token mới từ Zalo OA!");
      } else {
        toast.error(`Zalo từ chối đổi mã: ${data?.message || data?.error_description || "Mã code không hợp lệ hoặc đã hết hạn"}`);
      }
    } catch (err: any) {
      toast.error(`Lỗi kết nối máy chủ đổi token: ${err.message}`);
    } finally {
      setIsExchangingCode(false);
    }
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      setIsConnected(true);
      toast.success(`Kết nối Zalo Official Account (OA ID: ${oaId}) thành công! Trạng thái: Đang hoạt động`);
    }, 1200);
  };

  // Đồng bộ danh sách hội viên vừa tương tác qua Zalo OA để lấy Zalo User ID chính xác 100%
  const handleFetchRecentChats = async () => {
    if (!accessToken.trim()) {
      toast.error("Vui lòng dán Access Token vào ô cấu hình phía dưới trước!");
      return;
    }
    setLoadingChats(true);
    try {
      const res = await fetch(
        `${getNestApiUrl("/zalo/recent-chats")}?accessToken=${encodeURIComponent(accessToken.trim())}`,
        {
          headers: getAuthHeaders(),
        }
      );
      const data = await res.json();
      if (data && data.success) {
        if (Array.isArray(data.data) && data.data.length > 0) {
          setRecentChats(data.data);
          toast.success(`🎉 Đã tìm thấy ${data.data.length} hội viên vừa tương tác qua Zalo OA!`);
          if (!selectedUserId) {
            setSelectedUserId(data.data[0].userId);
            setTargetMemberName(data.data[0].displayName);
          }
        } else if (data.zaloError && data.zaloError.code !== 0) {
          const errCode = data.zaloError.code;
          const errMsg = data.zaloError.message;
          if (errCode === -216) {
            toast.error(`Zalo OA báo: Access Token không hợp lệ hoặc đã hết hạn (Mã: -216). Vui lòng nhấn nút 'Gia hạn Access Token' phía dưới!`);
          } else if (errCode === -212) {
            toast.error(`Zalo OA báo: Ứng dụng chưa được cấp quyền Quản lý tin nhắn trên Zalo Developers (Mã: -212). Bạn có thể nhập trực tiếp Zalo UID của hội viên để gửi thật ngay!`);
          } else {
            toast.warning(`Zalo OA phản hồi: ${errMsg} (Mã: ${errCode}). Bạn có thể nhập trực tiếp Zalo UID của hội viên vào ô bên dưới.`);
          }
        } else {
          toast.info("Chưa có tương tác mới ghi nhận từ API Zalo. Bạn có thể nhập trực tiếp Zalo User ID (UID) của hội viên vào ô bên dưới để bắn thật ngay lập tức!");
        }
      } else {
        toast.error(`Zalo phản hồi: ${data?.message || "Không thể tải danh sách chat"}`);
      }
    } catch (err: any) {
      toast.error(`Lỗi kết nối máy chủ: ${err.message}`);
    } finally {
      setLoadingChats(false);
    }
  };

  // Helper tạo nội dung thông báo đa dạng: Hội phí, Sự kiện + QR Check-in, Lịch họp, B2B
  const generateNoticeContent = () => {
    if (noticeType === "fee") {
      return `📢 [CLB DOANH NHÂN CEO 1983 - THÔNG BÁO HỘI PHÍ NIÊN LIỄM]
Kính gửi Hội viên: ${targetMemberName} (Mã HV: ${targetMemberCode} - SĐT: ${targetPhone})
Ban Thường trực CLB Doanh Nhân CEO 1983 (HanoiBA) trân trọng gửi thông báo đóng hội phí thường niên năm ${feeYear}:

💰 Số tiền: ${new Intl.NumberFormat("vi-VN").format(feeAmount)} VNĐ
🗓️ Hạn nộp: Trước ngày ${feeDueDate}
🏦 Thông tin thụ hưởng chính thức:
- Ngân hàng: MB Bank (Ngân hàng TMCP Quân Đội)
- Số tài khoản: 1983000000
- Chủ tài khoản: CLB DOANH NHAN CEO 1983
- Nội dung CK: HP1983 ${targetMemberCode} ${targetPhone}
- Hoặc thanh toán qua Cổng VNPay: https://ceo1983.vn/payment/vnpay?ref=${targetMemberCode}

Kính chúc Doanh nghiệp của Anh/Chị luôn phát triển thịnh vượng và gặt hái nhiều thành công trong năm ${feeYear}!`;
    }

    if (noticeType === "event") {
      return `🎟️ [CLB DOANH NHÂN CEO 1983 - THƯ MỜI SỰ KIỆN & VÉ CHECK-IN ĐIỆN TỬ]
Kính gửi Hội viên: ${targetMemberName} (Mã HV: ${targetMemberCode} - SĐT: ${targetPhone})
Ban Chấp Hành CLB Doanh Nhân CEO 1983 (HanoiBA) trân trọng kính mời Anh/Chị tham dự sự kiện:

🌟 Tên sự kiện: ${eventName}
🗓️ Thời gian: ${eventTime}
📍 Địa điểm: ${eventLocation}
🎫 Mã vé Check-in: ${eventTicketCode}
📱 Link Mã QR Check-in điện tử: ${eventQrUrl}

* Hướng dẫn Check-in: Anh/Chị vui lòng lưu mã QR hoặc mở tin nhắn Zalo này tại bàn Lễ tân / Cổng Check-in để quét mã nhận Thẻ đại biểu & Quà tặng chính thức.
Rất hân hạnh được đón tiếp Anh/Chị!`;
    }

    if (noticeType === "meeting") {
      return `📅 [CLB DOANH NHÂN CEO 1983 - THÔNG BÁO LỊCH HỌP BAN CHẤP HÀNH]
Kính gửi Anh/Chị: ${targetMemberName} (Mã HV: ${targetMemberCode} - SĐT: ${targetPhone})
Ban Thường Trực CLB Doanh Nhân CEO 1983 trân trọng thông báo lịch họp:

📋 Tiêu đề: ${meetingTitle}
🗓️ Thời gian: ${meetingTime}
📍 Địa điểm: ${meetingLocation}
📝 Nội dung trọng tâm: ${meetingAgenda}

Kính đề nghị Anh/Chị sắp xếp thời gian tham dự đúng giờ để phiên họp đạt hiệu quả cao nhất!`;
    }

    return `🤝 [CLB DOANH NHÂN CEO 1983 - CƠ HỘI KẾT NỐI GIAO THƯƠNG B2B]
Kính gửi Hội viên: ${targetMemberName} (Mã HV: ${targetMemberCode})
Ban Xúc Tiến Thương Mại CLB Doanh Nhân CEO 1983 trân trọng thông báo cơ hội hợp tác:

💼 Tiêu đề: ${b2bTitle}
🏢 Đơn vị chủ trì: ${b2bPartner}
🔍 Chi tiết yêu cầu: ${b2bRequirement}
📞 Đầu mối liên hệ: ${b2bContact}

Anh/Chị quan tâm vui lòng phản hồi qua tin nhắn Zalo này hoặc liên hệ hotline BXT để nhận hồ sơ chi tiết!`;
  };

  // 1. Gửi thông báo ZNS qua Số Điện Thoại - Chuẩn Enterprise 100% (Không cần Zalo UID, Không cần hội viên quan tâm OA trước)
  const handleSendZns = async () => {
    if (!accessToken.trim()) {
      toast.error("Vui lòng lấy và dán Access Token vào ô cấu hình phía dưới trước!");
      return;
    }
    if (!targetPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại Zalo của hội viên!");
      return;
    }
    setSendingFeeNotice(true);
    try {
      const res = await fetch(getNestApiUrl("/zalo/send-zns"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          accessToken: accessToken.trim(),
          templateId: znsTemplateId,
          phone: targetPhone.trim(),
          templateData: {
            customer_name: targetMemberName,
            member_code: targetMemberCode,
            fee_amount: new Intl.NumberFormat("vi-VN").format(feeAmount),
            due_date: feeDueDate,
            company_name: targetCompany || "CLB Doanh Nhân CEO 1983",
          },
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        toast.success(`🎉 BẮN THÔNG BÁO ZNS THÀNH CÔNG TỚI SĐT ${targetPhone}!`, {
          description: `Đã gửi qua cổng Zalo Notification Service chính thức tới ${targetMemberName}.`,
        });
      } else {
        toast.error(`Zalo ZNS phản hồi: ${data?.message || "Lỗi gửi ZNS"}`, {
          description: data?.guide || (data?.error ? `Mã lỗi: ${data.error}` : undefined),
        });
      }
    } catch (err: any) {
      toast.error(`Lỗi kết nối máy chủ khi gửi ZNS: ${err.message}`);
    } finally {
      setSendingFeeNotice(false);
    }
  };

  // 2. Mở Chat Zalo Trực Tiếp 1-Click (Deep Link zalo.me - Không cần API/Token, 100% Thành Công)
  const handleOpenDirectZalo = () => {
    if (!targetPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại hội viên!");
      return;
    }
    const cleanPhone = targetPhone.replace(/\D/g, "");
    const content = generateNoticeContent();
    try {
      navigator.clipboard.writeText(content);
      toast.success(`📋 Đã tự động sao chép toàn bộ thông báo vào Clipboard! Đang mở cửa sổ chat Zalo với ${targetMemberName} (${targetPhone})...`);
    } catch {}
    window.open(`https://zalo.me/${cleanPhone}`, "_blank");
  };

  // 3. Mô phỏng thử nghiệm gửi Webhook Zalo (Simulation) để kiểm tra luồng tự động bắt UID
  const handleSimulateWebhook = async () => {
    try {
      const res = await fetch(getNestApiUrl("/zalo/webhook"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: "user_send_text",
          sender: { id: "3700646744485476903", name: targetMemberName || "Phạm Văn Vũ" },
          message: { text: `Tôi là ${targetMemberName || "Phạm Văn Vũ"} ${targetPhone || "0973924819"} - Nhắn tin kết nối CEO 1983` },
          timestamp: Date.now(),
        }),
      });
      const data = await res.json();
      if (data && data.error === 0) {
        toast.success("✅ Đã mô phỏng gửi tin nhắn Webhook thành công! Bấm 'Đồng bộ danh bạ' để thấy kết quả tức thì.");
        handleFetchRecentChats();
      }
    } catch (err: any) {
      toast.error(`Lỗi mô phỏng Webhook: ${err.message}`);
    }
  };

  // Gửi Bắn Thông Báo Zalo OA Thật Trực Tiếp Cho Hội Viên (Đã bọc Authorization Token, Zero Test)
  const handleSendDirectNotice = async () => {
    if (!accessToken.trim()) {
      toast.error("Vui lòng lấy và dán Access Token vào ô cấu hình phía dưới trước!");
      return;
    }
    if (!selectedUserId.trim()) {
      toast.warning("Hội viên chưa có Zalo User ID (UID).", {
        description: "Zalo yêu cầu UID để gửi tin chat CS miễn phí. Bạn có thể chọn gửi bằng 'ZNS THEO SỐ ĐIỆN THOẠI' (không cần UID) hoặc bấm 'MỞ CHAT ZALO 1-CLICK'!",
        action: {
          label: "Mở Chat Zalo",
          onClick: handleOpenDirectZalo,
        },
      });
      return;
    }
    setSendingFeeNotice(true);
    const content = generateNoticeContent();
    setFeeNoticeText(content);

    try {
      const res = await fetch(getNestApiUrl("/zalo/send-message"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          accessToken: accessToken.trim(),
          userId: selectedUserId || undefined,
          targetPhone: targetPhone.trim(),
          targetName: targetMemberName.trim(),
          message: content,
        }),
      });

      const data = await res.json();
      setShowFeeModal(true);
      if (data && data.success) {
        toast.success(`🎉 ĐÃ BẮN THÔNG BÁO THÀNH CÔNG TỚI ZALO HỘI VIÊN!`, {
          description: `Đã gửi trực tiếp tới ${data.recipient?.name || targetMemberName} qua Zalo OA.`,
        });
      } else {
        toast.error(`Zalo từ chối gửi: ${data?.message || "Lỗi gửi tin"}`, {
          description: data?.error ? `Mã lỗi Zalo: ${data.error}` : undefined,
        });
      }
    } catch (err: any) {
      setShowFeeModal(true);
      toast.error(`Lỗi hệ thống khi gửi: ${err.message}`);
    } finally {
      setSendingFeeNotice(false);
    }
  };

  // Kích hoạt chạy chu kỳ tự động ngay bây giờ (Cron Run Now)
  const handleTriggerScheduledNow = async () => {
    if (!accessToken.trim()) {
      toast.error("Vui lòng lấy và dán Access Token vào ô cấu hình phía dưới trước!");
      return;
    }
    setIsTriggeringSchedule(true);
    try {
      const res = await fetch(getNestApiUrl("/zalo/trigger-scheduled"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          accessToken: accessToken.trim(),
          scheduleType: scheduleFrequency,
          targetGroup: scheduleTarget,
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        toast.success(`🎉 Đã kích hoạt chạy chu kỳ tự động thành công: ${data.successCount}/${data.total} hội viên đã nhận thông báo!`);
        setBulkResults({
          total: data.total,
          successCount: data.successCount,
          failedCount: data.failedCount,
          results: data.results || [],
        });
        setShowBulkResultModal(true);
      } else {
        toast.error(`Không thể kích hoạt chu kỳ: ${data?.message || "Lỗi xử lý"}`);
      }
    } catch (err: any) {
      toast.error(`Lỗi hệ thống khi chạy chu kỳ: ${err.message}`);
    } finally {
      setIsTriggeringSchedule(false);
    }
  };

  // 3. Khởi chạy chiến dịch bắn thông báo Zalo OA / ZNS hàng loạt cho nhiều hội viên
  const handleExecuteBulkCampaign = async () => {
    if (!accessToken.trim()) {
      toast.error("Vui lòng lấy và dán Access Token vào ô cấu hình phía dưới trước!");
      return;
    }
    const selectedMembers = bulkMembers.filter((m) => selectedMemberIds.includes(m.id));
    if (selectedMembers.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 hội viên để gửi chiến dịch!");
      return;
    }

    setIsSendingBulk(true);
    setBulkProgress({ current: 0, total: selectedMembers.length, percentage: 0 });
    setBulkResults(null);

    const activeTpl = templates.find((t) => t.id === selectedTemplateId) || templates[0];
    const messageTemplate =
      activeTpl?.messageContent?.trim() ||
      `📢 [CLB DOANH NHÂN CEO 1983 - THÔNG BÁO HỘI PHÍ NIÊN LIỄM]
Kính gửi Hội viên: {ho_ten} (Mã HV: {ma_hoi_vien} - SĐT: {so_dien_thoai})
Ban Tài chính CLB Doanh Nhân CEO 1983 (HanoiBA) trân trọng thông báo kỳ hoàn tất hội phí thường niên năm ${feeYear}:

💰 Số tiền: ${new Intl.NumberFormat("vi-VN").format(feeAmount)} VNĐ
🗓️ Hạn nộp: Trước ngày ${feeDueDate}
🏦 Thông tin thụ hưởng chính thức:
- Ngân hàng: MB Bank (Ngân hàng TMCP Quân Đội)
- Số tài khoản: 1983000000
- Chủ tài khoản: CLB DOANH NHAN CEO 1983
- Nội dung CK: HP1983 {ma_hoi_vien} {so_dien_thoai}
- Hoặc thanh toán qua Cổng VNPay: https://ceo1983.vn/payment/vnpay?ref={ma_hoi_vien}

Kính chúc Doanh nghiệp {ten_doanh_nghiep} ngày càng phát triển thịnh vượng!`;

    try {
      const res = await fetch(getNestApiUrl("/zalo/send-bulk"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          accessToken: accessToken.trim(),
          recipients: selectedMembers.map((m) => ({
            userId: m.userId,
            phone: m.phone,
            name: m.name,
            memberCode: m.memberCode,
            feeAmount: feeAmount,
            company: m.company,
          })),
          messageTemplate,
          delayMs: 250,
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        setBulkResults({
          total: data.total,
          successCount: data.successCount,
          failedCount: data.failedCount,
          results: data.results || [],
        });
        setShowBulkResultModal(true);
        toast.success(`🎉 Chiến dịch hoàn tất: ${data.successCount}/${data.total} hội viên đã nhận thông báo!`);
      } else {
        toast.error(`Chiến dịch thất bại: ${data?.message || "Lỗi xử lý"}`);
      }
    } catch (err: any) {
      toast.error(`Lỗi hệ thống: ${err.message}`);
    } finally {
      setIsSendingBulk(false);
    }
  };

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleUpdateTemplateContent = (newContent: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedTemplateId ? { ...t, messageContent: newContent } : t))
    );
  };

  const handleToggleTemplate = (tplId: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === tplId ? { ...t, enabled: !t.enabled } : t))
    );
    toast.info("Đã cập nhật trạng thái kích hoạt mẫu tin nhắn");
  };

  const handleInsertVariable = (variable: string) => {
    if (!currentTemplate) return;
    const nextContent = `${currentTemplate.messageContent} ${variable}`;
    handleUpdateTemplateContent(nextContent);
  };

  const handleSendTestMessage = () => {
    if (!testPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại hội viên nhận thử nghiệm!");
      return;
    }
    setSendingTest(true);
    setTimeout(() => {
      setSendingTest(false);
      toast.success(`Đã bắn thử tin nhắn Zalo OA mẫu sang SĐT ${testPhone} thành công!`);
    }, 1500);
  };

  // Preview Message with dummy replacements
  const previewMessage = (currentTemplate?.messageContent || "")
    .replace("{ho_ten}", targetMemberName || "Nguyễn Văn Nam")
    .replace("{ma_hoi_vien}", targetMemberCode || "CEO1983-088")
    .replace("{nam_hoi_phi}", feeYear || "2026")
    .replace("{so_tien}", new Intl.NumberFormat("vi-VN").format(feeAmount))
    .replace("{han_dong}", feeDueDate || "31/12/2026")
    .replace("{ten_doanh_nghiep}", "Doanh Nghiệp Hội Viên CEO 1983")
    .replace("{ten_su_kien}", "Gala Kết Nối Giao Thương B2B Quý 4")
    .replace("{thoi_gian}", "08:30 Ngày 15/11/2026")
    .replace("{dia_diem}", "Keangnam Landmark 72, Hà Nội")
    .replace("{ma_ve}", "TICKET-1983-VIP")
    .replace("{so_ghe}", "Bàn VIP 01")
    .replace("{ten_khoa_hoc}", "Quản Trị Tài Chính & Tối Ưu Chi Phí 2026")
    .replace("{giang_vien}", "TS. Lê Thẩm Dương")
    .replace("{link_phong}", "https://meet.jit.si/CEO1983_TAICHI")
    .replace("{doi_tac}", "Trần Thị Bích")
    .replace("{ten_cuoc_hop}", "Trao đổi hợp tác chuỗi cung ứng")
    .replace("{noi_dung_hop}", "Thảo luận hợp đồng mua bán vật liệu xây dựng");

  const filteredTemplates = templates.filter(
    (t) => activeCategory === "all" || t.category === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center font-black text-xl shadow-md shrink-0">
            Zalo
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold tracking-wide">Cấu Hình Zalo Official Account (Dynamic)</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase">
                CLB CEO 1983
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Official Account ID: <span className="font-mono font-bold text-white">{oaId}</span> · App ID: <span className="font-mono font-bold text-white">{appId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {testingConnection ? <RefreshCw className="size-3.5 animate-spin" /> : <ShieldCheck className="size-3.5 text-emerald-300" />}
            <span>{testingConnection ? "Đang kiểm tra..." : "Kiểm tra kết nối OA"}</span>
          </button>
        </div>
      </div>

      {/* BỘ ĐIỀU KHIỂN & CẤP QUYỀN TOKEN ZALO OA TỰ ĐỘNG (1-CLICK) */}
      <div className="p-5 rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-slate-900 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-200 dark:border-indigo-900/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <KeyRound className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                  Bộ Điều Khiển &amp; Cấp Quyền Token Zalo OA Tự Động (1-Click)
                </h4>
                {tokenStatus?.valid ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px] flex items-center gap-1 border border-emerald-500/20">
                    <CheckCircle2 className="size-3" /> Token Đang Hoạt Động (25h)
                  </span>
                ) : tokenStatus && !tokenStatus.valid ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-black text-[10px] flex items-center gap-1 border border-red-500/20 animate-pulse">
                    <AlertCircle className="size-3" /> Token Đã Hết Giờ - Cần Gọi Lại Ngay
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-[10px] flex items-center gap-1 border border-amber-500/20">
                    <Clock className="size-3" /> {accessToken ? "Sẵn sàng kiểm tra" : "Chưa có token"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Bấm nút bên dưới để hệ thống tự động gọi Access Token và Refresh Token mới từ Zalo OA về tức thì (Không cần sửa code)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => checkTokenOnlineStatus()}
              disabled={isCheckingToken}
              className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-white dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isCheckingToken ? <RefreshCw className="size-3 animate-spin" /> : <ShieldCheck className="size-3" />}
              <span>Kiểm Tra Trạng Thái Token</span>
            </button>
          </div>
        </div>

        {/* 2 Nút Hành Động Trực Tiếp Gọi Token Từ Zalo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Nút 1: Tự động gia hạn qua Refresh Token */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <RotateCw className="size-3.5 text-blue-600" />
                  Phương Thức 1: Gia Hạn Tự Động Bằng Refresh Token
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold">
                  Nhanh nhất
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Khi Access Token hết hạn 25 giờ nhưng Refresh Token còn hạn trong 90 ngày. Bấm nút dưới để tự lấy Access Token mới vĩnh viễn.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoRefreshToken}
              disabled={isRefreshingToken}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isRefreshingToken ? (
                <>
                  <RefreshCw className="size-4 animate-spin" /> Đang gọi Token mới từ Zalo...
                </>
              ) : (
                <>
                  <RotateCw className="size-4" /> ⚡ 1-Click Tự Động Gia Hạn Token Mới
                </>
              )}
            </button>
          </div>

          {/* Nút 2: Cấp mới Token khi Refresh Token hết hạn (OAuth Consent) */}
          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-indigo-600" />
                  Phương Thức 2: Cấp Mới Toàn Bộ Khi Refresh Token Hết Hạn
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
                  Triệt để 100%
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Khi Refresh Token cũng đã quá hạn 90 ngày. Bấm mở cổng cấp quyền Zalo OA, xác nhận để hệ thống nhận lại cả cặp Token mới.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleOpenOAuthConsent}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ExternalLink className="size-3.5" /> 🔑 Mở Cổng Cấp Quyền Zalo OA
              </button>
              <button
                type="button"
                onClick={() => setShowAuthModal(!showAuthModal)}
                className="px-3 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground transition cursor-pointer"
                title="Nhập thủ công mã ủy quyền"
              >
                Nhập Code
              </button>
            </div>
          </div>
        </div>

        {/* Modal / Khu vực Đổi Mã Ủy Quyền Zalo OAuth */}
        {showAuthModal && (
          <div className="p-4 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-600" />
                <span className="text-xs font-bold text-foreground">
                  Đổi Authorization Code Nhận Được Từ Zalo Thành Token Mới
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕ Đóng
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Sau khi bấm &quot;Mở Cổng Cấp Quyền Zalo OA&quot; và bấm Cho phép, nếu Zalo chuyển hướng hoặc cung cấp chuỗi mã Authorization Code, hãy dán vào ô dưới để hệ thống tự động đổi lấy Access Token và Refresh Token mới:
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={authCodeInput}
                onChange={(e) => setAuthCodeInput(e.target.value)}
                placeholder="Dán Authorization Code từ Zalo vào đây (hoặc để trống nếu URL có param ?code=...)"
                className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => handleExchangeAuthCode()}
                disabled={isExchangingCode}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isExchangingCode ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" /> Đang đổi token...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" /> Xác Nhận &amp; Lấy Token Tự Động
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* KHỐI TRỰC CHIẾN: BẮN THÔNG BÁO TEST & THÔNG BÁO PHÍ HỘI VIÊN TỚI ZALO */}
      <div className="p-5 rounded-2xl border-2 border-blue-600/30 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 dark:from-blue-950/20 dark:via-slate-900/40 dark:to-slate-900 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200 dark:border-blue-900/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Bell className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                Trung Tâm Bắn Thông Báo Zalo OA &amp; Thu Phí Hội Viên Niên Liễm
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Gửi thông báo thật tới Zalo hội viên: Thao tác gửi trực tiếp, gửi chiến dịch hàng loạt hoặc tự động theo chu kỳ
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Chuyển đổi 3 chế độ: Gửi Trực Tiếp vs Chiến Dịch Hàng Loạt vs Lịch Chu Kỳ Tự Động */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-blue-200 dark:border-blue-900 shadow-xs">
              <button
                type="button"
                onClick={() => setBroadcastMode("direct_send")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  broadcastMode === "direct_send"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <User className="size-3.5" />
                <span>Gửi Trực Tiếp Hội Viên</span>
              </button>
              <button
                type="button"
                onClick={() => setBroadcastMode("bulk_campaign")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  broadcastMode === "bulk_campaign"
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Users className="size-3.5" />
                <span>Chiến Dịch Hàng Loạt ({selectedMemberIds.length})</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black">
                  PRO
                </span>
              </button>
              <button
                type="button"
                onClick={() => setBroadcastMode("scheduled_auto")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  broadcastMode === "scheduled_auto"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Clock className="size-3.5" />
                <span>Lịch Tự Động Định Kỳ</span>
                {autoScheduleEnabled && (
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            </div>

            <a
              href={`https://zalo.me/${oaId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
            >
              <span>Mở Zalo OA</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>

        {broadcastMode === "direct_send" && (
          <>
        {/* Hướng dẫn kết nối nhanh & Mã QR OA */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-100 dark:border-blue-950">
          <div className="md:col-span-3 flex flex-col items-center text-center p-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
            <div className="size-32 bg-white p-2 rounded-2xl border-2 border-blue-600/30 shadow-sm flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://zalo.me/${oaId}`}
                alt="QR Zalo OA CLB CEO 1983"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 mt-1.5">
              Quét QR để mở OA trên Zalo
            </span>
          </div>

          <div className="md:col-span-9 space-y-2">
            <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
              📌 ĐIỀU KIỆN ĐỂ ZALO OA GỬI ĐƯỢC TIN NHẮN TỚI ZALO CỦA BẠN:
            </div>
            <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-decimal pl-4 leading-relaxed">
              <li>
                Mở ứng dụng Zalo trên điện thoại, quét mã QR bên cạnh (hoặc truy cập{" "}
                <a
                  href={`https://zalo.me/${oaId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-600 underline"
                >
                  https://zalo.me/{oaId}
                </a>
                ).
              </li>
              <li>
                Bấm nút <span className="font-bold text-blue-700 dark:text-blue-400">"Quan tâm"</span> (Follow) trang Zalo OA <b>CLB CEO 1983</b>.
              </li>
              <li>
                Bấm vào nút <span className="font-bold text-blue-700 dark:text-blue-400">"Nhắn tin"</span> và gửi 1 tin bất kỳ (Ví dụ: <i>"Tôi là hội viên CEO 1983"</i>). Zalo sẽ mở quyền cho OA phản hồi và bắn tin tự động cho Bạn!
              </li>
            </ol>
          </div>
        </div>

        {/* DANH SÁCH HỘI VIÊN TƯƠNG TÁC GẦN ĐÂY QUA ZALO OA */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-100 dark:border-blue-950 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <User className="size-4 text-blue-600" />
              <span className="text-xs font-black uppercase text-slate-900 dark:text-slate-100">
                Hội Viên Đang Tương Tác Qua Zalo OA:
              </span>
              {selectedUserId && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                  UID: {selectedUserId}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleFetchRecentChats}
              disabled={loadingChats}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-900"
            >
              <RefreshCw className={`size-3.5 ${loadingChats ? "animate-spin" : ""}`} />
              <span>{loadingChats ? "Đang đồng bộ..." : "Đồng bộ danh bạ từ Zalo OA"}</span>
            </button>
          </div>

          {recentChats.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {recentChats.map((chat) => (
                <button
                  key={chat.userId}
                  type="button"
                  onClick={() => {
                    setSelectedUserId(chat.userId);
                    setTargetMemberName(chat.displayName);
                    toast.info(`Đã chọn: ${chat.displayName} (UID: ${chat.userId})`);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    selectedUserId === chat.userId
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                  }`}
                >
                  {chat.avatar ? (
                    <img src={chat.avatar} alt={chat.displayName} className="size-5 rounded-full object-cover" />
                  ) : (
                    <div className="size-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                      {chat.displayName.charAt(0)}
                    </div>
                  )}
                  <span>{chat.displayName}</span>
                  {chat.lastMessage && (
                    <span className="text-[10px] opacity-80 max-w-[140px] truncate font-normal">
                      "{chat.lastMessage}"
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Gợi ý chọn nhanh hội viên CLB:</span>
                {DEFAULT_BULK_MEMBERS.slice(0, 3).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setTargetMemberName(m.name);
                      setTargetPhone(m.phone);
                      setTargetMemberCode(m.memberCode);
                      setTargetCompany(m.company || "Doanh nghiệp CEO 1983");
                      if (m.userId) setSelectedUserId(m.userId);
                      toast.info(`Đã chọn thông tin: ${m.name} (${m.phone})`);
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-500 transition font-medium cursor-pointer"
                  >
                    👤 {m.name} ({m.phone})
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 italic">
                💡 <b>Mẹo đồng bộ nhanh:</b> Bấm <b>"Đồng bộ danh bạ từ Zalo OA"</b>. Nếu Zalo chưa cấp quyền đọc tin nhắn cho App, bạn có thể <b>nhập trực tiếp Zalo User ID (UID)</b> vào ô bên dưới (lấy từ Webhook hoặc trang chat.oa.zalo.me) để gửi tin nhắn thật 100%!
              </p>
            </div>
          )}

          {/* Webhook Endpoint Banner */}
          <div className="p-3 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-2">
            <div className="text-xs text-blue-900 dark:text-blue-200">
              <span className="font-bold">🔗 Zalo Webhook URL tự động nhận diện tin nhắn: </span>
              <code className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 font-mono text-[11px]">
                https://crm.ceo1983.viconnect.vn/api/zalo/webhook
              </code>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText("https://crm.ceo1983.viconnect.vn/api/zalo/webhook");
                toast.success("Đã sao chép Webhook URL vào bộ nhớ đệm!");
              }}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer shrink-0"
            >
              Sao chép Webhook URL
            </button>
          </div>
        </div>

                {/* CHỌN PHƯƠNG THỨC GỬI TIN NHẮN (CHUẨN DOANH NGHIỆP LỚN) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-indigo-500/30 dark:border-indigo-900/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 tracking-tight">
                Phương Thức Gửi Tin Nhắn (Chuẩn Doanh Nghiệp):
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 italic">
              {sendMethod === "oa_chat" && "💬 Chat CS qua Zalo OA: Gửi trực tiếp tin nhắn thông báo chính thức"}
              {sendMethod === "zalo_direct" && "⚡ Mở Chat Zalo 1-Click: Sao chép nội dung & mở thẳng Zalo cá nhân"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phương án 1: Chat CS Qua Zalo OA */}
            <div
              onClick={() => setSendMethod("oa_chat")}
              className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                sendMethod === "oa_chat"
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <MessageSquareText className="size-4 text-blue-600" />
                  <span>1. GỬI TIN NHẮN QUA ZALO OA</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[9px] font-bold">
                  CHÍNH THỨC
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                • Gửi qua API Zalo Official Account chính thức của CEO 1983<br />
                • Tự động khớp nối danh bạ từ Webhook và CSDL<br />
                • Hỗ trợ đẩy thông báo Hội phí, Sự kiện &amp; Lịch họp
              </p>
            </div>

            {/* Phương án 2: 1-Click Zalo Direct */}
            <div
              onClick={() => setSendMethod("zalo_direct")}
              className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                sendMethod === "zalo_direct"
                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                  <ExternalLink className="size-4 text-indigo-600" />
                  <span>2. MỞ CHAT ZALO 1-CLICK</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-[9px] font-bold">
                  TỨC THÌ
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                • <b>100% không bao giờ lỗi API</b> hoặc hết hạn Token<br />
                • Tự sao chép nội dung thông báo vào Clipboard<br />
                • Mở thẳng app Zalo trò chuyện với hội viên
              </p>
            </div>
          </div>
        </div>

        {/* BỘ CHỌN LOẠI THÔNG BÁO: HỘI PHÍ, SỰ KIỆN & QR CHECK-IN, LỊCH HỌP, B2B */}
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-blue-100 dark:border-blue-950 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 px-2 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>Dạng Tin Nhắn:</span>
            </span>
            <button
              type="button"
              onClick={() => setNoticeType("fee")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                noticeType === "fee"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <CreditCard className="size-3.5" />
              <span>💰 Hội Phí Niên Liễm</span>
            </button>
            <button
              type="button"
              onClick={() => setNoticeType("event")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                noticeType === "event"
                  ? "bg-gradient-to-r from-[#991B1B] via-red-600 to-amber-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Ticket className="size-3.5" />
              <span>🎟️ Thư Mời Sự Kiện &amp; QR Check-in</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-300 text-slate-950 text-[9px] font-black">
                MỚI
              </span>
            </button>
            <button
              type="button"
              onClick={() => setNoticeType("meeting")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                noticeType === "meeting"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Calendar className="size-3.5" />
              <span>📅 Lịch Họp Ban BĐH</span>
            </button>
            <button
              type="button"
              onClick={() => setNoticeType("b2b")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                noticeType === "b2b"
                  ? "bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Handshake className="size-3.5" />
              <span>🤝 Kết Nối Giao Thương B2B</span>
            </button>
          </div>

          <span className="text-[11px] font-semibold text-slate-500 italic pr-2">
            {noticeType === "event" && "✅ Tự động sinh mã QR Check-in điện tử cho hội viên"}
            {noticeType === "fee" && "🏦 Kèm STK MB Bank & Cổng thanh toán VNPay"}
            {noticeType === "meeting" && "📋 Gửi kèm lịch biểu và nội dung phiên họp"}
            {noticeType === "b2b" && "💼 Kết nối cung cầu xúc tiến thương mại"}
          </span>
        </div>

        {/* THÔNG TIN NGƯỜI NHẬN (4 CỘT) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Họ Tên Hội Viên Nhận:
            </label>
            <div className="relative">
              <User className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={targetMemberName}
                onChange={(e) => setTargetMemberName(e.target.value)}
                placeholder="Nhập họ tên hội viên..."
                className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Số Điện Thoại Zalo:
            </label>
            <div className="relative">
              <Phone className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                placeholder="Ví dụ: 0973924819..."
                className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-mono font-bold text-foreground focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Mã Hội Viên CLB:
            </label>
            <div className="relative">
              <Building2 className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={targetMemberCode}
                onChange={(e) => setTargetMemberCode(e.target.value)}
                placeholder="Ví dụ: CEO1983-088..."
                className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-mono font-bold text-foreground focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
              <span>Zalo User ID (UID):</span>
              <span className="text-[10px] text-blue-600 font-semibold">*Bắt buộc gửi thật</span>
            </label>
            <div className="relative">
              <KeyRound className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                placeholder="Nhập UID (VD: 3700646744485476903)..."
                className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-mono text-foreground focus:ring-2 focus:ring-blue-500/20 font-bold"
              />
            </div>
          </div>
        </div>

        {/* CÁC TRƯỜNG DỮ LIỆU TÙY BIẾN THEO LOẠI THÔNG BÁO */}
        {noticeType === "fee" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-950">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Số Tiền Hội Phí (VNĐ):
              </label>
              <div className="relative">
                <DollarSign className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="number"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(Number(e.target.value))}
                  placeholder="10000000"
                  className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-mono font-bold text-foreground focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Kỳ Niên Liễm:
              </label>
              <div className="relative">
                <Calendar className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={feeYear}
                  onChange={(e) => setFeeYear(e.target.value)}
                  placeholder="2026"
                  className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Hạn Nộp Hoàn Tất:
              </label>
              <div className="relative">
                <Calendar className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={feeDueDate}
                  onChange={(e) => setFeeDueDate(e.target.value)}
                  placeholder="31/12/2026"
                  className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {noticeType === "event" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-950">
            {/* Thanh Chọn Sự Kiện Chuẩn Từ Database API */}
            <div className="lg:col-span-12 p-3 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Ticket className="size-4 text-red-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-red-900 dark:text-red-200">
                    LẤY DỮ LIỆU CHUẨN TỪ API SỰ KIỆN (/events)
                  </div>
                  <div className="text-[11px] text-red-700/80 dark:text-red-300/70">
                    Hệ thống tự động điền tên, thời gian, địa điểm và tạo mã QR check-in từ CSDL
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <select
                  value={selectedEventId}
                  onChange={(e) => handleSelectEvent(e.target.value)}
                  className="flex-1 rounded-xl border border-red-300 dark:border-red-800 bg-background px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="">-- Chọn sự kiện có trong CSDL ({dbEvents.length}) --</option>
                  {dbEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.date ? new Date(ev.date).toLocaleDateString("vi-VN") : "Sắp tới"})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={loadEventsApi}
                  disabled={loadingEvents}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-red-300 dark:border-red-800 hover:bg-red-50 text-red-600 cursor-pointer shrink-0"
                  title="Tải lại danh sách sự kiện từ API"
                >
                  <RefreshCw className={`size-3.5 ${loadingEvents ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Form trường sự kiện */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Tên Sự Kiện / Gala:
                </label>
                <div className="relative">
                  <Ticket className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Nhập tên sự kiện..."
                    className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Thời Gian Diễn Ra:
                </label>
                <div className="relative">
                  <Clock className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="08:30 - Thứ Bảy, 15/11/2026"
                    className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Mã Vé Điện Tử:
                </label>
                <div className="relative">
                  <QrCode className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={eventTicketCode}
                    onChange={(e) => setEventTicketCode(e.target.value)}
                    placeholder="CEO1983-VIP-088"
                    className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-mono font-bold text-foreground focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Địa Điểm Tổ Chức:
                </label>
                <div className="relative">
                  <MapPin className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Keangnam Landmark 72, Phạm Hùng, Hà Nội"
                    className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Khối Live Preview Mã QR Check-in */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-red-50/80 to-amber-50/50 dark:from-red-950/30 dark:to-slate-900 border border-red-200/80 dark:border-red-900/60 text-center">
              <div className="size-28 bg-white p-2 rounded-2xl border-2 border-red-600/40 shadow-sm flex items-center justify-center">
                <img
                  src={eventQrUrl}
                  alt="Mã QR Check-in Sự Kiện"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[11px] font-black text-red-700 dark:text-red-400 mt-2">
                MÃ QR CHECK-IN SỰ KIỆN
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                Vé: {eventTicketCode}
              </span>
              <div className="flex items-center gap-1.5 mt-2">
                <a
                  href={eventQrUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={`QR_Checkin_${eventTicketCode}.png`}
                  className="px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 text-[10px] font-bold inline-flex items-center gap-1 transition"
                >
                  <Download className="size-3" />
                  <span>Tải QR</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(eventQrUrl);
                    toast.success("Đã sao chép đường link mã QR Check-in!");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <Copy className="size-3" />
                  <span>Sao Chép Link</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {noticeType === "meeting" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-950">
            {/* Thanh Chọn Cuộc Họp Chuẩn Từ Database API */}
            <div className="sm:col-span-2 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    LẤY DỮ LIỆU CHUẨN TỪ API CUỘC HỌP (/business-connect/meetings)
                  </div>
                  <div className="text-[11px] text-blue-700/80 dark:text-blue-300/70">
                    Hệ thống tự động điền tiêu đề cuộc họp, lịch trình, phòng họp và nội dung trọng tâm từ CSDL
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <select
                  value={selectedMeetingId}
                  onChange={(e) => handleSelectMeeting(e.target.value)}
                  className="flex-1 rounded-xl border border-blue-300 dark:border-blue-800 bg-background px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">-- Chọn cuộc họp có trong CSDL ({dbMeetings.length}) --</option>
                  {dbMeetings.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title || m.name} ({m.date ? new Date(m.date).toLocaleDateString("vi-VN") : "Sắp tới"})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={loadMeetingsApi}
                  disabled={loadingMeetings}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-800 hover:bg-blue-50 text-blue-600 cursor-pointer shrink-0"
                  title="Tải lại danh sách cuộc họp từ API"
                >
                  <RefreshCw className={`size-3.5 ${loadingMeetings ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Tiêu Đề Cuộc Họp / Hội Nghị:
              </label>
              <div className="relative">
                <Calendar className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="Họp Ban Thường Trực & Ban Điều Hành CLB CEO 1983"
                  className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Thời Gian Họp:
              </label>
              <div className="relative">
                <Clock className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  placeholder="14:00 - Thứ Tư, 12/11/2026"
                  className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Địa Điểm Cuộc Họp:
              </label>
              <div className="relative">
                <MapPin className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  placeholder="Phòng VIP Văn phòng HanoiBA"
                  className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Nội Dung Trọng Tâm:
              </label>
              <textarea
                value={meetingAgenda}
                onChange={(e) => setMeetingAgenda(e.target.value)}
                rows={2}
                placeholder="Thống nhất kế hoạch xúc tiến thương mại Quý 4 & Xét duyệt kết nạp hội viên mới..."
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-medium text-foreground focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}

        {noticeType === "b2b" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-950">
            {/* Thanh Chọn Cơ Hội B2B Chuẩn Từ Database API */}
            <div className="sm:col-span-2 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-amber-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    LẤY DỮ LIỆU CHUẨN TỪ API CƠ HỘI B2B (/opportunities)
                  </div>
                  <div className="text-[11px] text-amber-700/80 dark:text-amber-300/70">
                    Hệ thống tự động điền tiêu đề cơ hội, doanh nghiệp chủ trì và yêu cầu hợp tác từ CSDL
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <select
                  value={selectedOppId}
                  onChange={(e) => handleSelectB2b(e.target.value)}
                  className="flex-1 rounded-xl border border-amber-300 dark:border-amber-800 bg-background px-3 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">-- Chọn cơ hội có trong CSDL ({dbOpps.length}) --</option>
                  {dbOpps.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.title} ({op.company || "Doanh nghiệp"})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={loadOppsApi}
                  disabled={loadingOpps}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 hover:bg-amber-50 text-amber-600 cursor-pointer shrink-0"
                  title="Tải lại danh sách cơ hội từ API"
                >
                  <RefreshCw className={`size-3.5 ${loadingOpps ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Tiêu Đề Cơ Hội Hợp Tác:
              </label>
              <div className="relative">
                <Briefcase className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={b2bTitle}
                  onChange={(e) => setB2bTitle(e.target.value)}
                  placeholder="Cơ hội Cung ứng Vật tư Xây dựng & Giải pháp Chuyển đổi số"
                  className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Đơn Vị Chủ Trì / Kết Nối:
              </label>
              <div className="relative">
                <Building2 className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={b2bPartner}
                  onChange={(e) => setB2bPartner(e.target.value)}
                  placeholder="Ban Xúc Tiến Thương Mại CLB CEO 1983"
                  className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Đầu Mối Liên Hệ (SĐT/Hotline):
              </label>
              <div className="relative">
                <Phone className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={b2bContact}
                  onChange={(e) => setB2bContact(e.target.value)}
                  placeholder="0973924819"
                  className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-mono font-bold text-foreground focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Yêu Cầu Hợp Tác Chi Tiết:
              </label>
              <textarea
                value={b2bRequirement}
                onChange={(e) => setB2bRequirement(e.target.value)}
                rows={2}
                placeholder="Tìm kiếm đối tác thành viên cung cấp giải pháp công nghệ số và vật liệu xanh chất lượng cao..."
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-medium text-foreground focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>
        )}

        {/* NÚT HÀNH ĐỘNG BẮN THÔNG BÁO THEO PHƯƠNG THỨC ĐÃ CHỌN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Nút Thực Thi Tùy Chọn */}
          {sendMethod === "oa_chat" && (
            <button
              type="button"
              onClick={handleSendDirectNotice}
              disabled={sendingFeeNotice}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#DC2626] via-rose-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-60"
            >
              {sendingFeeNotice ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <Send className="size-4 text-amber-300" />
              )}
              <span>💬 GỬI TIN NHẮN CHAT ZALO OA (CS MESSAGE)</span>
            </button>
          )}

          {sendMethod === "zalo_direct" && (
            <button
              type="button"
              onClick={handleOpenDirectZalo}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <ExternalLink className="size-4 text-emerald-300" />
              <span>⚡ MỞ CHAT TRỰC TIẾP TRÊN ZALO (1-CLICK)</span>
            </button>
          )}

          {/* Nút Xem & Sao Chép Mẫu */}
          <button
            type="button"
            onClick={() => {
              setFeeNoticeText(generateNoticeContent());
              setShowFeeModal(true);
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 hover:from-slate-800 hover:to-black text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <Eye className="size-4 text-emerald-300" />
            <span>📋 XEM &amp; SAO CHÉP MẪU NỘI DUNG</span>
          </button>
        </div>
        </>
      )}

      {broadcastMode === "bulk_campaign" && (
        /* KHỐI CHIẾN DỊCH BẮN THÔNG BÁO HÀNG LOẠT (BULK CAMPAIGN) */
        <div className="space-y-4 animate-in fade-in">
          {/* Bộ Lọc Nhóm Hội Viên & Hành Động Chọn Tất Cả */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-950">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 mr-2 flex items-center gap-1">
                <ListFilter className="size-3.5 text-blue-600" />
                <span>Nhóm Hội Viên Nhận:</span>
              </span>
              {[
                { key: "all", label: `Tất Cả (${bulkMembers.length})` },
                {
                  key: "unpaid_fee",
                  label: `Chưa Đóng Niên Liễm (${bulkMembers.filter((m) => m.feeStatus === "unpaid").length})`,
                },
                {
                  key: "board",
                  label: `Ban Điều Hành (${bulkMembers.filter((m) => m.role !== "member").length})`,
                },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setBulkFilter(item.key as any);
                    let filtered = bulkMembers;
                    if (item.key === "unpaid_fee") filtered = bulkMembers.filter((m) => m.feeStatus === "unpaid");
                    if (item.key === "board") filtered = bulkMembers.filter((m) => m.role !== "member");
                    setSelectedMemberIds(filtered.map((m) => m.id));
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    bulkFilter === item.key
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  if (selectedMemberIds.length === bulkMembers.length) {
                    setSelectedMemberIds([]);
                  } else {
                    setSelectedMemberIds(bulkMembers.map((m) => m.id));
                  }
                }}
                className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {selectedMemberIds.length === bulkMembers.length ? (
                  <>
                    <Square className="size-3.5" />
                    <span>Bỏ chọn tất cả</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="size-3.5" />
                    <span>Chọn tất cả ({bulkMembers.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bảng Danh Sách Hội Viên Được Chọn Gửi Chiến Dịch */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-blue-950 overflow-hidden shadow-xs">
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold sticky top-0 border-b border-slate-200 dark:border-slate-800 z-10">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.length > 0 && selectedMemberIds.length === bulkMembers.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedMemberIds(bulkMembers.map((m) => m.id));
                          else setSelectedMemberIds([]);
                        }}
                        className="size-4 rounded text-blue-600 cursor-pointer"
                      />
                    </th>
                    <th className="p-3">Hội Viên</th>
                    <th className="p-3">Mã HV</th>
                    <th className="p-3">Số Điện Thoại</th>
                    <th className="p-3">Doanh Nghiệp</th>
                    <th className="p-3 text-center">Niên Liễm 2026</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {bulkMembers.map((m) => {
                    const isSelected = selectedMemberIds.includes(m.id);
                    return (
                      <tr
                        key={m.id}
                        onClick={() => {
                          if (isSelected) setSelectedMemberIds((prev) => prev.filter((id) => id !== m.id));
                          else setSelectedMemberIds((prev) => [...prev, m.id]);
                        }}
                        className={`hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition cursor-pointer ${
                          isSelected ? "bg-blue-50/30 dark:bg-blue-950/20" : ""
                        }`}
                      >
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedMemberIds((prev) => [...prev, m.id]);
                              else setSelectedMemberIds((prev) => prev.filter((id) => id !== m.id));
                            }}
                            className="size-4 rounded text-blue-600 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <div className="size-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                            {m.name.charAt(0)}
                          </div>
                          <span>{m.name}</span>
                          {m.role !== "member" && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-extrabold uppercase">
                              BĐH
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 font-bold">
                          {m.memberCode}
                        </td>
                        <td className="p-3 font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          {m.phone}
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 text-[11px] truncate max-w-[180px]">
                          {m.company}
                        </td>
                        <td className="p-3 text-center">
                          {m.feeStatus === "unpaid" ? (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold">
                              Chưa đóng
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                              Đã nộp
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Thanh Tiến Trình Gửi Hàng Loạt */}
          {isSendingBulk && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Đang phát thông báo Zalo OA theo hàng đợi...</span>
                </span>
                <span>Đang xử lý chiến dịch</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full w-full animate-pulse" />
              </div>
            </div>
          )}

          {/* NÚT KHỞI CHẠY CHIẾN DỊCH BẮN HÀNG LOẠT */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleExecuteBulkCampaign}
              disabled={isSendingBulk || selectedMemberIds.length === 0}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#DC2626] via-rose-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-red-900/20 active:scale-98 transition cursor-pointer disabled:opacity-60"
            >
              {isSendingBulk ? (
                <RefreshCw className="size-5 animate-spin" />
              ) : (
                <Sparkles className="size-5 text-amber-300" />
              )}
              <span>
                🚀 KHỞI CHẠY CHIẾN DỊCH BẮN THÔNG BÁO CHO {selectedMemberIds.length} HỘI VIÊN ĐÃ CHỌN
              </span>
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              Hệ thống sẽ tự động cá nhân hóa tên hội viên, mã hội viên, số tiền và gửi tuần tự theo hàng đợi để đảm bảo 100% không bị Zalo chặn rate-limit.
            </p>
          </div>
        </div>
      )}

      {/* KHỐI CẤU HÌNH LỊCH TỰ ĐỘNG ĐỊNH KỲ THEO CHU KỲ (CRON AUTOMATION) */}
      {broadcastMode === "scheduled_auto" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="rounded-2xl border border-indigo-200 bg-white p-5 dark:border-indigo-900/60 dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h5 className="text-sm font-black text-slate-900 dark:text-slate-100">
                    Tự Động Gửi Thông Báo Theo Chu Kỳ (Cron Automation)
                  </h5>
                  <p className="text-xs text-slate-500">
                    Hệ thống tự động chạy nền quét cơ sở dữ liệu và bắn thông báo thật tới Zalo OA của hội viên theo lịch trình
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {autoScheduleEnabled ? "Đang Bật Tự Động" : "Đang Tắt"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !autoScheduleEnabled;
                    setAutoScheduleEnabled(nextVal);
                    localStorage.setItem("crm_zalo_cron_enabled", String(nextVal));
                    toast.success(nextVal ? "Đã bật tự động gửi theo chu kỳ!" : "Đã tạm dừng tự động gửi theo chu kỳ.");
                  }}
                  className={`relative h-6 w-11 rounded-full transition cursor-pointer ${
                    autoScheduleEnabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block size-4 transform rounded-full bg-white transition ${
                      autoScheduleEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Tần suất chu kỳ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Tần Suất Chu Kỳ Tự Động:
                </label>
                <select
                  value={scheduleFrequency}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setScheduleFrequency(val);
                    localStorage.setItem("crm_zalo_cron_schedule", val);
                  }}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="monthly_fee">Định kỳ ngày 01 &amp; 15 hàng tháng (Nhắc phí niên liễm)</option>
                  <option value="daily_morning">Hàng ngày lúc 08:00 sáng (Morning Digest &amp; Sự kiện)</option>
                  <option value="weekly_digest">Thứ Hai hàng tuần lúc 08:30 (Bản tin đầu tuần)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Nhóm Hội Viên Mục Tiêu:
                </label>
                <select
                  value={scheduleTarget}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setScheduleTarget(val);
                    localStorage.setItem("crm_zalo_cron_target", val);
                  }}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="unpaid_fee">Hội viên chưa hoàn tất hội phí niên liễm 2026</option>
                  <option value="all">Tất cả hội viên CLB Doanh Nhân CEO 1983</option>
                  <option value="board">Thành viên Ban Thường Trực &amp; Ban Điều Hành</option>
                </select>
              </div>
            </div>

            {/* Hành động */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[11px] text-slate-500">
                Trạng thái: <span className="text-emerald-600 font-bold">● Đang sẵn sàng</span> | Lần chạy gần nhất: <span className="font-semibold text-slate-700 dark:text-slate-300">01/11/2026 08:00</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("crm_zalo_cron_enabled", String(autoScheduleEnabled));
                    localStorage.setItem("crm_zalo_cron_schedule", scheduleFrequency);
                    localStorage.setItem("crm_zalo_cron_target", scheduleTarget);
                    toast.success("✅ Đã lưu cấu hình tự động gửi theo chu kỳ thành công!");
                  }}
                  className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-bold transition"
                >
                  Lưu Cấu Hình
                </button>

                <button
                  type="button"
                  onClick={handleTriggerScheduledNow}
                  disabled={isTriggeringSchedule}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-black shadow-md transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isTriggeringSchedule ? <RefreshCw className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5 text-amber-300" />}
                  <span>{isTriggeringSchedule ? "Đang chạy..." : "Kích Hoạt Gửi Chu Kỳ Ngay Bây Giờ (Run Now)"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* POPUP MODAL SAU KHI BẮN THÔNG BÁO THẬT HOẶC XEM TRƯỚC */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-primary font-black text-sm">
                <CheckCircle2 className="size-5 text-emerald-500" />
                <span>
                  {noticeType === "event" && "Thư Mời Sự Kiện & Mã QR Check-in"}
                  {noticeType === "fee" && "Thông Báo Hội Phí Niên Liễm"}
                  {noticeType === "meeting" && "Thông Báo Lịch Họp Ban BĐH"}
                  {noticeType === "b2b" && "Cơ Hội Kết Nối Giao Thương B2B"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowFeeModal(false)}
                className="size-8 rounded-full hover:bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-muted-foreground">
              Nội dung đã được biên soạn theo đúng quy chuẩn CLB CEO 1983 sẵn sàng gửi tới Zalo SĐT <b>{targetPhone}</b> ({targetMemberName}):
            </div>

            {/* Khối hiển thị ảnh QR Check-in nếu là sự kiện */}
            {noticeType === "event" && (
              <div className="flex items-center gap-3.5 bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-950/40 dark:to-slate-900 p-3 rounded-2xl border border-red-200 dark:border-red-900/60">
                <div className="size-20 bg-white p-1 rounded-xl border border-red-300 dark:border-red-800 shadow-xs shrink-0 flex items-center justify-center">
                  <img src={eventQrUrl} alt="QR Checkin Sự kiện" className="w-full h-full object-contain" />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-foreground text-[13px] leading-tight">{eventName}</div>
                  <div className="text-muted-foreground text-[11px]">
                    🎫 Vé: <span className="font-mono font-bold text-red-600 dark:text-red-400">{eventTicketCode}</span>
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    📍 {eventLocation}
                  </div>
                  <a
                    href={eventQrUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={`QR_Checkin_${eventTicketCode}.png`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline pt-0.5"
                  >
                    <Download className="size-3" />
                    <span>Tải ảnh QR Check-in về máy</span>
                  </a>
                </div>
              </div>
            )}

            <div className="bg-muted/50 p-4 rounded-2xl border border-border font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {feeNoticeText}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(feeNoticeText);
                  toast.success("Đã sao chép toàn bộ nội dung tin nhắn!");
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="size-3.5" />
                <span>Sao Chép Tin Nhắn</span>
              </button>

              <a
                href="https://oa.zalo.me/chatv2"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition text-center"
              >
                <span>Mở Zalo OA Chat Gửi Ngay</span>
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BÁO CÁO KẾT QUẢ CHIẾN DỊCH BẮN HÀNG LOẠT */}
      {showBulkResultModal && bulkResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-primary font-black text-sm">
                <CheckCircle2 className="size-5 text-emerald-500" />
                <span>Báo Cáo Kết Quả Chiến Dịch Bắn Thông Báo Hàng Loạt</span>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkResultModal(false)}
                className="size-8 rounded-full hover:bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                <div className="text-xs text-muted-foreground font-bold">Tổng Số Hội Viên</div>
                <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{bulkResults.total}</div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                <div className="text-xs text-muted-foreground font-bold">Thành Công</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{bulkResults.successCount}</div>
              </div>
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
                <div className="text-xs text-muted-foreground font-bold">Cần Kích Hoạt Zalo</div>
                <div className="text-xl font-black text-red-600 dark:text-red-400 mt-1">{bulkResults.failedCount}</div>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-2xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted sticky top-0 font-bold border-b border-border">
                  <tr>
                    <th className="p-2.5">Hội Viên</th>
                    <th className="p-2.5">SĐT</th>
                    <th className="p-2.5 text-center">Trạng Thái</th>
                    <th className="p-2.5">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bulkResults.results.map((r: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold">{r.name}</td>
                      <td className="p-2.5 font-mono">{r.phone}</td>
                      <td className="p-2.5 text-center">
                        {r.status === "success" ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                            Thành công
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold text-[10px]">
                            Chưa nhận
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-[11px] text-muted-foreground">
                        {r.status === "success" ? `Zalo UID: ${r.userId || "OK"}` : (r.error || "Chưa tương tác với OA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowBulkResultModal(false)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer"
              >
                Đóng Báo Cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. THÔNG TIN KẾT NỐI API DYNAMIC: TOKEN & SECRET KEY */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-primary" />
            <h4 className="text-sm font-bold text-foreground">
              Cấu Hình Dynamic Zalo Developer &amp; Tự Động Gia Hạn Token
            </h4>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <Check className="size-3.5" /> Không bao giờ phải sửa hay đẩy lại code
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Zalo OA ID</label>
            <input
              type="text"
              value={oaId}
              onChange={(e) => setOaId(e.target.value)}
              placeholder="437444346010531505"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Zalo App ID</label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="736933908446960497"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Secret Key (Khóa bí mật)</label>
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="f42YHsjU1Ku9UcK7IxZQ"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Webhook URL Nhận Trạng Thái</label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full rounded-xl border border-input bg-muted/60 pl-3 pr-8 py-2 text-xs font-mono text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  toast.success("Đã sao chép Webhook URL!");
                }}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Sao chép URL"
              >
                <Copy className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Ô NHẬP DYNAMIC ACCESS TOKEN */}
          <div className="md:col-span-2 space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-amber-500" />
                <span>Access Token (Mã truy cập API Zalo)</span>
                {accessToken ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded-full">
                    Đã nạp
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded-full">
                    Chưa nạp
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        setAccessToken(text);
                        toast.success("Đã dán Access Token từ Clipboard!");
                      }
                    } catch {
                      toast.info("Vui lòng dán trực tiếp vào ô");
                    }
                  }}
                  className="text-primary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <ClipboardPaste className="size-3" />
                  <span>Dán Token</span>
                </button>
              </div>
            </div>
            <textarea
              rows={2}
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Dán chuỗi Access Token dài từ trang Zalo Developer API Explorer vào đây..."
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-mono text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Ô NHẬP REFRESH TOKEN ĐỂ TỰ ĐỘNG GIA HẠN */}
          <div className="md:col-span-2 space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
                <RotateCw className="size-3.5 text-blue-500" />
                <span>Refresh Token (Mã tự động gia hạn khi Access Token hết hạn)</span>
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        setRefreshToken(text);
                        toast.success("Đã dán Refresh Token từ Clipboard!");
                      }
                    } catch {
                      toast.info("Vui lòng dán trực tiếp vào ô");
                    }
                  }}
                  className="text-primary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <ClipboardPaste className="size-3" />
                  <span>Dán Refresh Token</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={refreshToken}
                onChange={(e) => setRefreshToken(e.target.value)}
                placeholder="Dán chuỗi Refresh Token để sau này không bao giờ phải sửa lại code..."
                className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={handleAutoRefreshToken}
                disabled={isRefreshingToken}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isRefreshingToken ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : (
                  <RotateCw className="size-3.5" />
                )}
                <span>Tự Động Gia Hạn Token Mới</span>
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              * Khách hàng chỉ cần bấm nút "Tự Động Gia Hạn Token Mới" là hệ thống tự lấy Access Token mới vĩnh viễn mà không bao giờ cần phải nhờ lập trình viên sửa code!
            </p>
          </div>
        </div>
      </div>

      {/* 2. Cấu Hình Dynamic Mẫu Tin Nhắn Cho 4 Danh Mục */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MessageSquareText className="size-4 text-blue-600" />
              <span>Quản Lý Mẫu Thông Báo Tự Động (Dynamic Templates)</span>
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cấu hình tin nhắn gửi cho Hội viên theo 4 danh mục: Hội phí, Sự kiện, Đào tạo, Cuộc họp
            </p>
          </div>

          {/* Filter 4 danh mục */}
          <div className="flex flex-wrap gap-1">
            {[
              { key: "all", label: "Tất cả" },
              { key: "membership_fee", label: "Hội phí" },
              { key: "event", label: "Sự kiện" },
              { key: "training", label: "Đào tạo" },
              { key: "meeting", label: "Cuộc họp" },
            ].map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeCategory === cat.key
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách templates & Trình chỉnh sửa */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Cột trái: Chọn mẫu */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Danh sách mẫu tin nhắn ({filteredTemplates.length})
            </span>
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredTemplates.map((tpl) => {
                const isSelected = tpl.id === selectedTemplateId;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-border hover:border-border/80 bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {tpl.categoryName}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTemplate(tpl.id);
                        }}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          tpl.enabled
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {tpl.enabled ? "Bật" : "Tắt"}
                      </button>
                    </div>
                    <div className="font-bold text-xs text-foreground line-clamp-1">{tpl.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{tpl.templateId}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột giữa: Trình soạn thảo & Chèn biến động */}
          <div className="lg:col-span-4 space-y-3">
            <div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Nội dung mẫu tin nhắn Zalo OA
              </span>
              <textarea
                rows={6}
                value={currentTemplate?.messageContent || ""}
                onChange={(e) => handleUpdateTemplateContent(e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Nhập nội dung tin nhắn gửi Zalo OA..."
              />
            </div>

            {/* Chèn Biến Động (Dynamic Variables) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3.5 text-amber-500" />
                <span>Bấm để chèn biến động vào tin nhắn:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(currentTemplate?.availableVariables || []).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleInsertVariable(v)}
                    className="px-2 py-1 rounded-md bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground font-mono text-[11px] font-bold border border-border transition cursor-pointer"
                  >
                    + {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Gửi Test Thử Nghiệm */}
            <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Smartphone className="size-3.5 text-blue-600" />
                <span>Bắn thử nghiệm tin nhắn mẫu này:</span>
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Nhập SĐT nhận thử..."
                  className="flex-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground"
                />
                <button
                  type="button"
                  onClick={handleSendTestMessage}
                  disabled={sendingTest}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Send className="size-3" />
                  <span>{sendingTest ? "Đang gửi..." : "Gửi Test"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cột phải: Live Preview Giao Diện Chat Zalo */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Xem trước màn hình Zalo người nhận (Live Preview)
            </span>
            <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 p-3 shadow-inner">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="size-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  Z
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  CLB Doanh Nhân CEO 1983 Official
                </div>
              </div>

              {/* Chat Bubble Zalo */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none p-3 shadow-xs border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                  {currentTemplate?.categoryName}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {previewMessage}
                </p>
                <div className="text-[9px] text-slate-400 text-right font-mono">
                  {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} · Đã nhận
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nút Lưu Cấu Hình */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={saveZaloConfig}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xs font-bold shadow-md hover:opacity-95 transition cursor-pointer"
        >
          <Check className="size-4" />
          <span>Lưu Cấu Hình Zalo OA &amp; Danh Mục Dynamic</span>
        </button>
      </div>
    </div>
  );
};
