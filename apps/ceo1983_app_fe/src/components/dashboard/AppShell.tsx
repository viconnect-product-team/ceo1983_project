import { useState, useEffect, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { MobileMenuDrawer } from "./MobileMenuDrawer";
import { CommandPaletteProvider } from "./CommandPalette";
import { ViOneAiTutorGuide } from "@/components/common/ViOneAiTutorGuide";
import { Bot, Sparkles } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAiTour, setShowAiTour] = useState(false);

  useEffect(() => {
    const handleOpenTour = () => setShowAiTour(true);
    window.addEventListener("crm:open_ai_tour", handleOpenTour);
    return () => window.removeEventListener("crm:open_ai_tour", handleOpenTour);
  }, []);

  return (
    <CommandPaletteProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Mobile drawer (swipe + tap-outside to close) */}
        <MobileMenuDrawer open={mobileOpen} onOpenChange={setMobileOpen} />

        <div className="flex min-w-0 flex-1 flex-col bg-slate-50 dark:bg-slate-950">
          <Topbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 min-w-0 bg-crm-system px-4 py-6 lg:px-8">{children}</main>
          <BottomNav onMenuClick={() => setMobileOpen(true)} />
        </div>

        {/* Nút Floating Cố Vấn Số AI Hướng Dẫn Thao Tác CRM */}
        <div className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAiTour(true)}
            className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/25 hover:scale-105 transition cursor-pointer border border-amber-300"
            title="Mở Trợ lý Hướng dẫn Thao tác CRM (AI Tutor)"
          >
            <div className="size-5 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center">
              <Bot className="size-3.5" />
            </div>
            <span>Hướng Dẫn AI CRM</span>
          </button>
        </div>

        {/* Modal Hướng Dẫn Tương Tác Chuẩn Ngân Hàng ("Giáo Viên Đứng Cạnh Bảng") */}
        <ViOneAiTutorGuide
          isOpen={showAiTour}
          onClose={() => setShowAiTour(false)}
          systemType="crm"
        />
      </div>
    </CommandPaletteProvider>
  );
}
