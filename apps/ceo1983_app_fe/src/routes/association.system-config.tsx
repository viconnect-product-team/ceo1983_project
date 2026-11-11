import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Settings as Cog,
  Globe,
  Bot,
  Check,
  Palette,
  Sparkles,
} from "lucide-react";
import { MemberHeader } from "@/components/member/MemberShell";
import { Ceo1983ColorThemeSelector } from "@/components/member/Ceo1983ColorThemeSelector";
import { useLang } from "@/lib/i18n";
import {
  isVoiceAiEnabled,
  setVoiceAiEnabled,
  VOICE_AI_EVENT_NAME,
} from "@/components/ai/Ceo1983ChatAssistant";
import { toast } from "sonner";
import { getActiveCeo1983ColorTheme, COLOR_THEME_EVENT, type Ceo1983ColorTheme } from "@/lib/ceo1983-color-theme";

export const Route = createFileRoute("/association/system-config")({
  component: AssociationSystemConfigScreen,
});

export function AssociationSystemConfigScreen() {
  const navigate = useNavigate();
  const { lang, setLang } = useLang();
  const isEn = lang === "en";

  // Active brand color theme
  const [brandColorTheme, setBrandColorTheme] = useState<Ceo1983ColorTheme>(() => getActiveCeo1983ColorTheme());
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

  return (
    <div className="vba-animate pb-28 min-h-screen bg-slate-50 dark:bg-[#070D1A] text-slate-900 dark:text-white">
      <MemberHeader
        title={isEn ? "System Configuration" : "Cấu hình hệ thống"}
        subtitle="Màu sắc • Trợ lý AI • Ngôn ngữ"
        back={true}
        onBack={() => navigate({ to: "/association/profile" })}
      />

      <div className="mx-4 mt-4 space-y-4">
        {/* Banner tiêu đề chức năng riêng biệt */}
        <div
          style={{
            background: brandColorTheme.gradientCard,
            borderColor: brandColorTheme.darkBorder,
          }}
          className="p-4 rounded-3xl border text-white shadow-md relative overflow-hidden"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div
              style={{ background: brandColorTheme.gradientPrimary }}
              className="h-12 w-12 rounded-2xl p-2.5 shadow-md flex items-center justify-center shrink-0 border border-white/20"
            >
              <Palette className="size-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-300">
                TÙY CHỈNH HỆ THỐNG
              </span>
              <h2 className="text-base font-bold text-white leading-tight truncate">
                Giao Diện &amp; Trợ Lý AI
              </h2>
              <p className="text-[11px] text-slate-200 mt-0.5">
                Thiết lập nhận diện màu sắc, ngôn ngữ và Trợ lý AI thông minh
              </p>
            </div>
          </div>
        </div>

        {/* 1. CHỌN MÀU GIAO DIỆN (BRANDBOOK CEO 1983) */}
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

        {/* 2. BẬT TẮT TRỢ LÝ AI (VOICE & CHAT BOT) */}
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

        {/* 3. CHỌN NGÔN NGỮ (LANGUAGE SELECTOR) */}
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
      </div>
    </div>
  );
}

