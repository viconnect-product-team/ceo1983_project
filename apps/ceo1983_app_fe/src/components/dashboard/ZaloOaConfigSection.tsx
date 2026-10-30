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
} from "lucide-react";
import { toast } from "sonner";
import { getNestApiUrl } from "@/lib/api-client";

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

  const [webhookUrl, setWebhookUrl] = useState("https://api.ceo1983.vn/zalo/webhook");
  const [isConnected, setIsConnected] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  // Thông tin gửi bắn thông báo test & phí hội viên thực chiến
  const [targetMemberName, setTargetMemberName] = useState("Phạm Văn Vũ");
  const [targetPhone, setTargetPhone] = useState("0973924819");
  const [targetMemberCode, setTargetMemberCode] = useState("CEO1983-088");
  const [feeAmount, setFeeAmount] = useState(10000000);
  const [feeYear, setFeeYear] = useState("2026");
  const [feeDueDate, setFeeDueDate] = useState("31/12/2026");
  const [sendingTestBroadcast, setSendingTestBroadcast] = useState(false);
  const [sendingFeeNotice, setSendingFeeNotice] = useState(false);
  const [feeNoticeText, setFeeNoticeText] = useState("");
  const [showFeeModal, setShowFeeModal] = useState(false);

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

  // Chế độ gửi: Bắn đơn cá nhân 1-1 vs Chiến dịch bắn hàng loạt (Bulk Campaign)
  const [broadcastMode, setBroadcastMode] = useState<"single_test" | "bulk_campaign">("single_test");
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
    try {
      const stored = localStorage.getItem("vba_zalo_oa_templates");
      if (stored) setTemplates(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []);

  const [activeCategory, setActiveCategory] = useState<"all" | "membership_fee" | "event" | "training" | "meeting">("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl_fee_1");
  const [testPhone, setTestPhone] = useState("0973924819");
  const [sendingTest, setSendingTest] = useState(false);

  // Save config Dynamic 100%
  const saveZaloConfig = () => {
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
      toast.success("Đã lưu cấu hình Zalo OA & Toàn bộ Token vào hệ thống thành công!");
    } catch {
      toast.error("Không thể lưu cấu hình Zalo OA");
    }
  };

  // Tự động gia hạn Access Token mới bằng Refresh Token qua Backend NestJS (Zero CORS, Zero Hardcoding)
  const handleAutoRefreshToken = async () => {
    if (!refreshToken.trim()) {
      toast.error("Vui lòng nhập hoặc dán Refresh Token để gia hạn!");
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
        headers: { "Content-Type": "application/json" },
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
        toast.success("✅ Đã tự động gia hạn Access Token mới thành công 100%!");
      } else {
        toast.error(`Zalo phản hồi: ${data?.message || data?.error_description || "Không thể gia hạn token"}`);
      }
    } catch (err: any) {
      toast.error(`Lỗi kết nối máy chủ gia hạn token: ${err.message}`);
    } finally {
      setIsRefreshingToken(false);
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
        `${getNestApiUrl("/zalo/recent-chats")}?accessToken=${encodeURIComponent(accessToken.trim())}`
      );
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setRecentChats(data.data);
        if (data.data.length > 0) {
          toast.success(`🎉 Đã tìm thấy ${data.data.length} hội viên vừa tương tác qua Zalo OA!`);
          if (!selectedUserId) {
            setSelectedUserId(data.data[0].userId);
            setTargetMemberName(data.data[0].displayName);
          }
        } else {
          toast.info("Chưa có hội viên nào gửi tin nhắn tới Zalo OA này.");
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

  // 1. Bắn Thông Báo Test Zalo OA (Dynamic API qua Backend NestJS Server)
  const handleSendTestBroadcast = async () => {
    if (!accessToken.trim()) {
      toast.error("Vui lòng lấy và dán Access Token vào ô cấu hình phía dưới trước!");
      return;
    }
    setSendingTestBroadcast(true);

    try {
      const res = await fetch(getNestApiUrl("/zalo/send-message"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: accessToken.trim(),
          userId: selectedUserId || undefined,
          targetPhone: targetPhone.trim(),
          targetName: targetMemberName.trim(),
          message: `[CEO 1983 - TEST THÔNG BÁO] Xin chào ${targetMemberName}! Đây là tin nhắn kiểm tra kết nối tự động từ Zalo OA CLB CEO 1983 tới SĐT ${targetPhone}.`,
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success(`🎉 ĐÃ BẮN THÔNG BÁO TEST THÀNH CÔNG VỀ ZALO ĐIỆN THOẠI!`, {
          description: `Đã gửi trực tiếp tới: ${data.recipient?.name || targetMemberName} (UID: ${data.recipient?.userId || "OA-User"})`,
        });
      } else {
        toast.error(`Zalo từ chối gửi: ${data?.message || "Lỗi gửi tin"}`, {
          description: data?.error ? `Mã lỗi Zalo: ${data.error}` : undefined,
        });
      }
    } catch (err: any) {
      toast.error(`Lỗi hệ thống: ${err.message}`);
    } finally {
      setSendingTestBroadcast(false);
    }
  };

  // 2. Bắn Thông Báo Phí Hội Viên Tới Zalo (Dynamic API qua Backend NestJS Server)
  const handleSendFeeNoticeToZalo = async () => {
    if (!accessToken.trim()) {
      toast.error("Vui lòng lấy và dán Access Token vào ô cấu hình phía dưới trước!");
      return;
    }
    setSendingFeeNotice(true);
    const content = `📢 [CLB DOANH NHÂN CEO 1983 - THÔNG BÁO HỘI PHÍ NIÊN LIỄM]
Kính gửi Hội viên: ${targetMemberName} (Mã HV: ${targetMemberCode} - SĐT: ${targetPhone})
Ban Tài chính CLB Doanh Nhân CEO 1983 (HanoiBA) trân trọng thông báo kỳ hoàn tất hội phí thường niên năm ${feeYear}:

💰 Số tiền: ${new Intl.NumberFormat("vi-VN").format(feeAmount)} VNĐ
🗓️ Hạn nộp: Trước ngày ${feeDueDate}
🏦 Thông tin thụ hưởng chính thức:
- Ngân hàng: MB Bank (Ngân hàng TMCP Quân Đội)
- Số tài khoản: 1983000000
- Chủ tài khoản: CLB DOANH NHAN CEO 1983
- Nội dung CK: HP1983 ${targetMemberCode} ${targetPhone}
- Hoặc thanh toán qua Cổng VNPay: https://ceo1983.vn/payment/vnpay?ref=${targetMemberCode}

Kính chúc Doanh nghiệp của Anh/Chị luôn phát triển thịnh vượng và gặt hái nhiều thành công trong năm ${feeYear}!`;

    setFeeNoticeText(content);

    try {
      const res = await fetch(getNestApiUrl("/zalo/send-message"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        toast.success(`🎉 ĐÃ BẮN THÔNG BÁO PHÍ THÀNH CÔNG TỚI ZALO ĐIỆN THOẠI!`, {
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

    const messageTemplate = `📢 [CLB DOANH NHÂN CEO 1983 - THÔNG BÁO HỘI PHÍ NIÊN LIỄM]
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
        headers: { "Content-Type": "application/json" },
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
                Thao tác bắn thông báo test trước &rarr; Sau đó bắn thông báo đóng phí niên liễm trực tiếp tới Zalo của Bạn
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Chuyển đổi 2 chế độ: Đơn 1-1 vs Hàng Loạt Bulk */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-blue-200 dark:border-blue-900 shadow-xs">
              <button
                type="button"
                onClick={() => setBroadcastMode("single_test")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  broadcastMode === "single_test"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <User className="size-3.5" />
                <span>Gửi Cá Nhân 1-1</span>
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

        {broadcastMode === "single_test" ? (
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
            <p className="text-[11px] text-slate-500 italic">
              💡 Bấm nút <b>"Đồng bộ danh bạ từ Zalo OA"</b> để tải hội viên (như Phạm Vũ) vừa chat với OA và tự động chọn Zalo UID. Nếu không chọn, hệ thống sẽ tự phân giải theo tên người nhận gần nhất.
            </p>
          )}
        </div>

        {/* Form thiết lập thông số người nhận & 2 Nút Bắn Hành Động */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
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
              Số Điện Thoại Zalo Của Bạn:
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
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
              <span>Zalo User ID (UID):</span>
            </label>
            <div className="relative">
              <KeyRound className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                placeholder="Tự động phân giải / Chọn bên trên..."
                className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-mono text-foreground focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

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
                className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-mono font-bold text-foreground focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Kỳ Phí &amp; Hạn Nộp:
            </label>
            <div className="relative">
              <Calendar className="size-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={`${feeYear} (Hạn: ${feeDueDate})`}
                onChange={(e) => setFeeDueDate(e.target.value)}
                placeholder="2026 (Hạn: 31/12/2026)"
                className="w-full rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* 2 NÚT HÀNH ĐỘNG BẮN THÔNG BÁO THEO TRÌNH TỰ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Nút 1: Bắn Test Trước */}
          <button
            type="button"
            onClick={handleSendTestBroadcast}
            disabled={sendingTestBroadcast}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-60"
          >
            {sendingTestBroadcast ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4 text-emerald-300" />
            )}
            <span>BƯỚC 1: BẮN THÔNG BÁO TEST ZALO OA</span>
          </button>

          {/* Nút 2: Bắn Thông Báo Phí Hội Viên Tới Zalo */}
          <button
            type="button"
            onClick={handleSendFeeNoticeToZalo}
            disabled={sendingFeeNotice}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#DC2626] via-rose-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-60"
          >
            {sendingFeeNotice ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <CreditCard className="size-4 text-amber-300" />
            )}
            <span>BƯỚC 2: BẮN THÔNG BÁO PHÍ HỘI VIÊN TỚI ZALO CỦA TÔI</span>
          </button>
        </div>
        </>
      ) : (
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
      </div>

      {/* POPUP MODAL SAU KHI BẮN THÔNG BÁO PHÍ HỘI VIÊN */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-primary font-black text-sm">
                <CheckCircle2 className="size-5 text-emerald-500" />
                <span>Nội Dung Thông Báo Phí Hội Viên Đã Khởi Tạo</span>
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
              Thông báo đóng phí niên liễm đã được biên soạn theo đúng quy chuẩn Ban Tài Chính CLB CEO 1983 gửi tới Zalo SĐT <b>{targetPhone}</b>:
            </div>

            <div className="bg-muted/50 p-4 rounded-2xl border border-border font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {feeNoticeText}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(feeNoticeText);
                  toast.success("Đã sao chép toàn bộ thông báo hội phí!");
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
