import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Settings as Cog,
  Globe,
  Bot,
  Sun,
  Moon,
  Check,
  Palette,
  Sparkles,
  ShieldCheck,
  Bell,
  Headphones,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  ChevronRight,
  LogOut,
  Smartphone,
} from "lucide-react";
import { MemberHeader } from "@/components/member/MemberShell";
import { Ceo1983ColorThemeSelector } from "@/components/member/Ceo1983ColorThemeSelector";
import { useServerData } from "@/hooks/use-server-data";
import { getMyMember, type MyMember } from "@/lib/member-app.functions";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useRole } from "@/hooks/use-role";
import { signOutSession } from "@/lib/business-connect/mobile/auth-session";
import { AccountSecuritySettingsForm } from "@/components/member/AccountSecuritySettingsForm";
import { ContactSupportModal } from "@/components/member/ContactSupportModal";
import { UserGuideModal } from "@/components/member/UserGuideModal";
import {
  isVoiceAiEnabled,
  setVoiceAiEnabled,
  VOICE_AI_EVENT_NAME,
} from "@/components/ai/Ceo1983ChatAssistant";
import { requestNotificationPermission } from "@/lib/notification-permissions";
import { toast } from "sonner";
import {
  getActiveCeo1983ColorTheme,
  COLOR_THEME_EVENT,
  type Ceo1983ColorTheme,
} from "@/lib/ceo1983-color-theme";

export const Route = createFileRoute("/association/system-config")({
  validateSearch: (search: Record<string, unknown>): {
    action?: string;
    required?: string;
  } => ({
    ...(typeof search.action === "string" ? { action: search.action } : {}),
    ...(typeof search.required === "string" ? { required: search.required } : {}),
  }),
  component: AssociationSystemConfigScreen,
});

export function AssociationSystemConfigScreen() {
  const navigate = useNavigate();
  const { required } = Route.useSearch();
  const { user, logout: authLogout } = useAuth();
  const { lang, setLang } = useLang();
  const isEn = lang === "en";
  const { theme, setTheme } = useTheme();
  const { isSuperAdmin } = useRole();
  const hasAdminPrivilege = isSuperAdmin;

  const fetchMember = useServerFn(getMyMember);
  const { data: member } = useServerData<MyMember | null>(() => fetchMember(), null);

  // Modals state
  const [contactSupportOpen, setContactSupportOpen] = useState(false);
  const [userGuideOpen, setUserGuideOpen] = useState(false);

  // Active brand color theme
  const [brandColorTheme, setBrandColorTheme] = useState<Ceo1983ColorTheme>(() =>
    getActiveCeo1983ColorTheme()
  );
  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e?.detail) setBrandColorTheme(e.detail);
      else setBrandColorTheme(getActiveCeo1983ColorTheme());
    };
    window.addEventListener(COLOR_THEME_EVENT, handleThemeChange);
    return () => window.removeEventListener(COLOR_THEME_EVENT, handleThemeChange);
  }, []);

  // AI Assistant Toggle state
  const [voiceAiEnabled, setVoiceAiState] = useState(() => isVoiceAiEnabled());

  useEffect(() => {
    const handleSyncAi = () => {
      setVoiceAiState(isVoiceAiEnabled());
    };
    window.addEventListener(VOICE_AI_EVENT_NAME, handleSyncAi);
    window.addEventListener("ceo1983_ai_toggle", handleSyncAi);
    window.addEventListener("storage", handleSyncAi);
    return () => {
      window.removeEventListener(VOICE_AI_EVENT_NAME, handleSyncAi);
      window.removeEventListener("ceo1983_ai_toggle", handleSyncAi);
      window.removeEventListener("storage", handleSyncAi);
    };
  }, []);

  const handleToggleVoiceAi = () => {
    const nextVal = !voiceAiEnabled;
    setVoiceAiState(nextVal);
    setVoiceAiEnabled(nextVal);
    toast.success(nextVal ? "Đã bật Trợ lý AI CEO 1983" : "Đã tắt Trợ lý AI CEO 1983");
  };

  // Push notifications state
  const [isNotificationEnabled, setIsNotificationEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const pref = localStorage.getItem("vba_push_notifications_enabled");
    if (pref === "false") return false;
    if (typeof Notification !== "undefined" && Notification.permission === "granted") return true;
    return pref === "true";
  });

  const handleToggleNotification = async () => {
    if (!isNotificationEnabled) {
      const res = await requestNotificationPermission();
      if (res === "granted" || (typeof Notification !== "undefined" && Notification.permission === "granted")) {
        setIsNotificationEnabled(true);
        localStorage.setItem("vba_push_notifications_enabled", "true");
        toast.success(isEn ? "Push notifications enabled!" : "Đã bật thông báo đẩy thành công!");
      } else {
        setIsNotificationEnabled(true);
        localStorage.setItem("vba_push_notifications_enabled", "true");
        toast.success(isEn ? "Notification preference saved!" : "Đã lưu cài đặt thông báo!");
      }
    } else {
      setIsNotificationEnabled(false);
      localStorage.setItem("vba_push_notifications_enabled", "false");
      toast.info(isEn ? "Push notifications disabled." : "Đã tắt thông báo đẩy.");
    }
  };

  // Cài đặt ứng dụng PWA / Mobile App nhanh
  const handleFastInstallApp = async () => {
    const isStandalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true);

    if (isStandalone) {
      toast.success("Ứng dụng CEO 1983 đã được cài đặt và đang chạy sẵn sàng trên thiết bị của bạn!");
      return;
    }

    const p = (window as any).__pwaInstallPrompt;
    if (p && typeof p.prompt === "function") {
      try {
        await p.prompt();
        const choice = await p.userChoice;
        if (choice?.outcome === "accepted") {
          toast.success("Ứng dụng đang được tự động cài đặt lên màn hình chính!");
          (window as any).__pwaInstallPrompt = null;
          return;
        }
      } catch (err) {
        console.warn("Fast install prompt error:", err);
      }
    }

    window.dispatchEvent(new CustomEvent("open-install-prompt"));
    window.dispatchEvent(new CustomEvent("open-ios-install-guide"));
  };

  const handleLogout = async () => {
    try {
      await signOutSession();
    } catch (e) {
      console.error("Sign out error:", e);
    }
    authLogout?.();
    navigate({ to: "/association/login" as any, replace: true });
  };

  return (
    <div className="vba-animate pb-28 min-h-screen bg-slate-50 dark:bg-[#070D1A] text-slate-900 dark:text-white">
      <MemberHeader
        title={isEn ? "System Configuration" : "Cấu hình hệ thống"}
        subtitle="Màu sắc • Trợ lý AI • Ngôn ngữ • Đổi mật khẩu"
        back={true}
        onBack={() => navigate({ to: "/association/profile" })}
      />

      <div className="mx-4 mt-4 space-y-4">
        {/* Banner Nhận diện Hội viên & CLB Doanh Nhân CEO 1983 */}
        <div
          style={{
            background: brandColorTheme.gradientCard,
            borderColor: brandColorTheme.darkBorder,
          }}
          className="p-4 rounded-3xl border text-white shadow-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="h-13 w-13 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-amber-400/60">
              <img src="/ceo1983-logo.png" alt="CEO 1983" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-extrabold tracking-widest text-amber-300">
                CLB DOANH NHÂN 1983
              </div>
              <h2 className="text-[15px] font-black text-white leading-snug truncate">
                {member?.name || user?.name || "Hội viên Doanh nhân"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/40">
                  <ShieldCheck className="h-3 w-3 text-amber-300" /> Hội viên chính thức
                </span>
                <span className="text-[11px] text-blue-100 truncate">
                  {member?.title || "CLB CEO 1983"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 1. KHỐI TRỌNG TÂM: BẢO MẬT TÀI KHOẢN & ĐỔI MẬT KHẨU ── */}
        <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                <ShieldCheck className="size-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {isEn ? "Security & Change Password" : "Bảo mật tài khoản & Đổi mật khẩu"}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isEn
                    ? "Manage login password and account safety"
                    : "Đổi mật khẩu đăng nhập, sinh trắc học và quyền riêng tư"}
                </p>
              </div>
            </div>
          </div>

          <AccountSecuritySettingsForm isRequired={required === "true"} />
        </div>

        {/* ── 2. KHỐI TÙY CHỌN MÀU GIAO DIỆN (BRANDBOOK CEO 1983) ── */}
        <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
              <Palette className="size-4 text-amber-500" />
              <span>{isEn ? "Color Theme (Brandbook)" : "Chọn màu giao diện (Brandbook)"}</span>
            </h3>
            <span
              style={{ color: brandColorTheme.primaryColor }}
              className="text-[11px] font-black"
            >
              {brandColorTheme.name}
            </span>
          </div>
          <Ceo1983ColorThemeSelector />
        </div>

        {/* ── 3. KHỐI CHẾ ĐỘ HIỂN THỊ (SÁNG / TỐI) ── */}
        <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
              <Sun className="size-4 text-amber-500" />
              <span>{isEn ? "Appearance Mode" : "Chế độ hiển thị"}</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {theme === "dark" ? "Ban đêm" : "Ban ngày"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setTheme("light");
                toast.success(isEn ? "Light mode enabled" : "Đã chuyển sang giao diện sáng");
              }}
              className={`py-2.5 px-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                theme === "light"
                  ? "border-[#003B95] bg-blue-50 text-[#003B95] shadow-2xs font-black"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
              }`}
            >
              <Sun className="size-4 text-amber-500" />
              <span>{isEn ? "Light Mode" : "Giao diện sáng"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme("dark");
                toast.success(isEn ? "Dark mode enabled" : "Đã chuyển sang giao diện tối");
              }}
              className={`py-2.5 px-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                theme === "dark"
                  ? "border-amber-400 bg-amber-950/40 text-amber-400 shadow-2xs font-black"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
              }`}
            >
              <Moon className="size-4 text-sky-400" />
              <span>{isEn ? "Dark Mode" : "Giao diện tối"}</span>
            </button>
          </div>
        </div>

        {/* ── 4. KHỐI TRỢ LÝ AI (VOICE & CHAT BOT) ── */}
        <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div
                style={{ backgroundColor: `${brandColorTheme.primaryColor}20`, color: brandColorTheme.primaryColor }}
                className="size-10 rounded-2xl grid place-items-center shrink-0 border border-slate-200/50 dark:border-slate-700/50"
              >
                <Bot className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">
                  {isEn ? "AI Voice & Chat Assistant" : "Bật / Tắt Trợ lý AI CEO 1983"}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block line-clamp-1">
                  {voiceAiEnabled
                    ? (isEn ? "Floating AI is active on screen" : "Đang hiển thị trợ lý AI nổi trên màn hình")
                    : (isEn ? "AI is currently turned off" : "Đang tắt / ẩn biểu tượng AI")}
                </span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={voiceAiEnabled}
              onClick={handleToggleVoiceAi}
              className={`w-12 h-6.5 p-0.5 rounded-full flex items-center transition-colors duration-200 ease-in-out cursor-pointer focus:outline-hidden shrink-0 ${
                voiceAiEnabled ? "bg-[#00A86B]" : "bg-slate-300 dark:bg-slate-700"
              }`}
              title="Bật/tắt Trợ lý AI"
            >
              <div
                className={`size-5.5 bg-white rounded-full shadow-md transform transition duration-200 ease-in-out ${
                  voiceAiEnabled ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── 5. KHỐI CHỌN NGÔN NGỮ (LANGUAGE SELECTOR) ── */}
        <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
              <Globe className="size-4 text-blue-500" />
              <span>{isEn ? "Select Language" : "Chọn ngôn ngữ"}</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {lang === "vi" ? "Tiếng Việt" : "English"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setLang("vi");
                toast.success("Đã chuyển sang Tiếng Việt");
              }}
              className={`py-2.5 px-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                lang === "vi"
                  ? "border-[#003B95] dark:border-amber-400 bg-blue-50 dark:bg-amber-950/40 text-[#003B95] dark:text-amber-400 shadow-2xs font-black"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="text-base">🇻🇳</span>
              <span>Tiếng Việt</span>
              {lang === "vi" && <Check className="size-4 text-[#003B95] dark:text-amber-400 ml-auto" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setLang("en");
                toast.success("Switched to English");
              }}
              className={`py-2.5 px-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                lang === "en"
                  ? "border-[#003B95] dark:border-amber-400 bg-blue-50 dark:bg-amber-950/40 text-[#003B95] dark:text-amber-400 shadow-2xs font-black"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="text-base">🇬🇧</span>
              <span>English</span>
              {lang === "en" && <Check className="size-4 text-[#003B95] dark:text-amber-400 ml-auto" />}
            </button>
          </div>
        </div>

        {/* ── 6. KHỐI THÔNG BÁO ĐẨY ── */}
        <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-rose-500" />
              <span>{isEn ? "Notification Settings" : "Cài đặt thông báo"}</span>
            </h3>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="size-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 grid place-items-center shrink-0">
                <Bell className="size-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">
                  {isEn ? "Push Notifications" : "Thông báo đẩy & Tin tức CLB"}
                </span>
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block line-clamp-1">
                  {isNotificationEnabled
                    ? (isEn ? "Enabled notifications" : "Đang bật nhận chuông và tin nhắn")
                    : (isEn ? "Notifications are disabled" : "Đang tắt thông báo")}
                </span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isNotificationEnabled}
              onClick={handleToggleNotification}
              className={`w-12 h-6.5 p-0.5 rounded-full flex items-center transition-colors duration-200 ease-in-out cursor-pointer focus:outline-hidden shrink-0 ${
                isNotificationEnabled ? "bg-[#00A86B]" : "bg-slate-300 dark:bg-slate-700"
              }`}
              title="Bật/tắt Thông báo"
            >
              <div
                className={`size-5.5 bg-white rounded-full shadow-md transform transition duration-200 ease-in-out ${
                  isNotificationEnabled ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── 7. KHỐI CÀI ĐẶT ỨNG DỤNG PWA / MOBILE APP ── */}
        <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-blue-500" />
              <span>{isEn ? "App Installation" : "Cài đặt ứng dụng PWA / Mobile App"}</span>
            </h3>
          </div>

          <button
            type="button"
            onClick={handleFastInstallApp}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-xl bg-[#003B95] text-white grid place-items-center shrink-0 shadow-xs">
                <Smartphone className="size-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-blue-950 dark:text-blue-200 block truncate">
                  {isEn ? "Install App on Home Screen" : "Cài đặt ứng dụng lên màn hình chính"}
                </span>
                <span className="text-[10.5px] text-blue-700 dark:text-blue-300/80 block line-clamp-1">
                  {isEn ? "Add to home screen or install APK" : "Tải ứng dụng hoặc ghim biểu tượng lên iPhone / Android"}
                </span>
              </div>
            </div>
            <div className="size-7 rounded-full bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 flex items-center justify-center shrink-0 ml-2">
              <ChevronRight className="size-4 text-[#003B95] dark:text-blue-400" />
            </div>
          </button>
        </div>

        {/* ── 8. KHỐI LIÊN HỆ & HỖ TRỢ BAN THƯ KÝ ── */}
        <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
              <Headphones className="h-4 w-4 text-rose-500" />
              <span>{isEn ? "Support & Club Secretariat" : "Liên hệ & Hỗ trợ Ban Thư Ký"}</span>
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {/* Hotline */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
                  <Phone className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Hotline Ban Thư Ký</span>
                  <span className="font-bold text-slate-800 dark:text-white block truncate">098.333.1983 / 098.1983.888</span>
                </div>
              </div>
              <a
                href="tel:0983331983"
                className="px-3 py-1 rounded-xl bg-[#00A86B] hover:bg-[#00925d] text-white font-bold text-xs shadow-xs transition shrink-0 cursor-pointer"
              >
                Gọi ngay
              </a>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0">
                  <Mail className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Email tiếp nhận &amp; hỗ trợ</span>
                  <span className="font-bold text-slate-800 dark:text-white block truncate">banthuky@ceo1983.vn</span>
                </div>
              </div>
              <a
                href="mailto:banthuky@ceo1983.vn"
                className="px-2.5 py-1 rounded-xl border border-blue-600 text-[#003B95] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-bold text-xs transition shrink-0 cursor-pointer"
              >
                Gửi thư
              </a>
            </div>

            {/* Trụ sở */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
              <div className="size-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                <MapPin className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Trụ sở CLB Doanh Nhân CEO 1983</span>
                <span className="font-semibold text-slate-800 dark:text-white block text-[11px] leading-snug">
                  Hiệp Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA) - TP. Hà Nội
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setContactSupportOpen(true)}
              className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100/80 transition flex items-center justify-between cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8.5 rounded-xl bg-rose-600 text-white grid place-items-center shrink-0 shadow-xs">
                  <Headphones className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-rose-950 dark:text-rose-200 block truncate">
                    Liên hệ Ban Thư Ký CLB
                  </span>
                  <span className="text-[10px] text-rose-700 dark:text-rose-400 block truncate">
                    Gửi phản ánh, góp ý &amp; hỗ trợ
                  </span>
                </div>
              </div>
              <ChevronRight className="size-4 text-rose-500 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => setUserGuideOpen(true)}
              className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100/80 transition flex items-center justify-between cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8.5 rounded-xl bg-amber-500 text-slate-950 grid place-items-center shrink-0 shadow-xs">
                  <BookOpen className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-200 block truncate">
                    Hướng dẫn sử dụng App
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 block truncate">
                    Cẩm nang &amp; tour tính năng
                  </span>
                </div>
              </div>
              <ChevronRight className="size-4 text-amber-600 shrink-0" />
            </button>
          </div>

          {/* Phân quyền RBAC cho SuperAdmin */}
          {hasAdminPrivilege && (
            <Link
              to="/association/permissions"
              className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 hover:bg-indigo-100/80 transition flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8.5 rounded-xl bg-indigo-600 text-white grid place-items-center shrink-0 shadow-xs">
                  <ShieldCheck className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 block truncate">
                    Phân quyền Ban Quản Trị &amp; Ban Chuyên Môn
                  </span>
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-400 block truncate">
                    Quản lý ma trận vai trò RBAC hệ thống
                  </span>
                </div>
              </div>
              <ChevronRight className="size-4 text-indigo-600 shrink-0" />
            </Link>
          )}
        </div>

        {/* ── 9. NÚT ĐĂNG XUẤT TÀI KHOẢN ── */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-xs"
          >
            <LogOut className="size-4 text-rose-500" />
            <span>Đăng xuất khỏi ứng dụng</span>
          </button>
        </div>
      </div>

      {/* Modals Popup */}
      <ContactSupportModal
        open={contactSupportOpen}
        onClose={() => setContactSupportOpen(false)}
      />

      <UserGuideModal
        open={userGuideOpen}
        onClose={() => setUserGuideOpen(false)}
      />
    </div>
  );
}
