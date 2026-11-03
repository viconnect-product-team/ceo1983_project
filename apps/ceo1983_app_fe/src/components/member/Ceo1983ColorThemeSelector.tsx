import { useState, useEffect } from "react";
import { Check, Sparkles, Palette, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  CEO1983_COLOR_THEMES,
  getActiveCeo1983ColorThemeId,
  applyCeo1983ColorTheme,
  type Ceo1983ColorThemeId,
  COLOR_THEME_EVENT,
} from "../../lib/ceo1983-color-theme";

interface Ceo1983ColorThemeSelectorProps {
  onSelected?: (id: Ceo1983ColorThemeId) => void;
  className?: string;
  compact?: boolean;
}

export function Ceo1983ColorThemeSelector({
  onSelected,
  className = "",
  compact = false,
}: Ceo1983ColorThemeSelectorProps) {
  const [selectedId, setSelectedId] = useState<Ceo1983ColorThemeId>(getActiveCeo1983ColorThemeId());

  useEffect(() => {
    setSelectedId(getActiveCeo1983ColorThemeId());

    const handleThemeChanged = (e: any) => {
      if (e.detail && e.detail.id) {
        setSelectedId(e.detail.id);
      }
    };

    window.addEventListener(COLOR_THEME_EVENT, handleThemeChanged);
    return () => {
      window.removeEventListener(COLOR_THEME_EVENT, handleThemeChanged);
    };
  }, []);

  const handleSelect = (id: Ceo1983ColorThemeId, name: string) => {
    setSelectedId(id);
    applyCeo1983ColorTheme(id);
    toast.success(`Đã áp dụng bộ màu "${name}" chuẩn Brandbook CEO 1983!`, {
      description: "Toàn bộ giao diện và icon đã được cập nhật đồng bộ.",
    });
    if (onSelected) onSelected(id);
  };

  if (compact) {
    return (
      <div className={`grid grid-cols-2 gap-2.5 ${className}`}>
        {CEO1983_COLOR_THEMES.map((theme) => {
          const isSelected = selectedId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleSelect(theme.id, theme.name)}
              className={`p-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "border-amber-400 bg-amber-500/10 shadow-[0_4px_16px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50"
                  : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0E172A] hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className="size-4.5 rounded-full shadow-xs border border-white/40 shrink-0"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <div
                    className="size-4.5 rounded-full shadow-xs border border-white/40 -ml-2.5 shrink-0"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                </div>
                {isSelected && (
                  <span className="size-4 rounded-full bg-amber-500 text-slate-950 grid place-items-center shrink-0">
                    <Check className="size-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <div className="text-[12px] font-bold text-slate-900 dark:text-white truncate">
                {theme.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {theme.subtitle}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 grid place-items-center shadow-xs">
            <Palette className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              4 Dạng Màu Tiêu Chuẩn CEO 1983
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-400/30">
                Brandbook
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Chọn phong cách hiển thị màu sắc theo quy chuẩn nhận diện thương hiệu
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CEO1983_COLOR_THEMES.map((theme) => {
          const isSelected = selectedId === theme.id;
          return (
            <div
              key={theme.id}
              onClick={() => handleSelect(theme.id, theme.name)}
              className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? "border-amber-400 bg-amber-500/10 dark:bg-[#0E172A] shadow-[0_6px_20px_rgba(245,158,11,0.22)] ring-1.5 ring-amber-400"
                  : "border-slate-200 dark:border-amber-500/20 bg-white dark:bg-[#0E172A]/70 hover:border-amber-400/50 hover:shadow-md"
              }`}
            >
              {/* Header card with swatches and badge */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <span
                      className="size-6 rounded-full shadow-md border-2 border-white dark:border-slate-900"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <span
                      className="size-6 rounded-full shadow-md border-2 border-white dark:border-slate-900 -ml-2.5"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  </div>
                  <span className={`text-[10.5px] font-black uppercase px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>
                    {theme.tag}
                  </span>
                </div>

                <div
                  className={`size-5 rounded-full grid place-items-center transition-all ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 scale-110 shadow-xs"
                      : "border border-slate-300 dark:border-slate-700 text-transparent"
                  }`}
                >
                  <Check className="size-3 stroke-[3]" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1 mb-3">
                <h4 className="text-[13px] font-extrabold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                  {theme.name}
                </h4>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {theme.subtitle}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300/90 leading-relaxed line-clamp-2">
                  {theme.description}
                </p>
              </div>

              {/* Bottom palette indicator */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2 font-mono text-slate-400">
                  <span>{theme.primaryColor}</span>
                  <span>•</span>
                  <span>{theme.accentColor}</span>
                </div>
                <span
                  className={`font-bold transition-colors ${
                    isSelected ? "text-amber-500 dark:text-amber-400 font-extrabold" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                  }`}
                >
                  {isSelected ? "Đang áp dụng ✓" : "Chọn dạng này"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
