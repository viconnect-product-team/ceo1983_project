import { createFileRoute } from "@tanstack/react-router";
import { LuckyDrawLandingPage } from "@/components/events/LuckyDrawLandingPage";

export const Route = createFileRoute("/lucky-draw/$eventId")({
  ssr: false,
  component: PublicLuckyDrawLandingEventPage,
  head: () => ({
    meta: [
      {
        title: "Vòng Quay May Mắn - CLB Doanh Nhân CEO 1983 (HanoiBA)",
      },
      {
        name: "description",
        content:
          "Trang Sân Khấu Bốc Thăm Trúng Thưởng & Vòng Quay May Mắn Sự Kiện CLB Doanh Nhân CEO 1983.",
      },
    ],
  }),
});

function PublicLuckyDrawLandingEventPage() {
  const { eventId } = Route.useParams();
  return <LuckyDrawLandingPage eventId={eventId || "latest"} />;
}
