import { useState, useEffect } from "react";
import { Check } from "lucide-react";
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
    toast.success(`Đã áp dụng màu nhận diện CEO 1983!`);
    if (onSelected) onSelected(id);
  };

  // Yêu cầu 6: Phần chọn màu CHỈ HIỆN MÀU (Color Swatches), KHÔNG CẦN HIỆN TEXT CHÚ THÍCH
  return (
    <div className={`flex items-center justify-center gap-4 py-2 ${className}`}>
      {CEO1983_COLOR_THEMES.map((theme) => {
        const isSelected = selectedId === theme.id;
        const mainColor = theme.threeColors[0];
        const darkColor = theme.threeColors[1];
        const accentColor = theme.threeColors[2];

        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => handleSelect(theme.id, theme.name)}
            aria-label={`Chọn màu ${theme.name}`}
            className={`relative size-12 rounded-full p-0.5 transition-all duration-200 cursor-pointer flex items-center justify-center active:scale-95 ${
              isSelected
                ? "ring-3 ring-offset-2 ring-[var(--primary)] ring-offset-white dark:ring-offset-slate-900 scale-110 shadow-md"
                : "hover:scale-105 opacity-85 hover:opacity-100"
            }`}
            style={{
              background: `linear-gradient(135deg, ${mainColor} 0%, ${darkColor} 50%, ${accentColor} 100%)`,
            }}
          >
            {/* Vòng bên trong bo tròn mềm mại */}
            <div className="size-full rounded-full flex items-center justify-center shadow-inner">
              {isSelected && (
                <div className="size-5 rounded-full bg-white/90 text-slate-900 shadow-sm flex items-center justify-center">
                  <Check className="size-3.5 stroke-[3]" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
