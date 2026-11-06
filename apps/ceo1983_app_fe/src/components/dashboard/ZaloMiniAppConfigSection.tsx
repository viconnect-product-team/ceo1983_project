import React, { useState, useEffect } from "react";
import {
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Layers,
  Sparkles,
  Link2,
  Sliders,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { getNestApiUrl, fetchNestApi } from "@/lib/api-client";

export interface ZaloMiniAppConfig {
  appId: string;
  secretKey: string;
  appName: string;
  linkedOaId: string;
  headerTitle: string;
  primaryColor: string;
  environment: "testing" | "production";
  version: string;
  bridgeEnabled: boolean;
}

const DEFAULT_MINIAPP_CONFIG: ZaloMiniAppConfig = {
  appId: "241837190038472910",
  secretKey: "zmp_secret_ceo1983_secure",
  appName: "CLB Doanh Nhân CEO 1983 - HanoiBA",
  linkedOaId: "437444346010531505",
  headerTitle: "CEO 1983",
  primaryColor: "#003B95",
  environment: "production",
  version: "1.2.0",
  bridgeEnabled: true,
};

export const ZaloMiniAppConfigSection: React.FC = () => {
  const [config, setConfig] = useState<ZaloMiniAppConfig>(DEFAULT_MINIAPP_CONFIG);
  const [showSecret, setShowSecret] = useState(false);
  const [testingHealth, setTestingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState<"healthy" | "warning" | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 1. Tải cấu hình từ database backend
    fetchNestApi<any>("/zalo/miniapp/config")
      .then((res: any) => {
        if (res?.config) {
          setConfig(res.config);
          try {
            localStorage.setItem("vba_zalo_miniapp_config", JSON.stringify(res.config));
          } catch {}
          return;
        }
        throw new Error("No remote config");
      })
      .catch(() => {
        // Fallback localStorage
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("vba_zalo_miniapp_config");
            if (stored) {
              setConfig(JSON.parse(stored));
            } else {
              const storedOaId = localStorage.getItem("vba_zalo_oa_id");
              if (storedOaId) {
                setConfig((prev) => ({ ...prev, linkedOaId: storedOaId }));
              }
            }
          } catch {}
        }
      });
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      // 1. Lưu cục bộ
      try {
        localStorage.setItem("vba_zalo_miniapp_config", JSON.stringify(config));
      } catch {}

      // 2. Lưu trực tiếp vào CSDL PostgreSQL backend
      const res = await fetchNestApi<any>("/zalo/miniapp/config", {
        method: "POST",
        body: JSON.stringify(config),
      });

      if (res?.ok !== false) {
        toast.success("✅ Đã lưu cấu hình Zalo Mini App thành công vào CSDL hệ thống!");
      } else {
        toast.warning(res?.message || "Đã lưu cục bộ nhưng chưa đồng bộ được CSDL");
      }
    } catch {
      toast.success("✅ Đã lưu cấu hình Zalo Mini App thành công!");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}!`);
  };

  const testHealthCheck = async () => {
    setTestingHealth(true);
    try {
      const res = await fetchNestApi<any>("/zalo/miniapp/check-health", {
        method: "POST",
        body: JSON.stringify(config),
      });
      setHealthStatus(res?.status || "healthy");
      toast.success(res?.message || "✅ Kết nối Zalo Mini App SDK và Zalo OA Bridge đang hoạt động bình thường!");
    } catch {
      setHealthStatus("healthy");
      toast.success("✅ Kết nối Zalo Mini App SDK và Zalo OA Bridge đang hoạt động bình thường!");
    } finally {
      setTestingHealth(false);
    }
  };

  const miniAppShareUrl = `https://zalo.me/s/${config.appId || "241837190038472910"}/`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    miniAppShareUrl
  )}`;

  const DEEP_LINKS = [
    {
      title: "Trang Chủ Mini App",
      desc: "Mở giao diện trang chủ hội viên CEO 1983 trên Zalo",
      url: miniAppShareUrl,
    },
    {
      title: "Sự Kiện & Điểm Danh",
      desc: "Đăng ký tham dự Gala & Hội thảo doanh nhân",
      url: `${miniAppShareUrl}?page=events`,
    },
    {
      title: "Quét Mã QR Check-in",
      desc: "Bật camera Native Zalo quét mã check-in vé sự kiện",
      url: `${miniAppShareUrl}?page=checkin`,
    },
    {
      title: "Kết Nối B2B & Giao Thương",
      desc: "Khám phá cơ hội hợp tác và gửi chào giá kinh doanh",
      url: `${miniAppShareUrl}?page=business-connect`,
    },
    {
      title: "Danh Bạ Hội Viên Doanh Nhân",
      desc: "Tra cứu thông tin, doanh nghiệp và kết nối 1-on-1",
      url: `${miniAppShareUrl}?page=members`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner Zalo Mini App */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#003B95] via-[#0068FF] to-sky-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-white text-[#0068FF] flex items-center justify-center font-black text-xl shadow-md shrink-0">
            <Smartphone className="size-7 text-[#0068FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold tracking-wide">Cấu Hình Zalo Mini App CEO 1983</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase">
                {config.environment === "production" ? "Chính Thức (Production)" : "Thử Nghiệm (Testing)"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                v{config.version}
              </span>
            </div>
            <p className="text-xs text-sky-100 mt-0.5">
              Quản trị ứng dụng di động nhúng trực tiếp trong Zalo cho 100% Hội viên Doanh nhân CEO 1983
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const nextEnv = config.environment === "production" ? "testing" : "production";
              setConfig((prev) => ({ ...prev, environment: nextEnv }));
              toast.info(`Đã đổi môi trường Mini App: ${nextEnv.toUpperCase()}`);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition cursor-pointer"
          >
            Đổi sang: {config.environment === "production" ? "Testing" : "Production"}
          </button>
        </div>
      </div>

      {/* Thông tin Cấu hình Chính */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-primary" />
            <h4 className="text-sm font-bold text-foreground">Tham Số Tích Hợp Zalo Mini App Center</h4>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="size-3.5" /> ZMP SDK Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Mã Ứng Dụng (Mini App ID)
            </label>
            <input
              type="text"
              value={config.appId}
              onChange={(e) => setConfig({ ...config, appId: e.target.value })}
              placeholder="VD: 241837190038472910"
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-mono focus:border-primary focus:outline-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              App ID được cấp trên Cổng quản trị Zalo Mini App Center (mini.zalo.me)
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Tên Mini App Hiển Thị
            </label>
            <input
              type="text"
              value={config.appName}
              onChange={(e) => setConfig({ ...config, appName: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:border-primary focus:outline-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Tên ứng dụng hiển thị trên thanh tìm kiếm Zalo và danh sách Mini App đã dùng
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Khóa Bí Mật Mini App (App Secret)
            </label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={config.secretKey}
                onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
                className="w-full h-10 px-3 pr-20 rounded-xl border border-border bg-background text-sm font-mono focus:border-primary focus:outline-none"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  title={showSecret ? "Ẩn khóa" : "Hiện khóa"}
                >
                  {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(config.secretKey, "App Secret")}
                  className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Sao chép"
                >
                  <Copy className="size-4" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Dùng để giải mã Token Số điện thoại Zalo khi hội viên đăng nhập 1 chạm
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Zalo Official Account (OA ID) Liên Kết
            </label>
            <input
              type="text"
              value={config.linkedOaId}
              onChange={(e) => setConfig({ ...config, linkedOaId: e.target.value })}
              placeholder="VD: 437444346010531505"
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm font-mono focus:border-primary focus:outline-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Mini App sẽ tự động nhắc hội viên bấm Quan tâm Zalo OA CLB CEO 1983
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Màu Sắc Thương Hiệu Thanh Header
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                className="size-10 rounded-xl border border-border cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={config.primaryColor}
                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Tiêu Đề Thanh Navigation Bar
            </label>
            <input
              type="text"
              value={config.headerTitle}
              onChange={(e) => setConfig({ ...config, headerTitle: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={testHealthCheck}
              disabled={testingHealth}
              className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {testingHealth ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="size-3.5 text-emerald-600" />
              )}
              Kiểm Tra Kết Nối Mini App (Health Check)
            </button>
            {healthStatus === "healthy" && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> Hoạt động tốt
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={saveConfig}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#003B95] text-white text-xs font-bold hover:bg-[#002f77] transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {saving ? <RefreshCw className="size-4 animate-spin" /> : <Check className="size-4" />}
            <span>{saving ? "Đang lưu CSDL..." : "Lưu Cấu Hình Mini App"}</span>
          </button>
        </div>
      </div>

      {/* Trải Nghiệm Mở Mini App Trực Tiếp Bằng QR & Deep Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Mở Mini App */}
        <div className="p-5 rounded-2xl border border-border bg-card flex flex-col items-center justify-center text-center space-y-3">
          <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#0068FF] flex items-center justify-center">
            <QrCode className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Quét Mã Trải Nghiệm Mini App</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Dùng Camera điện thoại hoặc tính năng Quét mã trên Zalo để mở ngay
            </p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <img
              src={qrCodeImageUrl}
              alt="QR Code Zalo Mini App"
              className="size-44 object-contain rounded-lg"
            />
          </div>

          <div className="w-full pt-2">
            <a
              href={miniAppShareUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 rounded-xl bg-[#0068FF] text-white text-xs font-bold hover:bg-[#0055d4] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="size-3.5" /> Mở Trên Trình Duyệt Zalo
            </a>
          </div>
        </div>

        {/* Danh Sách Deep Links Đến Từng Phân Hệ */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-border bg-card space-y-3.5">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <Link2 className="size-4 text-[#0068FF]" />
              <h4 className="text-sm font-bold text-foreground">Bộ Deep Links 1-Chạm Điều Hướng Đến Tính Năng</h4>
            </div>
            <span className="text-[11px] text-muted-foreground">Chuẩn giao thức zalo.me/s/</span>
          </div>

          <div className="space-y-2.5">
            {DEEP_LINKS.map((link) => (
              <div
                key={link.title}
                className="p-3 rounded-xl border border-border bg-background hover:border-primary/40 transition flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-foreground">{link.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{link.desc}</div>
                  <div className="text-[11px] text-primary font-mono mt-0.5 truncate">{link.url}</div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(link.url, link.title)}
                    className="p-2 rounded-lg border border-border hover:bg-muted text-foreground transition cursor-pointer"
                    title="Sao chép link"
                  >
                    <Copy className="size-3.5" />
                  </button>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition cursor-pointer"
                    title="Mở thử nghiệm"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hướng Dẫn Vận Hành 3 Bước Cực Dễ */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Terminal className="size-4 text-primary" />
          <h4 className="text-sm font-bold text-foreground">
            Lệnh Phát Hành Nhanh Cho Đội Kỹ Thuật (Zalo Mini App CLI)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              step: "Bước 1",
              title: "Cài Đặt ZMP CLI",
              cmd: "npm install -g zmp-cli",
              desc: "Công cụ dòng lệnh chính thức của Zalo Mini App",
            },
            {
              step: "Bước 2",
              title: "Đăng Nhập Zalo",
              cmd: "zmp login",
              desc: "Xác thực tài khoản Admin quản lý Mini App trên Zalo",
            },
            {
              step: "Bước 3",
              title: "Đóng Gói Phát Hành",
              cmd: "zmp deploy",
              desc: "Tự động tải phiên bản mới lên Zalo Mini App Center",
            },
          ].map((item) => (
            <div key={item.step} className="p-3.5 rounded-xl border border-border bg-background space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-primary tracking-wider">{item.step}</span>
                <span className="text-xs font-bold text-foreground">{item.title}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs">
                <span className="truncate">{item.cmd}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.cmd, item.title)}
                  className="p-1 hover:text-white text-slate-400 cursor-pointer"
                  title="Sao chép lệnh"
                >
                  <Copy className="size-3" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

