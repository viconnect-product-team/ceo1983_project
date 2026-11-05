import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  Building2,
  CreditCard,
  Globe,
  Layout,
  Lock,
  Mail,
  MessageSquareText,
  Save,
  Shield,
  Smartphone,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, PageHeader } from "@/components/dashboard/PageKit";
import { AssociationLogoUploader } from "@/components/dashboard/AssociationLogoUploader";
import { LandingWebManager } from "@/components/dashboard/LandingWebManager";
import { TrafficManagerSection } from "@/components/dashboard/TrafficManagerSection";
import { AssociationDomainEditor } from "@/components/dashboard/AssociationDomainEditor";
import { OmnichannelTemplatesSection } from "@/components/dashboard/OmnichannelTemplatesSection";
import { ZaloOaConfigSection } from "@/components/dashboard/ZaloOaConfigSection";
import { VNPayConfigSection } from "@/components/dashboard/VNPayConfigSection";
import { MoMoConfigSection } from "@/components/dashboard/MoMoConfigSection";
import { ZaloMiniAppConfigSection } from "@/components/dashboard/ZaloMiniAppConfigSection";
import { getSettingsFn, saveSettingsFn } from "@/lib/settings.functions";
import { useLang, useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

const TABS = [
  { key: "general", labelKey: "set.tab.general", defaultLabel: "Thông tin chung", icon: Building2 },
  { key: "landing", labelKey: "set.tab.landing", defaultLabel: "Trang giới thiệu", icon: Layout },
  { key: "traffic", defaultLabel: "Quản lý lượng truy cập", icon: Activity },
  { key: "domain", labelKey: "set.tab.domain", defaultLabel: "Tên miền hệ thống", icon: Globe },
  { key: "templates", defaultLabel: "Mẫu thông báo", icon: Mail },
  { key: "zalo_oa", defaultLabel: "Cấu hình Zalo OA", icon: MessageSquareText },
  { key: "zalo_miniapp", defaultLabel: "Cấu hình Zalo Mini App", icon: Smartphone },
  { key: "vnpay", defaultLabel: "Thanh toán VNPay", icon: CreditCard },
  { key: "momo", defaultLabel: "Thanh toán MoMo", icon: Wallet },
  { key: "notifications", labelKey: "set.tab.notifications", defaultLabel: "Thông báo hệ thống", icon: Bell },
  { key: "security", labelKey: "set.tab.security", defaultLabel: "Bảo mật & Quyền", icon: Shield },
  { key: "integrations", labelKey: "set.tab.integrations", defaultLabel: "Tích hợp mở rộng", icon: Globe },
] as const;

function SettingsPage() {
  const t = useT();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("general");
  const { lang, setLang } = useLang();
  const [orgName, setOrgName] = useState("CLB Doanh Nhân CEO 1983");
  const [email, setEmail] = useState("contact@ceo1983.vn");
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [twoFA, setTwoFA] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useServerFn(getSettingsFn);
  const persistSettings = useServerFn(saveSettingsFn);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vba_active_assoc_name") || localStorage.getItem("crm_system_name");
      if (stored) setOrgName(stored);

      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab") as (typeof TABS)[number]["key"] | null;
      if (urlTab && TABS.some((t) => t.key === urlTab)) {
        setTab(urlTab);
      }
    }
  }, []);

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
      .catch(() => { });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await persistSettings({
        data: { orgName, orgEmail: email, lang, emailNotif, smsNotif, twoFa: twoFA },
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("vba_active_assoc_name", orgName);
        localStorage.setItem("crm_system_name", orgName);
        window.dispatchEvent(
          new CustomEvent("crm-branding-changed", {
            detail: { name: orgName },
          }),
        );
        window.dispatchEvent(
          new CustomEvent("association-changed", {
            detail: { name: orgName },
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[250px_1fr]">
        <Card className="p-2.5">
          <nav className="space-y-1">
            {TABS.map((tt) => {
              const Icon = tt.icon;
              const active = tab === tt.key;
              const label = "labelKey" in tt && tt.labelKey ? t(tt.labelKey as TKey) : tt.defaultLabel;
              return (
                <button
                  key={tt.key}
                  type="button"
                  onClick={() => setTab(tt.key)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-[#003B95] text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                  <span className="truncate text-left leading-none">{label}</span>
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

          {tab === "landing" && <LandingWebManager onSwitchTab={(newTab) => setTab(newTab as any)} />}

          {tab === "traffic" && <TrafficManagerSection />}

          {tab === "domain" && <AssociationDomainEditor />}

          {tab === "templates" && <OmnichannelTemplatesSection />}

          {tab === "zalo_oa" && <ZaloOaConfigSection />}

          {tab === "vnpay" && <VNPayConfigSection />}

          {tab === "momo" && <MoMoConfigSection />}

          {tab === "zalo_miniapp" && <ZaloMiniAppConfigSection />}

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
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${i.connected
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

          {tab !== "landing" && tab !== "domain" && tab !== "templates" && tab !== "zalo_oa" && tab !== "vnpay" && tab !== "momo" && tab !== "zalo_miniapp" && (
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
