import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Building2,
  Globe,
  Image,
  Layout,
  Lock,
  Mail,
  MessageSquareText,
  RefreshCw,
  Save,
  Shield,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { AssociationLogoUploader } from "@/components/dashboard/AssociationLogoUploader";
import { AssociationLandingEditor } from "@/components/dashboard/AssociationLandingEditor";
import { AssociationDomainEditor } from "@/components/dashboard/AssociationDomainEditor";
import { ReplyTemplatesEditor } from "@/components/dashboard/ReplyTemplatesEditor";
import { getSettingsFn, saveSettingsFn } from "@/lib/settings.functions";
import { useLang, useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

const TABS = [
  { key: "general", label: "set.tab.general", icon: Building2 },
  { key: "landing", label: "set.tab.landing", icon: Layout },
  { key: "domain", label: "set.tab.domain", icon: Globe },
  { key: "templates", label: "set.tab.templates", icon: MessageSquareText },
  { key: "notifications", label: "set.tab.notifications", icon: Bell },
  { key: "security", label: "set.tab.security", icon: Shield },
  { key: "integrations", label: "set.tab.integrations", icon: Globe },
] as const;

function SettingsPage() {
  const t = useT();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("general");
  const { lang, setLang } = useLang();
  const [orgName, setOrgName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vba_active_assoc_name") || localStorage.getItem("crm_system_name") || "CLB Doanh Nhân CEO 1983";
    }
    return "CLB Doanh Nhân CEO 1983";
  });
  const [orgLogo, setOrgLogo] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("vba_active_assoc_logo") ||
        localStorage.getItem("crm_system_logo") ||
        "/icons/ceo1983_icon_1/image 6.png"
      );
    }
    return "/icons/ceo1983_icon_1/image 6.png";
  });
  const [email, setEmail] = useState("contact@ceo1983.vn");
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [twoFA, setTwoFA] = useState(true);
  const [saving, setSaving] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  const loadSettings = useServerFn(getSettingsFn);
  const persistSettings = useServerFn(saveSettingsFn);

  useEffect(() => {
    let active = true;
    loadSettings()
      .then((s) => {
        if (!active) return;
        if (s.orgName) setOrgName(s.orgName);
        if (s.orgEmail) setEmail(s.orgEmail);
        setEmailNotif(s.emailNotif);
        setSmsNotif(s.smsNotif);
        setTwoFA(s.twoFa);
        setLang(s.lang);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setOrgLogo(url);
      if (typeof window !== "undefined") {
        localStorage.setItem("vba_active_assoc_logo", url);
        localStorage.setItem("crm_system_logo", url);
        window.dispatchEvent(
          new CustomEvent("crm-branding-changed", {
            detail: { logoUrl: url, name: orgName },
          }),
        );
        window.dispatchEvent(
          new CustomEvent("association-changed", {
            detail: { logoUrl: url, name: orgName },
          }),
        );
      }
      toast.success("Đã cập nhật logo header sidebar thành công!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleResetDefaultLogo = () => {
    const def = "/icons/ceo1983_icon_1/image 6.png";
    setOrgLogo(def);
    if (typeof window !== "undefined") {
      localStorage.setItem("vba_active_assoc_logo", def);
      localStorage.setItem("crm_system_logo", def);
      window.dispatchEvent(
        new CustomEvent("crm-branding-changed", {
          detail: { logoUrl: def, name: orgName },
        }),
      );
      window.dispatchEvent(
        new CustomEvent("association-changed", {
          detail: { logoUrl: def, name: orgName },
        }),
      );
    }
    toast.success("Đã đặt lại logo mặc định CEO 1983");
  };

  const save = async () => {
    setSaving(true);
    try {
      await persistSettings({
        data: { orgName, orgEmail: email, lang, emailNotif, smsNotif, twoFa: twoFA },
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("vba_active_assoc_name", orgName);
        localStorage.setItem("crm_system_name", orgName);
        localStorage.setItem("vba_active_assoc_logo", orgLogo);
        localStorage.setItem("crm_system_logo", orgLogo);
        window.dispatchEvent(
          new CustomEvent("crm-branding-changed", {
            detail: { name: orgName, logoUrl: orgLogo },
          }),
        );
        window.dispatchEvent(
          new CustomEvent("association-changed", {
            detail: { name: orgName, logoUrl: orgLogo },
          }),
        );
      }
      toast.success(t("common.savedToast"));
    } catch {
      toast.error(t("common.saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title={t("set.title")} subtitle={t("set.subtitle")} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
        <Card className="p-2">
          <nav className="space-y-0.5">
            {TABS.map((tt) => {
              const Icon = tt.icon;
              const active = tab === tt.key;
              return (
                <button
                  key={tt.key}
                  onClick={() => setTab(tt.key)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-secondary font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t(tt.label as TKey)}
                </button>
              );
            })}
          </nav>
        </Card>

        <Card className="p-6">
          {tab === "general" && (
            <div className="space-y-5">
              <div>
                <h3 className="mb-1 text-base font-semibold text-foreground">
                  {t("set.org.title")}
                </h3>
                <p className="text-xs text-muted-foreground">{t("set.org.desc")}</p>
              </div>

              {/* Header Sidebar Branding Section */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Image className="h-4 w-4 text-primary" />
                    Logo & Tên Tổ Chức Trên Header Sidebar
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tùy chỉnh logo và tên hiển thị trực tiếp ở phần đầu thanh menu điều hướng bên trái CRM
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative group cursor-pointer" onClick={() => logoFileRef.current?.click()}>
                    <img
                      src={orgLogo}
                      alt="Logo Sidebar"
                      className="h-16 w-16 rounded-xl object-contain bg-card p-1 border-2 border-primary/30 shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <input
                      ref={logoFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => logoFileRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Tải ảnh logo sidebar mới</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetDefaultLogo}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary transition cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Đặt về logo CEO 1983</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Hỗ trợ PNG, SVG, JPG, WebP. Thay đổi có hiệu lực ngay lập tức trên thanh Sidebar.
                    </span>
                  </div>
                </div>
              </div>

              <AssociationLogoUploader />
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  {t("set.org.name")}
                </label>
                <input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  {t("set.org.email")}
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  {t("set.org.lang")}
                </label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as any)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                  <option value="lo">ພາສາລາວ</option>
                  <option value="km">ភាសាខ្មែរ</option>
                  <option value="my">မြန်မာဘာသာ</option>
                </select>
              </div>
            </div>
          )}

          {tab === "landing" && <AssociationLandingEditor />}

          {tab === "domain" && <AssociationDomainEditor />}

          {tab === "templates" && <ReplyTemplatesEditor />}

          {tab === "notifications" && (
            <div className="space-y-5">
              <div>
                <h3 className="mb-1 text-base font-semibold text-foreground">
                  {t("set.notif.title")}
                </h3>
                <p className="text-xs text-muted-foreground">{t("set.notif.desc")}</p>
              </div>
              <ToggleRow
                icon={Mail}
                label={t("set.notif.email")}
                desc={t("set.notif.emailDesc")}
                checked={emailNotif}
                onChange={setEmailNotif}
              />
              <ToggleRow
                icon={Bell}
                label={t("set.notif.sms")}
                desc={t("set.notif.smsDesc")}
                checked={smsNotif}
                onChange={setSmsNotif}
              />
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-5">
              <div>
                <h3 className="mb-1 text-base font-semibold text-foreground">
                  {t("set.sec.title")}
                </h3>
                <p className="text-xs text-muted-foreground">{t("set.sec.desc")}</p>
              </div>
              <ToggleRow
                icon={Lock}
                label={t("set.sec.2fa")}
                desc={t("set.sec.2faDesc")}
                checked={twoFA}
                onChange={setTwoFA}
              />
              <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted">
                {t("common.changePassword")}
              </button>
            </div>
          )}

          {tab === "integrations" && (
            <div className="space-y-5">
              <div>
                <h3 className="mb-1 text-base font-semibold text-foreground">
                  {t("set.int.title")}
                </h3>
                <p className="text-xs text-muted-foreground">{t("set.int.desc")}</p>
              </div>
              {[
                { name: "Zalo Official Account", connected: true },
                { name: "Google Workspace", connected: true },
                { name: "Microsoft Teams", connected: false },
                { name: "Slack", connected: false },
              ].map((i) => (
                <div
                  key={i.name}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <span className="text-sm font-medium text-foreground">{i.name}</span>
                  <button
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      i.connected
                        ? "border border-border bg-background text-foreground hover:bg-muted"
                        : "text-primary-foreground shadow-[var(--shadow-glow)]"
                    }`}
                    style={i.connected ? undefined : { background: "var(--gradient-primary)" }}
                  >
                    {i.connected ? t("common.disconnect") : t("common.connect")}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab !== "landing" && tab !== "domain" && tab !== "templates" && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-50"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Save className="h-4 w-4" />
                {t("common.save")}
              </button>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  desc,
  checked,
  onChange,
}: {
  icon: typeof Bell;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="text-sm font-medium text-foreground">{label}</div>
          <div className="text-[11px] text-muted-foreground">{desc}</div>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-primary" : "bg-secondary"}`}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}
