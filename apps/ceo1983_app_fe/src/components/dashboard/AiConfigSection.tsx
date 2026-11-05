import { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Key,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Save,
  Activity,
  Zap,
  Server,
  Mail,
  History,
  Clock,
  User,
  Sliders,
  Check,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";

interface AiConfigData {
  activeProvider: string;
  activeModel: string;
  fallbackProvider: string;
  fallbackModel: string;
  geminiKeyConfigured: boolean;
  openaiKeyConfigured: boolean;
  claudeKeyConfigured: boolean;
  deepseekKeyConfigured: boolean;
  openrouterKeyConfigured: boolean;
  warningThresholdPercent: number;
  criticalThresholdPercent: number;
  monthlyTokensUsed: number;
  monthlyTokensLimit: number;
  usedPercent: number;
  status: "healthy" | "warning" | "critical";
  alertEmail: string;
  lastUpdated: string;
}

const PROVIDERS = [
  {
    id: "gemini",
    name: "Google Gemini",
    badge: "Khuyên dùng - Nhanh & Chi phí tối ưu",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    keyName: "geminiApiKey",
    docUrl: "https://aistudio.google.com/app/apikey",
  },
  {
    id: "openai",
    name: "OpenAI",
    badge: "Tiêu chuẩn ngành",
    models: ["gpt-4o", "gpt-4o-mini", "o3-mini"],
    keyName: "openaiApiKey",
    docUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    badge: "Phân tích ngữ cảnh sâu & Viết báo cáo",
    models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"],
    keyName: "claudeApiKey",
    docUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    badge: "Hiệu năng cao - Tiết kiệm chi phí",
    models: ["deepseek-chat", "deepseek-reasoner"],
    keyName: "deepseekApiKey",
    docUrl: "https://platform.deepseek.com/api_keys",
  },
];

export function AiConfigSection() {
  const [config, setConfig] = useState<AiConfigData>({
    activeProvider: "gemini",
    activeModel: "gemini-2.0-flash",
    fallbackProvider: "openai",
    fallbackModel: "gpt-4o-mini",
    geminiKeyConfigured: true,
    openaiKeyConfigured: false,
    claudeKeyConfigured: false,
    deepseekKeyConfigured: false,
    openrouterKeyConfigured: false,
    warningThresholdPercent: 80,
    criticalThresholdPercent: 95,
    monthlyTokensUsed: 142000,
    monthlyTokensLimit: 2000000,
    usedPercent: 7,
    status: "healthy",
    alertEmail: "admin@ceo1983.vn",
    lastUpdated: new Date().toISOString(),
  });

  const [keysInput, setKeysInput] = useState<{ [key: string]: string }>({
    geminiApiKey: "",
    openaiApiKey: "",
    claudeApiKey: "",
    deepseekApiKey: "",
  });

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  // Load config & logs
  const loadData = async () => {
    setLoading(true);
    try {
      const cfgRes = await fetchNestApi<any>("/api/ai/system-config");
      if (cfgRes?.ok && cfgRes?.data) {
        setConfig(cfgRes.data);
      }
      const logsRes = await fetchNestApi<any>("/api/ai/system-logs");
      if (logsRes?.ok && logsRes?.data) {
        setLogs(logsRes.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        activeProvider: config.activeProvider,
        activeModel: config.activeModel,
        fallbackProvider: config.fallbackProvider,
        fallbackModel: config.fallbackModel,
        warningThresholdPercent: config.warningThresholdPercent,
        criticalThresholdPercent: config.criticalThresholdPercent,
        alertEmail: config.alertEmail,
      };

      if (keysInput.geminiApiKey) payload.geminiApiKey = keysInput.geminiApiKey;
      if (keysInput.openaiApiKey) payload.openaiApiKey = keysInput.openaiApiKey;
      if (keysInput.claudeApiKey) payload.claudeApiKey = keysInput.claudeApiKey;
      if (keysInput.deepseekApiKey) payload.deepseekApiKey = keysInput.deepseekApiKey;

      const res = await fetchNestApi<any>("/api/ai/system-config", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res?.ok) {
        toast.success(res.message || "Đã lưu cấu hình AI & dự phòng thành công!");
        loadData();
      } else {
        toast.error(res?.message || "Không thể lưu cấu hình");
      }
    } catch {
      toast.error("Lỗi khi kết nối máy chủ");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (providerId: string, model: string) => {
    setTestingProvider(providerId);
    try {
      const apiKey = keysInput[`${providerId}ApiKey`];
      const res = await fetchNestApi<any>("/api/ai/test-connection", {
        method: "POST",
        body: JSON.stringify({ provider: providerId, model, apiKey }),
      });
      if (res?.ok) {
        toast.success(`Kiểm tra thành công: ${res.message} (Độ trễ: ${res.latencyMs}ms)`);
      } else {
        toast.error(res?.message || "Kiểm tra thất bại");
      }
    } catch {
      toast.error("Không thể kết nối đến máy chủ AI");
    } finally {
      setTestingProvider(null);
    }
  };

  // Tính trạng thái hạn mức
  const isNearLimit = config.usedPercent >= config.warningThresholdPercent;
  const isCritical = config.usedPercent >= config.criticalThresholdPercent;

  return (
    <div className="space-y-6">
      {/* ── BANNER CẢNH BÁO KHI MODEL SẮP HẾT HẠN MỨC (YÊU CẦU CỦA NGƯỜI DÙNG) ── */}
      {isCritical ? (
        <div className="p-4 rounded-2xl bg-red-500/10 border-2 border-red-500 text-red-700 dark:text-red-400 flex items-start gap-3.5 shadow-sm animate-pulse">
          <ShieldAlert className="size-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase tracking-wide">
              Báo Động Đỏ: Hạn Mức Model {config.activeProvider.toUpperCase()} Sắp Cạn ({config.usedPercent}%)!
            </h4>
            <p className="text-xs leading-relaxed">
              Model chính đang tiến sát hạn mức quy định. Hệ thống khuyến nghị bạn tích hợp ngay API Key của model khác (như OpenAI GPT-4o, Anthropic Claude hoặc DeepSeek) ở bảng bên dưới để chuyển tiếp liền mạch, không làm gián đoạn các tính năng AI CRM.
            </p>
          </div>
        </div>
      ) : isNearLimit ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-800 dark:text-amber-300 flex items-start gap-3.5 shadow-xs">
          <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Cảnh Báo Hạn Mức: Đã Dùng {config.usedPercent}% Quota AI Trong Tháng
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-300/90 leading-relaxed">
              Mức sử dụng token đang vượt ngưỡng an toàn ({config.warningThresholdPercent}%). Bạn nên cấu hình sẵn API Key dự phòng (Fallback Model) để sẵn sàng thay thế tự động khi cần.
            </p>
          </div>
        </div>
      ) : null}

      {/* ── CARD 1: ĐỒNG HỒ HẠN MỨC & THEO DÕI QUOTA REALTIME ── */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 grid place-items-center text-primary font-bold">
              <Activity className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Giám Sát Hạn Mức & Token Model AI</h3>
              <p className="text-xs text-muted-foreground">
                Tự động đo lường số token tiêu thụ, cảnh báo sớm khi model sắp hết quota
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground hover:bg-muted transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Làm mới số liệu</span>
            </button>
          </div>
        </div>

        {/* Thước đo phần trăm sử dụng */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground">Hạn mức token tháng này:</span>
            <span className="font-black text-foreground">
              {config.monthlyTokensUsed.toLocaleString("vi-VN")} / {config.monthlyTokensLimit.toLocaleString("vi-VN")} Tokens ({config.usedPercent}%)
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-border/40">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                config.usedPercent >= config.criticalThresholdPercent
                  ? "bg-red-500"
                  : config.usedPercent >= config.warningThresholdPercent
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.max(5, Math.min(100, config.usedPercent))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="size-3" /> An toàn (&lt; {config.warningThresholdPercent}%)
            </span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <AlertTriangle className="size-3" /> Cảnh báo ({config.warningThresholdPercent}% - {config.criticalThresholdPercent}%)
            </span>
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
              <ShieldAlert className="size-3" /> Báo động đổi key (&gt; {config.criticalThresholdPercent}%)
            </span>
          </div>
        </div>

        {/* Thiết lập ngưỡng cảnh báo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Ngưỡng cảnh báo vàng (%):</label>
            <input
              type="number"
              min={50}
              max={90}
              value={config.warningThresholdPercent}
              onChange={(e) => setConfig({ ...config, warningThresholdPercent: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Ngưỡng báo động đỏ (%):</label>
            <input
              type="number"
              min={80}
              max={99}
              value={config.criticalThresholdPercent}
              onChange={(e) => setConfig({ ...config, criticalThresholdPercent: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Email nhận cảnh báo cạn Quota:</label>
            <input
              type="email"
              value={config.alertEmail}
              onChange={(e) => setConfig({ ...config, alertEmail: e.target.value })}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── CARD 2: CẤU HÌNH ĐA NỀN TẢNG MODEL & FALLBACK CHUYỂN VÙNG ── */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
          <div className="size-9 rounded-xl bg-amber-500/10 grid place-items-center text-amber-600 font-bold">
            <Bot className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">Cấu Hình Đa Nền Tảng Model & Key Dự Phòng</h3>
            <p className="text-xs text-muted-foreground">
              Cho phép tích hợp API Key của nhiều hãng AI. Khi model chính chạm hạn mức, hệ thống tự động kích hoạt model dự phòng.
            </p>
          </div>
        </div>

        {/* Chọn Model hoạt động chính & Fallback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Zap className="size-3.5 text-emerald-500" />
                Model Hoạt Động Chính (Active Model)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Đang xử lý CRM
              </span>
            </div>
            <select
              value={`${config.activeProvider}:${config.activeModel}`}
              onChange={(e) => {
                const [p, m] = e.target.value.split(":");
                setConfig({ ...config, activeProvider: p, activeModel: m });
              }}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-border bg-background outline-none"
            >
              <option value="gemini:gemini-2.0-flash">Google Gemini — Gemini 2.0 Flash (Tối ưu nhất)</option>
              <option value="gemini:gemini-1.5-pro">Google Gemini — Gemini 1.5 Pro (Phân tích sâu)</option>
              <option value="openai:gpt-4o">OpenAI — GPT-4o Flagship</option>
              <option value="openai:gpt-4o-mini">OpenAI — GPT-4o-mini (Tiết kiệm)</option>
              <option value="claude:claude-3-5-sonnet-20241022">Anthropic Claude — Claude 3.5 Sonnet</option>
              <option value="deepseek:deepseek-chat">DeepSeek — DeepSeek V3 (Chi phí thấp)</option>
              <option value="deepseek:deepseek-reasoner">DeepSeek — DeepSeek R1 (Suy luận logic)</option>
            </select>
          </div>

          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Server className="size-3.5 text-amber-500" />
                Model Dự Phòng Tự Động (Fallback Model)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Kích hoạt khi cạn Quota
              </span>
            </div>
            <select
              value={`${config.fallbackProvider}:${config.fallbackModel}`}
              onChange={(e) => {
                const [p, m] = e.target.value.split(":");
                setConfig({ ...config, fallbackProvider: p, fallbackModel: m });
              }}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-border bg-background outline-none"
            >
              <option value="openai:gpt-4o-mini">OpenAI — GPT-4o-mini (Khuyên dùng dự phòng)</option>
              <option value="gemini:gemini-1.5-flash">Google Gemini — Gemini 1.5 Flash</option>
              <option value="deepseek:deepseek-chat">DeepSeek — DeepSeek V3</option>
              <option value="claude:claude-3-5-haiku-20241022">Anthropic Claude — Claude 3.5 Haiku</option>
            </select>
          </div>
        </div>

        {/* Danh sách tích hợp API Keys */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Quản Lý API Key Đa Hãng (Cung Cấp Để Kích Hoạt Dự Phòng Liền Mạch)
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {PROVIDERS.map((p) => {
              const isConfigured = (config as any)[`${p.id}KeyConfigured`];
              return (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl border border-border bg-background/50 hover:bg-background transition space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-foreground">{p.name}</span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {p.badge}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold flex items-center gap-1 ${
                          isConfigured ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                        }`}
                      >
                        {isConfigured ? (
                          <>
                            <Check className="size-3" /> Đã tích hợp Key
                          </>
                        ) : (
                          <>
                            <XCircle className="size-3" /> Chưa có Key
                          </>
                        )}
                      </span>
                      <a
                        href={p.docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-primary hover:underline flex items-center gap-0.5 ml-2"
                      >
                        <span>Lấy Key</span>
                        <ExternalLink className="size-2.5" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Key className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder={isConfigured ? "•••••••••••••••••••••••••••••••• (Đã lưu an toàn)" : `Nhập API Key cho ${p.name}...`}
                        value={keysInput[p.keyName] || ""}
                        onChange={(e) => setKeysInput({ ...keysInput, [p.keyName]: e.target.value })}
                        className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={testingProvider === p.id}
                      onClick={() => handleTestConnection(p.id, p.models[0])}
                      className="px-3 py-1.5 rounded-xl border border-border bg-muted/60 text-xs font-bold text-foreground hover:bg-muted transition active:scale-95 cursor-pointer shadow-2xs whitespace-nowrap"
                    >
                      {testingProvider === p.id ? "Đang thử..." : "Kiểm tra kết nối"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nút lưu cấu hình */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            <Save className={`size-4 ${saving ? "animate-spin" : ""}`} />
            <span>{saving ? "Đang lưu cấu hình..." : "Lưu Cấu Hình AI & Dự Phòng"}</span>
          </button>
        </div>
      </div>

      {/* ── CARD 3: NHẬT KÝ HOẠT ĐỘNG AI (AI AUDIT TRAIL) ── */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-blue-500/10 grid place-items-center text-blue-600 font-bold">
              <History className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Nhật Ký Thao Tác & Hoạt Động AI (Audit Log)</h3>
              <p className="text-xs text-muted-foreground">
                Ghi nhận minh bạch lịch sử xử lý, model phục vụ, độ trễ và số token tiêu thụ
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            Tổng cộng: {logs.length} bản ghi
          </span>
        </div>

        {/* Bảng dữ liệu nhật ký */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Thời gian</th>
                <th className="py-2.5 px-3">Người yêu cầu</th>
                <th className="py-2.5 px-3">Tác vụ AI</th>
                <th className="py-2.5 px-3">Model xử lý</th>
                <th className="py-2.5 px-3">Độ trễ</th>
                <th className="py-2.5 px-3">Tokens</th>
                <th className="py-2.5 px-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted-foreground">
                    Chưa có nhật ký ghi nhận nào.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30 transition">
                    <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        <span>{new Date(l.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="text-[10px] text-muted-foreground/80">({new Date(l.createdAt).toLocaleDateString("vi-VN")})</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-foreground">{l.userName}</div>
                      <div className="text-[10px] text-muted-foreground">{l.userEmail}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-foreground">{l.capability}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-primary">
                      {l.model}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-muted-foreground">
                      {l.latencyMs}ms
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-foreground">
                      ~{l.tokensEstimate?.toLocaleString("vi-VN")}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {l.status === "fallback" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                          <AlertTriangle className="size-2.5" /> Fallback
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                          <CheckCircle2 className="size-2.5" /> Thành công
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

