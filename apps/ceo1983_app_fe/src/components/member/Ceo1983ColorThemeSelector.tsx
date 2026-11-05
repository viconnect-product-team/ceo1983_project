import { useState, useEffect } from "react";
import { Check, Palette } from "lucide-react";
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
    toast.success(`Đã áp dụng bộ màu "${name}" CEO 1983!`, {
      description: "Toàn bộ nút bấm, viền và điểm nhấn đã được đổi mới đồng bộ.",
    });
    if (onSelected) onSelected(id);
  };

  if (compact) {
    return (
      <div className={`grid grid-cols-3 gap-2 ${className}`}>
        {CEO1983_COLOR_THEMES.map((theme) => {
          const isSelected = selectedId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleSelect(theme.id, theme.name)}
              className={`p-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-md ring-1 ring-[var(--primary)]"
                  : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center -space-x-1.5">
                  <div
                    className="size-4.5 rounded-full shadow-xs border border-white/60 shrink-0"
                    style={{ backgroundColor: theme.threeColors[0] }}
                  />
                  <div
                    className="size-4.5 rounded-full shadow-xs border border-white/60 shrink-0"
                    style={{ backgroundColor: theme.threeColors[1] }}
                  />
                  <div
                    className="size-4.5 rounded-full shadow-xs border border-white/60 shrink-0"
                    style={{ backgroundColor: theme.threeColors[2] }}
                  />
                </div>
                {isSelected && (
                  <span className="size-4 rounded-full bg-[var(--primary)] text-white grid place-items-center shrink-0">
                    <Check className="size-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <div className="text-[12px] font-bold text-slate-900 dark:text-white truncate">
                {theme.name}
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
          <div className="size-8 rounded-xl bg-[var(--primary)] text-white grid place-items-center shadow-xs">
            <Palette className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              3 Kiểu Màu Chủ Đạo CEO 1983
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Chọn phong cách hiển thị màu sắc theo nhận diện thương hiệu
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CEO1983_COLOR_THEMES.map((theme) => {
          const isSelected = selectedId === theme.id;
          return (
            <div
              key={theme.id}
              onClick={() => handleSelect(theme.id, theme.name)}
              className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 dark:bg-slate-900 shadow-md ring-2 ring-[var(--primary)]"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
              }`}
            >
              {/* Top: 3 Swatches + Check */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center -space-x-2">
                  <span
                    className="size-6 rounded-full shadow-md border-2 border-white dark:border-slate-800 z-30"
                    style={{ backgroundColor: theme.threeColors[0] }}
                    title={`Màu chính: ${theme.threeColors[0]}`}
                  />
                  <span
                    className="size-6 rounded-full shadow-md border-2 border-white dark:border-slate-800 z-20"
                    style={{ backgroundColor: theme.threeColors[1] }}
                    title={`Nền tối: ${theme.threeColors[1]}`}
                  />
                  <span
                    className="size-6 rounded-full shadow-md border-2 border-white dark:border-slate-800 z-10"
                    style={{ backgroundColor: theme.threeColors[2] }}
                    title={`Điểm nhấn: ${theme.threeColors[2]}`}
                  />
                </div>

                <div
                  className={`size-5 rounded-full grid place-items-center transition-all ${
                    isSelected
                      ? "bg-[var(--primary)] text-white scale-110 shadow-xs"
                      : "border border-slate-300 dark:border-slate-700 text-transparent"
                  }`}
                >
                  <Check className="size-3 stroke-[3]" />
                </div>
              </div>

              {/* Title & Subtitle - KHÔNG DÙNG MÔ TẢ DÀI */}
              <div className="space-y-0.5 mb-2.5">
                <h4 className="text-[13px] font-extrabold text-slate-900 dark:text-white transition-colors">
                  {theme.name}
                </h4>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {theme.subtitle}
                </div>
              </div>

              {/* Bottom: 3 Hex Codes & Status */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 font-mono text-[9.5px] text-slate-400 dark:text-slate-500">
                  <span>{theme.threeColors[0]}</span>
                  <span>•</span>
                  <span>{theme.threeColors[2]}</span>
                </div>
                <span
                  className={`font-bold transition-colors ${
                    isSelected ? "text-[var(--primary)] font-extrabold" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  }`}
                >
                  {isSelected ? "Đang áp dụng ✓" : "Áp dụng"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
