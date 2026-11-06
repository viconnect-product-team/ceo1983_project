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

        {/* Modal Hướng Dẫn Tương Tác Chuẩn Ngân Hàng (khi người dùng mở từ menu/chức năng AI) */}
        <ViOneAiTutorGuide
          isOpen={showAiTour}
          onClose={() => setShowAiTour(false)}
          systemType="crm"
        />
      </div>
    </CommandPaletteProvider>
  );
}
