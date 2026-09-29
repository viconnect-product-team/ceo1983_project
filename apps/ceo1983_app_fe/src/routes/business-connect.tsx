// BC-UI-1 — Business Connect product surface layout.
//
// Wraps the two shipped domains (My Business Card, Saved Business Cards) plus
// Overview and "coming soon" placeholders in one coherent surface inside the
// authenticated AppShell. Tab navigation uses type-safe <Link>; each leaf
// route owns its own head()/content. No business logic here.

import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { AppShell } from "@/components/dashboard/AppShell";
import { useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/business-connect")({
  ssr: false,
  component: BusinessConnectLayout,
});

type Tab = { key: TKey; to: string; exact?: boolean };

const TABS: Tab[] = [
  { key: "bc.tab.meetings", to: "/business-connect/meetings" },
];

function BusinessConnectLayout() {
  const t = useT();
  const location = useLocation();
  const isFullBleed =
    location.pathname === "/business-connect" ||
    location.pathname === "/business-connect/" ||
    location.pathname.startsWith("/business-connect/v");

  // Khi người dùng vào /business-connect hoặc các bản demo v1, v2, v3, v4, hiển thị toàn màn hình (Full-bleed) không bị bó khung trong AppShell
  if (isFullBleed) {
    return <Outlet />;
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <header className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Cuộc Gặp Kết Nối
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý và thống kê các cuộc gặp gỡ, giao thương 1-on-1 giữa các hội viên CLB Doanh Nhân CEO 1983
          </p>
        </header>

        <Outlet />
      </div>
    </AppShell>
  );
}

