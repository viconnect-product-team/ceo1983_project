import { useState, useEffect } from "react";
import { X, Palette, Check, Sparkles, Moon, Flag, Gift, Crown } from "lucide-react";
import {
  FESTIVAL_THEMES,
  getActiveEventThemeType,
  setActiveEventThemeType,
  isEventThemeEnabled,
  setEventThemeEnabled,
  type EventThemeType,
} from "./SeasonalEventHeader";
import { toast } from "sonner";

interface AppThemeSelectorModalProps {
  open: boolean;
  onClose: () => void;
}

export function AppThemeSelectorModal({ open, onClose }: AppThemeSelectorModalProps) {
  const [enabled, setEnabled] = useState(isEventThemeEnabled());
  const [currentTheme, setCurrentTheme] = useState<EventThemeType>(getActiveEventThemeType());

  useEffect(() => {
    if (open) {
      setEnabled(isEventThemeEnabled());
      setCurrentTheme(getActiveEventThemeType());
    }
  }, [open]);

  if (!open) return null;

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    setEventThemeEnabled(checked);
    toast.success(
      checked
        ? "Đã bật hiệu ứng chủ đề lễ hội trên App Hiệp hội!"
        : "Đã tắt hiệu ứng chủ đề (áp dụng giao diện tối giản chuẩn)."
    );
  };

  const handleSelectTheme = (tId: EventThemeType) => {
    setCurrentTheme(tId);
    setActiveEventThemeType(tId);
    toast.success(
      `Đã chuyển sang chủ đề "${FESTIVAL_THEMES.find((x) => x.id === tId)?.name || tId}"!`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Chủ Đề & Không Gian Lễ Hội
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tùy chỉnh giao diện App Hiệp hội theo dịp lễ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Enable / Disable Toggle Switch */}
        <div className="my-4 flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Bật / Tắt Chủ Đề Trên App
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {enabled ? "Đang hiển thị không gian lễ hội" : "Đang dùng giao diện tối giản"}
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => handleToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {/* Theme List */}
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {FESTIVAL_THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelectTheme(theme.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                    style={{ background: theme.bannerGradient }}
                  >
                    <span>{theme.iconEmoji}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {theme.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold">
                        {theme.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {theme.tagline}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <div className="h-6 w-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border border-slate-300 dark:border-slate-700" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-900 shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, #F6E1C3 0%, #D8B282 45%, #C29B69 70%, #8C653B 100%)",
            }}
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}
