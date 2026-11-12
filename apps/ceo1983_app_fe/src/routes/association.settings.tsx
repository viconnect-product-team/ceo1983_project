import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ShieldCheck,
  Settings as Cog,
  Globe,
  Bot,
  Sparkles,
  Headphones,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  ChevronRight,
  Check,
  LogOut,
  Smartphone,
  Palette,
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
import { toast } from "sonner";

export const Route = createFileRoute("/association/settings")({
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
        title={isEn ? "Settings" : "Cài đặt"}
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

        {/* 1. ĐIỀU HƯỚNG SANG CHỨC NĂNG RIÊNG: CẤU HÌNH HỆ THỐNG (MÀU SẮC, AI, NGÔN NGỮ) */}
        <Link
          to="/association/system-config"
          className="p-4 rounded-3xl bg-gradient-to-r from-orange-50 via-amber-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-orange-200 dark:border-amber-400/30 flex items-center justify-between shadow-xs hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white grid place-items-center shrink-0 shadow-md">
              <Palette className="size-5.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate group-hover:text-orange-600 dark:group-hover:text-amber-400 transition">
                {isEn ? "System Settings (Themes & AI)" : "Cài đặt (Giao diện & AI)"}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block line-clamp-1">
                {isEn ? "Customize brand color themes, Voice AI, and language" : "Chọn màu giao diện, Bật tắt AI, Chọn ngôn ngữ"}
              </span>
            </div>
          </div>
          <div className="size-8 rounded-full bg-white dark:bg-slate-800 border border-orange-200/80 dark:border-slate-700 flex items-center justify-center shrink-0 ml-2 group-hover:translate-x-1 transition">
            <ChevronRight className="size-4 text-orange-600 dark:text-amber-400" />
          </div>
        </Link>

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
