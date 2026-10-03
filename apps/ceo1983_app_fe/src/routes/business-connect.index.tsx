import { createFileRoute } from "@tanstack/react-router";
import { WorkHubPage } from "@/components/business-connect/work-hub/WorkHubPage";
import { AppShell } from "@/components/dashboard/AppShell";

export const Route = createFileRoute("/business-connect/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Business Connect — Hệ Điều Hành Kết Nối Kinh Doanh & Hiệp Hội" },
      {
        name: "description",
        content:
          "Nền tảng hợp nhất quản lý hội viên 360°, kết nối giao thương B2B, sự kiện thông minh và AI Copilot.",
      },
    ],
  }),
  component: BusinessConnectHubPage,
});

function BusinessConnectHubPage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <WorkHubPage />
      </div>
    </AppShell>
  );
}

