import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Settings as Cog,
  Globe,
  Bot,
  Sparkles,
  Sun,
  Moon,
  Bell,
  Headphones,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  ChevronRight,
  Check,
  LogOut,
  Smartphone,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MemberHeader } from "@/components/member/MemberShell";
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

export const Route = createFileRoute("/association/settings")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): {
    action?: string;
    required?: string;
  } => ({
    ...(typeof search.action === "string" ? { action: search.action } : {}),
    ...(typeof search.required === "string" ? { required: search.required } : {}),
  }),
  component: AssociationSettingsScreen,
});

function AssociationSettingsScreen() {
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

  const handleBackToLogin = async () => {
    await signOutSession();
    authLogout?.();
    navigate({ to: "/association/login" as any, replace: true });
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
        title={isEn ? "System Settings & Security" : "Cài đặt hệ thống & Bảo mật"}
        subtitle="Hiệp hội Doanh nhân CEO 1983"
        back={true}
        onBack={required === "true" ? handleBackToLogin : undefined}
      />

      <div className="mx-4 mt-4 space-y-4">
        {/* CEO 1983 Association Badge Header */}
        <div className="p-4 rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-[#00224F] via-[#003B95] to-[#0A1A3A] text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 border border-amber-400/60">
              <img src="/ceo1983-logo.png" alt="CEO 1983" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-extrabold tracking-widest text-amber-300">
                CLB DOANH NHÂN 1983
              </div>
              <h2 className="text-[16px] font-black text-white leading-snug truncate">
                {member?.name || user?.name || "Hội viên Doanh nhân"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 rounded bg-amber-400/20 px-1.5 py-0.5 text-[9.5px] font-bold text-amber-300 border border-amber-400/40">
                  <ShieldCheck className="h-3 w-3 text-amber-300" /> {(user as any)?.code || member?.code || "M1983-MEMBER"}
                </span>
                <span className="text-[11px] text-blue-100 truncate">
                  {member?.title || "Hội viên chính thức"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. KHỐI CÀI ĐẶT HỆ THỐNG */}
        <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
              <Cog className="h-4 w-4 text-amber-500" />
              <span>{isEn ? "System Settings" : "Cài đặt hệ thống"}</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              CEO 1983 App
            </span>
          </div>

          {/* Mục 1: Chọn ngôn ngữ (Language Selector) */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-400 grid place-items-center shrink-0">
                  <Globe className="size-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white block">
                    {isEn ? "Display Language" : "Ngôn ngữ hiển thị"}
                  </span>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block">
                    {lang === "vi" ? "Đang chọn Tiếng Việt" : "Selected English"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setLang("vi");
                  toast.success("Đã chuyển sang Tiếng Việt");
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  lang === "vi"
                    ? "border-[#003B95] dark:border-amber-400 bg-blue-50 dark:bg-amber-950/40 text-[#003B95] dark:text-amber-400 shadow-2xs"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="text-sm">🇻🇳</span>
                <span>Tiếng Việt</span>
                {lang === "vi" && <Check className="size-3.5 text-[#003B95] dark:text-amber-400 ml-auto" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLang("en");
                  toast.success("Switched to English");
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  lang === "en"
                    ? "border-[#003B95] dark:border-amber-400 bg-blue-50 dark:bg-amber-950/40 text-[#003B95] dark:text-amber-400 shadow-2xs"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="text-sm">🇬🇧</span>
                <span>English</span>
                {lang === "en" && <Check className="size-3.5 text-[#003B95] dark:text-amber-400 ml-auto" />}
              </button>
            </div>
          </div>

          {/* Mục 2: Bật/Tắt Trợ lý AI CEO 1983 */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="size-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 grid place-items-center shrink-0">
                <Bot className="size-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">
                  {isEn ? "AI Voice & Chat Assistant" : "Trợ lý điều khiển & Trò chuyện AI"}
                </span>
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block line-clamp-1">
                  {voiceAiEnabled
                    ? (isEn ? "Floating AI bot is visible on screen" : "Đang hiển thị trợ lý AI nổi trên màn hình")
                    : (isEn ? "AI bot is currently hidden" : "Đang tắt / ẩn trợ lý AI")}
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

          {/* Mục 3: Giao diện hiển thị (Theme sáng / tối) */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white block">
                    {isEn ? "Appearance Mode" : "Giao diện hiển thị"}
                  </span>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block">
                    {theme === "dark" ? "Chế độ ban đêm (Dark Mode)" : "Chế độ ban ngày (Light Mode)"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setTheme("light");
                  toast.success(isEn ? "Light mode enabled" : "Đã chuyển sang giao diện sáng");
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  theme === "light"
                    ? "border-[#003B95] bg-blue-50 text-[#003B95] shadow-2xs font-extrabold"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Sun className="size-4 text-amber-500" />
                <span>{isEn ? "Light" : "Giao diện sáng"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme("dark");
                  toast.success(isEn ? "Dark mode enabled" : "Đã chuyển sang giao diện tối");
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  theme === "dark"
                    ? "border-amber-400 bg-amber-950/40 text-amber-400 shadow-2xs font-extrabold"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Moon className="size-4 text-sky-400" />
                <span>{isEn ? "Dark" : "Giao diện tối"}</span>
              </button>
            </div>
          </div>

          {/* Mục 4: Thông báo đẩy & Tin nhắn nền */}
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

        {/* 2. KHỐI CÁC TRƯỜNG LIÊN HỆ & HỖ TRỢ BAN THƯ KÝ */}
        <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
              <Headphones className="h-4 w-4 text-rose-500" />
              <span>Các trường liên hệ &amp; Hỗ trợ Ban Thư Ký</span>
            </h3>
          </div>

          {/* Thông tin liên hệ nhanh: Hotline + Email Ban Thư Ký */}
          <div className="space-y-2 text-xs">
            {/* Hotline Ban Thư Ký */}
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

            {/* Email Ban Thư Ký */}
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

            {/* Địa chỉ trụ sở văn phòng CLB */}
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

          {/* 2 Nút mở popup tương tác trực tiếp */}
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

          {/* Nếu có quyền quản trị */}
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

        {/* 3. KHỐI CÀI ĐẶT & BẢO MẬT TÀI KHOẢN (ĐỔI TÊN ĐĂNG NHẬP, SĐT & MẬT KHẨU) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003B95] dark:text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              <span>Bảo mật tài khoản &amp; Đổi mật khẩu</span>
            </h3>
          </div>
          <AccountSecuritySettingsForm isRequired={required === "true"} />
        </div>

        {/* 4. NÚT ĐĂNG XUẤT TÀI KHOẢN */}
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
