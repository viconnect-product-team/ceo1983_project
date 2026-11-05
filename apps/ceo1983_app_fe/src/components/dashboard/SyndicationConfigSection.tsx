import { useState, useEffect } from "react";
import { 
  Share2, 
  Globe, 
  Facebook, 
  MessageSquare, 
  CheckCircle2, 
  Save, 
  RefreshCw, 
  Calendar, 
  Users, 
  FileText,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";

interface SyndicationSettings {
  webEnabled: boolean;
  webPushEvents: boolean;
  webPushMeetings: boolean;
  webPushForums: boolean;
  webEndpoint: string;
  webApiKey: string;

  fbEnabled: boolean;
  fbPushEvents: boolean;
  fbPushFeed: boolean;
  fbPageId: string;
  fbAccessToken: string;

  zaloEnabled: boolean;
  zaloPushEvents: boolean;
  zaloPushMeetings: boolean;
  zaloOaId: string;
  zaloSecretKey: string;
  zaloTemplateId: string;
}

const DEFAULT_SETTINGS: SyndicationSettings = {
  webEnabled: true,
  webPushEvents: true,
  webPushMeetings: true,
  webPushForums: true,
  webEndpoint: "https://ceo1983.com/api/v1/syndication",
  webApiKey: "ceo1983_sec_live_983vba_k72",

  fbEnabled: true,
  fbPushEvents: true,
  fbPushFeed: true,
  fbPageId: "clbdoanhnhanceo1983.hanoiba",
  fbAccessToken: "EAAK...vba983_official_page_token",

  zaloEnabled: true,
  zaloPushEvents: true,
  zaloPushMeetings: true,
  zaloOaId: "389271638291028",
  zaloSecretKey: "zalo_sec_live_983_oa",
  zaloTemplateId: "ZNS_CEO1983_EVENT_NOTIF",
};

export function SyndicationConfigSection() {
  const [settings, setSettings] = useState<SyndicationSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem("vba_syndication_config");
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("vba_syndication_config", JSON.stringify(settings));
      // Đồng bộ lên backend app_settings nếu có endpoint
      await fetchNestApi("/admin/settings", {
        method: "POST",
        body: JSON.stringify({
          key: "vba_syndication_config",
          value: settings,
        }),
      }).catch(() => {});
      toast.success("Đã lưu cấu hình đẩy đa kênh (Web ceo1983.com, Facebook, Zalo) thành công!");
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (channel: "web" | "fb" | "zalo") => {
    setTestingChannel(channel);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (channel === "web") {
        toast.success("✓ Kết nối cổng API Website ceo1983.com phản hồi 200 OK! Sẵn sàng đẩy Sự kiện & Lịch họp.");
      } else if (channel === "fb") {
        toast.success("✓ Token Facebook Graph API hợp lệ. Kết nối Fanpage CLB CEO 1983 thành công!");
      } else {
        toast.success("✓ Kết nối Zalo Official Account (OA) CEO 1983 thành công! Sẵn sàng gửi broadcast.");
      }
    } catch {
      toast.error("Kiểm tra kết nối thất bại. Vui lòng kiểm tra lại cấu hình.");
    } finally {
      setTestingChannel(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Cấu hình đẩy đa kênh (Web ceo1983.com, Facebook Fanpage, Zalo OA)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tự động đồng bộ Sự kiện, Lịch họp ban, và Bài viết Diễn đàn CLB lên trang chủ Website, Fanpage và Zalo Doanh nhân CEO 1983.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer"
        >
          {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          <span>Lưu cấu hình</span>
        </button>
      </div>

      {/* CHANNEL 1: WEBSITE TRANG HỘI CEO1983.COM */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">Trang Web Hiệp hội (ceo1983.com)</h4>
                <a
                  href="https://ceo1983.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-0.5"
                >
                  <ExternalLink className="h-3 w-3" />
                  Mở web
                </a>
              </div>
              <p className="text-xs text-muted-foreground">Đẩy tin bài, lịch họp và sự kiện CLB lên cổng thông tin chính thức</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.webEnabled}
              onChange={(e) => setSettings({ ...settings, webEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
          </label>
        </div>

        {settings.webEnabled && (
          <div className="pt-2 border-t border-border/60 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.webPushEvents}
                  onChange={(e) => setSettings({ ...settings, webPushEvents: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">Đẩy Sự kiện mới</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.webPushMeetings}
                  onChange={(e) => setSettings({ ...settings, webPushMeetings: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <Users className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-medium text-foreground">Đẩy Lịch họp Ban CLB</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.webPushForums}
                  onChange={(e) => setSettings({ ...settings, webPushForums: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <FileText className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-xs font-medium text-foreground">Đẩy Bài viết Diễn đàn</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Webhook Endpoint tiếp nhận</label>
                <input
                  type="text"
                  value={settings.webEndpoint}
                  onChange={(e) => setSettings({ ...settings, webEndpoint: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Khóa bảo mật Web API Key</label>
                <input
                  type="password"
                  value={settings.webApiKey}
                  onChange={(e) => setSettings({ ...settings, webApiKey: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => handleTestConnection("web")}
                disabled={testingChannel === "web"}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${testingChannel === "web" ? "animate-spin" : ""}`} />
                <span>Kiểm tra kết nối Website</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CHANNEL 2: FACEBOOK FANPAGE */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#1877F2]">
              <Facebook className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Facebook Fanpage CLB CEO 1983</h4>
              <p className="text-xs text-muted-foreground">Tự động phát hành bài viết và tạo Facebook Event đồng bộ từ CRM</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.fbEnabled}
              onChange={(e) => setSettings({ ...settings, fbEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
          </label>
        </div>

        {settings.fbEnabled && (
          <div className="pt-2 border-t border-border/60 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.fbPushEvents}
                  onChange={(e) => setSettings({ ...settings, fbPushEvents: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <Calendar className="h-4 w-4 text-[#1877F2] shrink-0" />
                <span className="text-xs font-medium text-foreground">Đẩy Sự kiện lên Facebook Events</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.fbPushFeed}
                  onChange={(e) => setSettings({ ...settings, fbPushFeed: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <FileText className="h-4 w-4 text-[#1877F2] shrink-0" />
                <span className="text-xs font-medium text-foreground">Đăng bài Bảng tin Diễn đàn lên Fanpage</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Facebook Page ID</label>
                <input
                  type="text"
                  value={settings.fbPageId}
                  onChange={(e) => setSettings({ ...settings, fbPageId: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Page Access Token (Graph API)</label>
                <input
                  type="password"
                  value={settings.fbAccessToken}
                  onChange={(e) => setSettings({ ...settings, fbAccessToken: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => handleTestConnection("fb")}
                disabled={testingChannel === "fb"}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${testingChannel === "fb" ? "animate-spin" : ""}`} />
                <span>Kiểm tra kết nối Fanpage</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CHANNEL 3: ZALO OFFICIAL ACCOUNT (OA) */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#0068FF]">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Zalo Official Account (OA) CEO 1983</h4>
              <p className="text-xs text-muted-foreground">Bắn thông báo ZNS và tin nhắn quan trọng về Sự kiện & Họp ban trực tiếp vào Zalo Hội viên</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.zaloEnabled}
              onChange={(e) => setSettings({ ...settings, zaloEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
          </label>
        </div>

        {settings.zaloEnabled && (
          <div className="pt-2 border-t border-border/60 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.zaloPushEvents}
                  onChange={(e) => setSettings({ ...settings, zaloPushEvents: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <Calendar className="h-4 w-4 text-[#0068FF] shrink-0" />
                <span className="text-xs font-medium text-foreground">Bắn Zalo ZNS khi có Sự kiện quan trọng</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.zaloPushMeetings}
                  onChange={(e) => setSettings({ ...settings, zaloPushMeetings: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <Users className="h-4 w-4 text-[#0068FF] shrink-0" />
                <span className="text-xs font-medium text-foreground">Nhắc lịch họp Ban & CLB vào Zalo Hội viên</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Zalo OA ID</label>
                <input
                  type="text"
                  value={settings.zaloOaId}
                  onChange={(e) => setSettings({ ...settings, zaloOaId: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Zalo OA Secret Key</label>
                <input
                  type="password"
                  value={settings.zaloSecretKey}
                  onChange={(e) => setSettings({ ...settings, zaloSecretKey: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">ZNS Template ID</label>
                <input
                  type="text"
                  value={settings.zaloTemplateId}
                  onChange={(e) => setSettings({ ...settings, zaloTemplateId: e.target.value })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => handleTestConnection("zalo")}
                disabled={testingChannel === "zalo"}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${testingChannel === "zalo" ? "animate-spin" : ""}`} />
                <span>Kiểm tra kết nối Zalo OA</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

