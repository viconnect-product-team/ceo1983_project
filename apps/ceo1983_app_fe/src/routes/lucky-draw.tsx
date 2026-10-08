import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/dashboard/AppShell";
import { LuckyDrawLandingBanner } from "@/components/dashboard/LuckyDrawLandingBanner";
import { ArrowLeft, Sparkles, Gift } from "lucide-react";

export const Route = createFileRoute("/lucky-draw")({
  component: LuckyDrawRoutePage,
});

function LuckyDrawRoutePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              to="/voting"
              search={{ tab: "all", page: 1, size: 10 }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại Biểu quyết & Sự kiện</span>
            </Link>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Chương Trình Bốc Thăm Trúng Thưởng & Vinh Danh</span>
          </div>
        </div>

        {/* Landing Page Banner Showcase */}
        <LuckyDrawLandingBanner />
      </div>
    </AppShell>
  );
}
