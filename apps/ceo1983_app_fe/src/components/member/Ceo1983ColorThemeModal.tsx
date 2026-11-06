import { X, Palette, Sparkles } from "lucide-react";
import { Ceo1983ColorThemeSelector } from "./Ceo1983ColorThemeSelector";

interface Ceo1983ColorThemeModalProps {
  open: boolean;
  onClose: () => void;
}

export function Ceo1983ColorThemeModal({ open, onClose }: Ceo1983ColorThemeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0E172A] border border-slate-200 dark:border-amber-400/30 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-amber-500/15 text-amber-500 dark:text-amber-400 grid place-items-center border border-amber-400/30">
              <Palette className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Bộ Màu Nhận Diện CEO 1983
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                4 dạng màu tiêu chuẩn theo Brandbook chính thức
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 grid place-items-center hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <Ceo1983ColorThemeSelector
            onSelected={() => {
              // Option selected
            }}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-400" />
            Lưu độc lập trên thiết bị của bạn
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#003B95] hover:bg-[#002B70] text-white font-bold text-xs shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};
