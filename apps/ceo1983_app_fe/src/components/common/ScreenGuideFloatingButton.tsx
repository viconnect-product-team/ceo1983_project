import React, { useState, useEffect } from "react";
import { Sparkles, HelpCircle, Compass, ChevronUp, BookOpen, X } from "lucide-react";
import { UserGuideModal } from "@/components/member/UserGuideModal";
import { GuidedTourModal } from "@/components/common/GuidedTourModal";
import { APP_SCREEN_TOURS, type ScreenGuideItem } from "@/lib/tours/appTourRegistry";

interface ScreenGuideFloatingButtonProps {
  pathname: string;
}

export function ScreenGuideFloatingButton({ pathname }: ScreenGuideFloatingButtonProps) {
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [liveTourOpen, setLiveTourOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Match current route to corresponding screen guide
  const matchingScreen: ScreenGuideItem | undefined = APP_SCREEN_TOURS.find((s) => {
    if (s.route === "/association") {
      return pathname === "/association" || pathname === "/association/";
    }
    return pathname === s.route || pathname.startsWith(s.route + "/");
  });

  // Auto-trigger live tour if requested via localStorage
  useEffect(() => {
    try {
      const trigger = localStorage.getItem("ceo1983_trigger_tour_on_mount");
      const activeScreenTourId = localStorage.getItem("ceo1983_active_screen_tour");

      if (trigger === "1") {
        localStorage.removeItem("ceo1983_trigger_tour_on_mount");
        localStorage.removeItem("ceo1983_active_screen_tour");

        const timer = setTimeout(() => {
          setLiveTourOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [pathname]);

  const activeTourSteps = matchingScreen?.steps || APP_SCREEN_TOURS[0].steps;

  return (
    <>
      {/* Floating Action Button (Glassmorphic Gold & Executive Navy) */}
      <div className="fixed right-3 bottom-[calc(max(env(safe-area-inset-bottom,0px),20px)+74px)] z-40 select-none">
        {menuOpen ? (
          <div className="mb-2 w-56 rounded-2xl border-2 border-amber-400/60 bg-white/95 dark:bg-[#071228]/95 backdrop-blur-xl p-2.5 shadow-2xl text-slate-900 dark:text-white animate-scale-in space-y-1.5">
            <div className="flex items-center justify-between px-1.5 pb-1.5 border-b border-slate-100 dark:border-white/10">
              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>Trợ lý thao tác</span>
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Action 1: Live Tour for Current Screen */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setLiveTourOpen(true);
              }}
              className="w-full text-left p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-slate-900 dark:text-white text-xs font-bold transition flex items-center gap-2 border border-amber-400/40 cursor-pointer"
            >
              <div className="grid h-6 w-6 place-items-center rounded-lg bg-amber-500 text-slate-950 font-black shrink-0">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-black text-[11.5px]">Chỉ dẫn màn này</div>
                <div className="text-[9.5px] text-slate-500 truncate">
                  Spotlight hướng dẫn 4 bước
                </div>
              </div>
            </button>

            {/* Action 2: Open Master Guide Center */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setGuideModalOpen(true);
              }}
              className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-800 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-2 border border-transparent cursor-pointer"
            >
              <div className="grid h-6 w-6 place-items-center rounded-lg bg-[#003B95] text-white shrink-0">
                <BookOpen className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-bold text-[11.5px]">Cẩm nang 10 màn hình</div>
                <div className="text-[9.5px] text-slate-500 truncate">
                  Mô phỏng & Hotline các Ban
                </div>
              </div>
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[linear-gradient(135deg,#F6E1C3_0%,#D8B282_45%,#C29B69_70%,#8C653B_100%)] text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 border border-amber-300/60 hover:brightness-105 active:scale-95 transition cursor-pointer"
          title="Chỉ dẫn thao tác từng màn hình"
        >
          <Sparkles className="h-3.5 w-3.5 text-slate-950 animate-pulse" />
          <span className="hidden sm:inline font-black tracking-tight">Hướng Dẫn</span>
          <span className="sm:hidden font-black">HD</span>
        </button>
      </div>

      {/* Live Spotlight Guided Tour for Current Screen */}
      <GuidedTourModal
        isOpen={liveTourOpen}
        onClose={() => setLiveTourOpen(false)}
        steps={activeTourSteps}
        screenTitle={matchingScreen?.title || "Chỉ dẫn thao tác màn hình"}
        storageKey={`ceo1983_tour_${matchingScreen?.id || "general"}`}
      />

      {/* Full 10-Screen Guide Modal */}
      <UserGuideModal
        open={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        defaultScreenId={matchingScreen?.id}
      />
    </>
  );
}
