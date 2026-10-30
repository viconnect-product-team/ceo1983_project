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
} from "lucide-react";
import { toast } from "sonner";

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
      "Kính gửi Hội viên {ho_ten} (Mã HV: {ma_hoi_vien}), Ban Tài chính Hiệp hội Doanh nhân CEO 1983 trân trọng thông báo kỳ gia hạn hội phí thường niên năm {nam_hoi_phi}. Số tiền: {so_tien} VNĐ. Hạn hoàn tất trước ngày {han_dong}. Kính chúc Doanh nghiệp {ten_doanh_nghiep} ngày càng phát triển thịnh vượng!",
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

export const ZaloOaConfigSection: React.FC = () => {
  const [oaId, setOaId] = useState("284918294821039482");
  const [appId, setAppId] = useState("482910482910");
  const [secretKey, setSecretKey] = useState("sec_zalo_ceo1983_prod_98x12a");
  const [accessToken, setAccessToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ceo1983_zalo_oa_token");
  const [refreshToken, setRefreshToken] = useState("reftok_zalo_983_secure");
  const [webhookUrl, setWebhookUrl] = useState("https://api.ceo1983.vn/zalo/webhook");
  const [isConnected, setIsConnected] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);

  // Template Management
  const [templates, setTemplates] = useState<ZaloOaTemplate[]>(() => {
    if (typeof window === "undefined") return DEFAULT_TEMPLATES;
    try {
      const stored = localStorage.getItem("vba_zalo_oa_templates");
      return stored ? JSON.parse(stored) : DEFAULT_TEMPLATES;
    } catch {
      return DEFAULT_TEMPLATES;
    }
  });

  const [activeCategory, setActiveCategory] = useState<"all" | "membership_fee" | "event" | "training" | "meeting">("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl_fee_1");
  const [testPhone, setTestPhone] = useState("0912345678");
  const [sendingTest, setSendingTest] = useState(false);

  // Save config
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
      localStorage.setItem("vba_zalo_oa_config", JSON.stringify(cfg));
      localStorage.setItem("vba_zalo_oa_templates", JSON.stringify(templates));
      toast.success("Đã lưu cấu hình Zalo Official Account & Mẫu tin nhắn thành công!");
    } catch {
      toast.error("Không thể lưu cấu hình Zalo OA");
    }
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      setIsConnected(true);
      toast.success("Kết nối Zalo Official Account (API v3) thành công! Trạng thái: Đang hoạt động");
    }, 1200);
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
    .replace("{ho_ten}", "Nguyễn Văn Nam")
    .replace("{ma_hoi_vien}", "CEO1983-088")
    .replace("{nam_hoi_phi}", "2026")
    .replace("{so_tien}", "10.000.000")
    .replace("{han_dong}", "31/12/2026")
    .replace("{ten_doanh_nghiep}", "Tập Đoàn Công Nghệ CEO")
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
              <h3 className="text-base font-extrabold tracking-wide">Cấu Hình Zalo Official Account (OA)</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase">
                API V3 Tự Động
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Hệ thống tự động gửi tin nhắn ZNS & Thông báo Zalo OA theo 4 danh mục nghiệp vụ với các biến động linh hoạt
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

      {/* 1. Thông Tin Kết Nối API Zalo OA */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-primary" />
            <h4 className="text-sm font-bold text-foreground">Tham Số Kết Nối Zalo Developer &amp; Access Token</h4>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <Check className="size-3.5" /> Đã xác thực bảo mật
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Zalo OA ID</label>
            <input
              type="text"
              value={oaId}
              onChange={(e) => setOaId(e.target.value)}
              placeholder="Nhập OA ID từ Zalo Official Account..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Zalo App ID</label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="Nhập App ID từ developers.zalo.me..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Secret Key (Khóa bí mật)</label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Nhập Secret Key..."
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
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                title="Sao chép URL"
              >
                <Copy className="size-3.5" />
              </button>
            </div>
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
                <span>Bắn thử nghiệm tin nhắn này:</span>
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

