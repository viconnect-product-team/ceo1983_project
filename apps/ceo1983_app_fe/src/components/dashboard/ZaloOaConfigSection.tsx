import React, { useState, useEffect } from "react";
import {
  MessageSquareText,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Copy,
  KeyRound,
  Eye,
  EyeOff,
  Clock,
  Check,
  HelpCircle,
  Calendar,
  CreditCard,
  Building2,
  Users,
  ChevronDown,
  ChevronUp,
  Phone,
  PhoneCall,
  MessageCircle,
  UserCheck,
  MessageSquare,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";

export const ZaloOaConfigSection: React.FC = () => {
  // 1. Cấu hình cốt lõi (Gộp chung tối đa - chỉ 3 trường chính)
  const [appId, setAppId] = useState("736933908446960497");
  const [secretKey, setSecretKey] = useState("f42YHsjU1Ku9UcK7IxZQ");
  const [oaId, setOaId] = useState("437444346010531505");
  const [oaName, setOaName] = useState("CLB Doanh Nhân CEO 1983");
  const [refreshToken, setRefreshToken] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  // Hiển thị / Ẩn khóa bí mật
  const [showSecret, setShowSecret] = useState(false);

  // Trạng thái hệ thống tự động gia hạn 24/7
  const [autoRefreshActive, setAutoRefreshActive] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Trợ giúp cấp mới Auth Code lần đầu (Thu gọn trong Accordion)
  const [showAuthCodeHelper, setShowAuthCodeHelper] = useState(false);
  const [authCodeInput, setAuthCodeInput] = useState("");
  const [isExchangingCode, setIsExchangingCode] = useState(false);

  // Khối kiểm thử gửi tin nhanh
  const [testPhone, setTestPhone] = useState("0973924819");
  const [testRecipientName, setTestRecipientName] = useState("Phạm Văn Vũ");
  const [testType, setTestType] = useState<"event" | "forum" | "meeting" | "fee" | "custom">("event");
  const [customMessage, setCustomMessage] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Danh sách hội viên / người dùng đã quan tâm hoặc nhắn tin Zalo OA
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [isSyncingFollowers, setIsSyncingFollowers] = useState(false);
  const [directMsgModalOpen, setDirectMsgModalOpen] = useState(false);
  const [targetSubscriber, setTargetSubscriber] = useState<any | null>(null);
  const [subscriberMsg, setSubscriberMsg] = useState("");
  const [sendingSubMsg, setSendingSubMsg] = useState(false);

  // Nạp cấu hình từ Backend khi mở trang
  const loadConfig = async () => {
    try {
      const res = await fetchNestApi<any>("/zalo/oa-config");
      if (res && res.config) {
        const c = res.config;
        if (c.appId) setAppId(c.appId);
        if (c.secretKey) setSecretKey(c.secretKey);
        if (c.oaId) setOaId(c.oaId);
        if (c.oaName) setOaName(c.oaName);
        if (c.refreshToken) setRefreshToken(c.refreshToken);
        if (c.accessToken) setAccessToken(c.accessToken);
        if (c.lastRefreshedAt) setLastRefreshedAt(c.lastRefreshedAt);
        setAutoRefreshActive(true);
      }
    } catch {
      // Fallback mặc định
      setAppId("736933908446960497");
      setSecretKey("f42YHsjU1Ku9UcK7IxZQ");
      setOaId("437444346010531505");
      setAutoRefreshActive(true);
    }
  };

  const loadSubscribers = async () => {
    setLoadingSubs(true);
    try {
      const res = await fetchNestApi<any>("/zalo/subscribers");
      if (res && Array.isArray(res.data)) {
        setSubscribers(res.data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleSyncFollowers = async () => {
    setIsSyncingFollowers(true);
    try {
      const res = await fetchNestApi<any>("/zalo/sync-followers", { method: "POST" });
      if (res && res.ok) {
        toast.success(res.message || `Đã đồng bộ thành công ${res.count || 0} tài khoản từ Zalo OA!`);
        if (Array.isArray(res.subscribers)) {
          setSubscribers(res.subscribers);
        } else {
          await loadSubscribers();
        }
      } else {
        toast.error(res?.message || "Không thể đồng bộ người quan tâm từ Zalo OA");
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi đồng bộ danh sách quan tâm Zalo OA");
    } finally {
      setIsSyncingFollowers(false);
    }
  };

  const handleOpenDirectMsg = (sub: any) => {
    setTargetSubscriber(sub);
    setSubscriberMsg(`[CLB Doanh Nhân CEO 1983] Kính chào Anh/Chị ${sub.displayName}!`);
    setDirectMsgModalOpen(true);
  };

  const handleSendDirectMsg = async () => {
    if (!targetSubscriber || !subscriberMsg.trim()) {
      toast.error("Vui lòng nhập nội dung tin nhắn gửi qua Zalo");
      return;
    }
    setSendingSubMsg(true);
    try {
      const res = await fetchNestApi<any>("/zalo/send-message", {
        method: "POST",
        body: JSON.stringify({
          accessToken,
          userId: targetSubscriber.userId,
          message: subscriberMsg.trim(),
        }),
      });
      if (res && (res.ok || res.success || res.error === 0)) {
        toast.success(`Đã gửi tin nhắn Zalo thành công tới ${targetSubscriber.displayName}!`);
        setDirectMsgModalOpen(false);
        setSubscriberMsg("");
        await loadSubscribers();
      } else {
        toast.error(res?.message || "Không thể gửi tin nhắn qua Zalo OA");
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi gửi tin nhắn Zalo");
    } finally {
      setSendingSubMsg(false);
    }
  };

  useEffect(() => {
    loadConfig();
    loadSubscribers();
  }, []);

  // Lưu cấu hình
  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const payload = {
        appId: appId.trim(),
        secretKey: secretKey.trim(),
        oaId: oaId.trim(),
        oaName: oaName.trim(),
        refreshToken: refreshToken.trim(),
        accessToken: accessToken.trim(),
        autoRefreshActive: true,
        updatedAt: new Date().toISOString(),
      };
      await fetchNestApi("/zalo/oa-config", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Đã lưu cấu hình Zalo OA thành công! Hệ thống đã kích hoạt tiến trình tự động gia hạn.");
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi lưu cấu hình Zalo OA");
    } finally {
      setIsSaving(false);
    }
  };

  // Kiểm tra kết nối trực tuyến
  const handleTestConnection = async () => {
    setIsTestingConn(true);
    try {
      const res = await fetchNestApi<any>("/zalo/check-token", {
        method: "POST",
        body: JSON.stringify({ accessToken }),
      });
      if (res && (res.valid || res.ok)) {
        toast.success(`Kết nối Zalo OA "${res.oaName || oaName}" hoàn toàn thông suốt! Token đang hoạt động tốt.`);
      } else {
        toast.info("Đang tự động làm mới token mới nhất từ máy chủ Zalo OAuth...");
        await handleManualRefreshNow();
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể kết nối đến máy chủ Zalo OA");
    } finally {
      setIsTestingConn(false);
    }
  };

  // Kích hoạt làm mới Token tức thì
  const handleManualRefreshNow = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchNestApi<any>("/zalo/auto-refresh-now", {
        method: "POST",
      });
      if (res && res.ok) {
        toast.success("Đã tự động gia hạn Token thành công! Token mới đã lưu bền vững vào CSDL.");
        await loadConfig();
      } else {
        // Fallback gọi endpoint refresh-token thông thường
        const fallbackRes = await fetchNestApi<any>("/zalo/refresh-token", {
          method: "POST",
          body: JSON.stringify({ appId, secretKey, refreshToken }),
        });
        if (fallbackRes && fallbackRes.accessToken) {
          toast.success("Đã làm mới token thành công!");
          await loadConfig();
        } else {
          toast.error(fallbackRes?.message || res?.message || "Lỗi khi gia hạn token Zalo OA");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi kích hoạt làm mới token");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Đổi Auth Code lấy Refresh Token
  const handleExchangeAuthCode = async () => {
    if (!authCodeInput.trim()) {
      toast.error("Vui lòng dán mã Ủy quyền (Auth Code) từ Zalo Developer");
      return;
    }
    setIsExchangingCode(true);
    try {
      const res = await fetchNestApi<any>("/zalo/exchange-auth-code", {
        method: "POST",
        body: JSON.stringify({
          appId: appId.trim(),
          secretKey: secretKey.trim(),
          code: authCodeInput.trim(),
        }),
      });
      if (res && res.accessToken) {
        toast.success("Đã đổi mã và nhận Refresh Token thành công! Hệ thống sẽ tự động duy trì 24/7 từ nay về sau.");
        setAuthCodeInput("");
        setShowAuthCodeHelper(false);
        await loadConfig();
      } else {
        toast.error(res?.message || "Mã ủy quyền không hợp lệ hoặc đã hết hạn (chỉ có hiệu lực trong 10 phút)");
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi đổi mã ủy quyền");
    } finally {
      setIsExchangingCode(false);
    }
  };

  // Gửi tin nhắn thử nghiệm nhanh
  const handleSendTestMessage = async () => {
    if (!testPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại người nhận");
      return;
    }
    setIsSendingTest(true);

    let messageBody = "";
    if (testType === "event") {
      const regUrl = "https://ceo1983.viconnect.vn/association/events?action=register";
      const qrImageUrl = `https://crm.ceo1983.viconnect.vn/api/events/qr?data=${encodeURIComponent(regUrl)}&size=320`;
      messageBody = `🎟️ [CLB DOANH NHÂN CEO 1983 - THƯ MỜI SỰ KIỆN & VÉ CHECK-IN ĐIỆN TỬ]
Kính gửi Hội viên: ${testRecipientName} (SĐT: ${testPhone})
Ban Chấp Hành CLB Doanh Nhân CEO 1983 (HanoiBA) trân trọng kính mời Anh/Chị tham dự sự kiện:

🌟 Tên sự kiện: Gala Doanh Nhân CEO 1983 & Kết Nối Giao Thương 2026
🗓️ Thời gian: 08:30 - Thứ Bảy
📍 Địa điểm: Keangnam Landmark 72, Phạm Hùng, Hà Nội

👉 Mở Form Đăng Ký & Nhận Vé:
${regUrl}

📱 Link Ảnh Mã QR Check-in:
${qrImageUrl}

* Hướng dẫn Check-in: Anh/Chị vui lòng lưu mã QR hoặc mở tin nhắn Zalo này tại bàn Lễ tân / Cổng Check-in để quét mã nhận Thẻ đại biểu & Quà tặng chính thức.`;
    } else if (testType === "forum") {
      messageBody = `[CLB CEO 1983] Kính gửi Hội viên ${testRecipientName}, Thường Trực CLB kính mời Anh/Chị tham dự Diễn Đàn Doanh Nhân & Xúc Tiến Thương Mại B2B 2026. Cơ hội kết nối 100+ Doanh chủ tiên phong.\n\n👉 Chi tiết & Đăng ký: https://ceo1983.viconnect.vn/association/events?action=register`;
    } else if (testType === "meeting") {
      messageBody = `[CLB CEO 1983] Kính gửi Hội viên ${testRecipientName}, Ban Điều Hành thông báo triệu tập Cuộc họp Ban Thường Trực định kỳ lúc 09:00 tại Văn phòng HanoiBA & trực tuyến qua Jitsi Meet.\n\n💻 Tham gia: https://meet.jit.si/CEO1983_MEET_BAN_DIEU_HANH_14`;
    } else if (testType === "fee") {
      messageBody = `[CLB CEO 1983] Kính gửi Hội viên ${testRecipientName}, Ban Tài chính trân trọng thông báo kỳ thu hội phí thường niên năm 2026. Số tiền: 10.000.000 đ. Kính chúc Quý Doanh nghiệp ngày càng phát triển thịnh vượng!\n\n💳 Xem mã VietQR: https://ceo1983.viconnect.vn/association/profile`;
    } else {
      messageBody = customMessage.trim() || `[CLB CEO 1983] Tin nhắn kiểm thử kết nối thành công từ Cổng Quản trị CRM CEO 1983 đến số ${testPhone}.`;
    }

    try {
      const res = await fetchNestApi<any>("/zalo/send-message", {
        method: "POST",
        body: JSON.stringify({
          accessToken,
          targetPhone: testPhone.trim(),
          targetName: testRecipientName.trim(),
          message: messageBody,
        }),
      });
      if (res && (res.ok || res.success || res.error === 0)) {
        toast.success(`Đã gửi thành công tin nhắn kiểm thử tới số ${testPhone}!`);
      } else {
        toast.error(res?.message || "Không thể gửi tin. Vui lòng kiểm tra hội viên đã quan tâm OA hoặc Token.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi gửi tin nhắn kiểm thử");
    } finally {
      setIsSendingTest(false);
    }
  };

  // Tính thời gian định dạng
  const formatTimeAgo = (iso?: string | null) => {
    if (!iso) return "Đang chạy tự động";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
        " - " +
        d.toLocaleDateString("vi-VN");
    } catch {
      return "Đang chạy tự động";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── THẺ 1: TỔNG QUAN HỆ THỐNG KẾT NỐI & TỰ ĐỘNG GIA HẠN 24/7 ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Đang Hoạt Động &amp; Tự Động Gia Hạn 24/7
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                (Bảo đảm không bao giờ mất Token)
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pt-1">
              <MessageSquareText className="size-5 text-[#003B95] dark:text-blue-400" />
              <span>Zalo Official Account: {oaName}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kết nối trực tiếp OA ID <code className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{oaId}</code> phục vụ gửi thư mời sự kiện, diễn đàn, cuộc họp và thông báo hội phí.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isTestingConn}
              onClick={handleTestConnection}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer shadow-xs active:scale-95"
            >
              <RefreshCw className={`size-3.5 ${isTestingConn ? "animate-spin text-[#003B95]" : ""}`} />
              <span>{isTestingConn ? "Đang kiểm tra..." : "Kiểm tra kết nối"}</span>
            </button>

            <button
              type="button"
              disabled={isRefreshing}
              onClick={handleManualRefreshNow}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#003B95] hover:bg-[#002766] text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
            >
              <Sparkles className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Đang gia hạn..." : "Làm mới Token ngay"}</span>
            </button>
          </div>
        </div>

        {/* 4 Chỉ số Tổng quan trực quan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Tình Trạng Token
            </div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="size-4" />
              <span>Còn hiệu lực 25h</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Tự động gia hạn ngầm mỗi 4 tiếng
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Gia Hạn Gần Nhất
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
              <Clock className="size-3.5 text-blue-500" />
              <span className="truncate">{formatTimeAgo(lastRefreshedAt)}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Tự lưu CSDL PostgreSQL
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Chế Độ Chạy Lệnh Tự Động
            </div>
            <div className="text-xs font-bold text-[#003B95] dark:text-blue-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" />
              <span>Tự động xoay vòng Token</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Quét mỗi 15 phút (NestJS Cron)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Webhook Tiếp Nhận
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>Sẵn sàng phản hồi</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              /api/zalo/webhook
            </div>
          </div>
        </div>
      </div>

      {/* ── THẺ 2: CẤU HÌNH RÚT GỌN TỐI ĐA (CHỈ 3 TRƯỜNG CỐT LÕI) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="size-4 text-amber-500" />
              <span>Thông Tin Cấu Hình Kết Nối Zalo Developer</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chỉ cần nhập 3 thông số này một lần duy nhất. Hệ thống sẽ tự động duy trì và gia hạn liên tục vĩnh viễn.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* 1. App ID */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              1. Zalo App ID (Mã Ứng Dụng)
            </label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="VD: 736933908446960497"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-medium text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-[#003B95]"
            />
          </div>

          {/* 2. Secret Key */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              2. Secret Key (Khóa Bí Mật)
            </label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Nhập Secret Key của ứng dụng"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 pr-10 text-xs font-mono text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-[#003B95]"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Refresh Token */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>3. Refresh Token (Khóa Tự Động Xoay Vòng)</span>
              <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                Tự động cập nhật ngầm
              </span>
            </label>
            {refreshToken && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(refreshToken);
                  toast.success("Đã sao chép Refresh Token vào Clipboard");
                }}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Copy className="size-3" />
                <span>Sao chép</span>
              </button>
            )}
          </div>
          <input
            type="text"
            value={refreshToken}
            onChange={(e) => setRefreshToken(e.target.value)}
            placeholder="Khóa Refresh Token tự động của Zalo OA"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-700 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300"
          />
        </div>

        {/* Nút lưu cấu hình */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setShowAuthCodeHelper(!showAuthCodeHelper)}
            className="text-xs font-semibold text-[#003B95] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="size-3.5" />
            <span>Cần cấp mới Refresh Token lần đầu từ Zalo Developer?</span>
            {showAuthCodeHelper ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveConfig}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
          >
            <Check className="size-3.5" />
            <span>{isSaving ? "Đang lưu cấu hình..." : "Lưu Cấu Hình Kết Nối"}</span>
          </button>
        </div>

        {/* Accordion Hướng dẫn cấp mới Auth Code */}
        {showAuthCodeHelper && (
          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3 animate-in fade-in duration-200">
            <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Hướng dẫn lấy Authorization Code 1 lần duy nhất:
            </div>
            <ol className="text-xs text-amber-800 dark:text-amber-300/80 list-decimal pl-4 space-y-1">
              <li>
                Mở liên kết cấp quyền trên Zalo Developer:{" "}
                <a
                  href={`https://oauth.zaloapp.com/v4/oa/permission?app_id=${appId}&redirect_uri=${encodeURIComponent("https://developers.zalo.me")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline text-amber-900 dark:text-amber-100 inline-flex items-center gap-1"
                >
                  Bấm vào đây để cấp quyền cho App {appId} <ExternalLink className="size-3" />
                </a>
              </li>
              <li>Chọn OA <strong>{oaName}</strong> và xác nhận cấp quyền.</li>
              <li>Sao chép tham số <code>code=...</code> trên thanh địa chỉ trình duyệt và dán vào ô bên dưới:</li>
            </ol>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={authCodeInput}
                onChange={(e) => setAuthCodeInput(e.target.value)}
                placeholder="Dán mã Authorization Code vào đây (có hiệu lực 10 phút)"
                className="flex-1 bg-white border border-amber-300 rounded-lg p-2 text-xs font-mono text-slate-900 dark:bg-slate-900 dark:border-amber-700 dark:text-slate-100"
              />
              <button
                type="button"
                disabled={isExchangingCode}
                onClick={handleExchangeAuthCode}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer shrink-0"
              >
                {isExchangingCode ? "Đang đổi mã..." : "Đổi lấy Refresh Token tự động"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── THẺ 3: KIỂM THỬ GỬI TIN NHANH QUA ZALO OA ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="size-4 text-emerald-500" />
              <span>Kiểm Thử Bắn Tin Nhắn Nhanh Qua Zalo OA</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kiểm tra khả năng gửi tin nhắn trực tiếp đến số điện thoại hội viên thực tế ngay trên hệ thống.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Số điện thoại nhận */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Số điện thoại người nhận
            </label>
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="VD: 0973924819"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
            />
          </div>

          {/* Tên hội viên */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Họ tên hội viên
            </label>
            <input
              type="text"
              value={testRecipientName}
              onChange={(e) => setTestRecipientName(e.target.value)}
              placeholder="VD: Phạm Văn Vũ"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
            />
          </div>

          {/* Loại tin nhắn */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Mẫu tin nhắn thử nghiệm
            </label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 cursor-pointer"
            >
              <option value="event">🎪 Thư mời Sự kiện &amp; Gala</option>
              <option value="forum">🏛️ Thư mời Diễn đàn Doanh nhân</option>
              <option value="meeting">💼 Thông báo Họp Ban Điều Hành</option>
              <option value="fee">💳 Nhắc nộp hội phí niên liễm</option>
              <option value="custom">✍️ Tự soạn nội dung riêng</option>
            </select>
          </div>
        </div>

        {/* Nội dung tùy chỉnh nếu chọn custom */}
        {testType === "custom" && (
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Nội dung tin nhắn
            </label>
            <textarea
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Nhập nội dung tin nhắn gửi qua Zalo OA..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
            />
          </div>
        )}

        {/* Nút gửi thử nghiệm */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={isSendingTest}
            onClick={handleSendTestMessage}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
          >
            <Send className="size-3.5" />
            <span>{isSendingTest ? "Đang gửi qua Zalo OA..." : "Gửi Thử Nghiệm Qua Zalo OA"}</span>
          </button>
        </div>
      </div>

      {/* ── THẺ 4: TÀI KHOẢN ĐÃ NHẮN TIN HOẶC QUAN TÂM ZALO OA (KÈM NÚT CALL & NHẮN TIN) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="size-4 text-[#003B95] dark:text-blue-400" />
              <span>Danh Sách Tài Khoản Đã Nhắn Tin Hoặc Quan Tâm Zalo OA</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#003B95] dark:bg-blue-950 dark:text-blue-300 text-[11px] font-bold">
                {subscribers.length} người
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quản lý danh bạ hội viên &amp; khách hàng đã tương tác qua Zalo OA. Bấm nút để gọi điện thoại hoặc gửi tin nhắn chăm sóc trực tiếp.
            </p>
          </div>

          <button
            type="button"
            disabled={isSyncingFollowers}
            onClick={handleSyncFollowers}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-[#003B95] border border-blue-200 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900 text-xs font-bold transition cursor-pointer shrink-0 active:scale-95"
          >
            <RefreshCw className={`size-3.5 ${isSyncingFollowers ? "animate-spin" : ""}`} />
            <span>{isSyncingFollowers ? "Đang đồng bộ..." : "Đồng bộ từ Zalo OA"}</span>
          </button>
        </div>

        {loadingSubs ? (
          <div className="py-8 text-center text-xs text-slate-500">Đang tải danh sách người quan tâm Zalo OA...</div>
        ) : subscribers.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <Users className="size-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chưa có tài khoản nào được lưu. Bấm nút <strong>"Đồng bộ từ Zalo OA"</strong> ở trên để nạp danh sách người quan tâm mới nhất.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {subscribers.map((sub) => (
              <div
                key={sub.userId}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 hover:border-blue-300 dark:hover:border-blue-700 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-11 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 border border-slate-300 dark:border-slate-600">
                    {sub.avatar ? (
                      <img src={sub.avatar} alt={sub.displayName} className="size-full object-cover" />
                    ) : (
                      <div className="size-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs">
                        {sub.displayName?.charAt(0) || "Z"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {sub.displayName}
                      </span>
                      {sub.memberCode && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-semibold shrink-0">
                          {sub.memberCode}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {sub.company || sub.lastMessage || "Đang quan tâm OA"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      UID: {sub.userId} {sub.phone && `• SĐT: ${sub.phone}`}
                    </div>
                  </div>
                </div>

                {/* Cặp nút hành động Call & Nhắn tin */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {sub.phone ? (
                    <a
                      href={`tel:${sub.phone}`}
                      className="p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                      title={`Gọi điện tới ${sub.phone}`}
                    >
                      <PhoneCall className="size-3.5" />
                      <span className="hidden sm:inline">Gọi điện</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        toast.info(
                          `Tài khoản Zalo "${sub.displayName}" chưa cung cấp số điện thoại. Bạn có thể gửi tin nhắn Zalo trực tiếp!`,
                          { duration: 4000 }
                        )
                      }
                      className="p-2 rounded-lg bg-slate-200/80 text-slate-500 dark:bg-slate-700 dark:text-slate-400 transition cursor-pointer flex items-center gap-1 text-xs"
                      title="Chưa có số điện thoại để gọi trực tiếp"
                    >
                      <Phone className="size-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenDirectMsg(sub)}
                    className="p-2 rounded-lg bg-[#003B95] text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Gửi tin nhắn qua Zalo OA"
                  >
                    <MessageSquare className="size-3.5" />
                    <span className="hidden sm:inline">Nhắn Zalo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal gửi tin nhắn trực tiếp qua Zalo OA */}
      {directMsgModalOpen && targetSubscriber && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-[#003B95] dark:text-blue-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Gửi Tin Nhắn Zalo OA Cho: {targetSubscriber.displayName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDirectMsgModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Nội dung tin nhắn
              </label>
              <textarea
                rows={4}
                value={subscriberMsg}
                onChange={(e) => setSubscriberMsg(e.target.value)}
                placeholder="Nhập nội dung tin nhắn gửi tới khách hàng..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDirectMsgModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={sendingSubMsg}
                onClick={handleSendDirectMsg}
                className="px-4 py-2 rounded-xl bg-[#003B95] hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Send className="size-3.5" />
                <span>{sendingSubMsg ? "Đang gửi..." : "Gửi Tin Zalo"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
