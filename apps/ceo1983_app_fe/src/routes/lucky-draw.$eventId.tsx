import { createFileRoute } from "@tanstack/react-router";
import { LuckyDrawLandingPage } from "@/components/events/LuckyDrawLandingPage";

export const Route = createFileRoute("/lucky-draw/$eventId")({
  ssr: false,
  component: PublicLuckyDrawLandingEventPage,
  head: () => ({
    meta: [
      {
        title: "Vòng Quay May Mắn - Kỷ Niệm 4 Năm Viện Doanh Trí (HanoiBA)",
      },
      {
        name: "description",
        content:
          "Trang Landing Web Bốc Thăm Trúng Thưởng & Vòng Quay May Mắn Sân Khấu Sự Kiện Toạ Đàm Doanh Nghiệp 2027.",
      },
    ],
  }),
});

function PublicLuckyDrawLandingEventPage() {
  const { eventId } = Route.useParams();
  return <LuckyDrawLandingPage eventId={eventId || "event-doanhtri-20261121"} />;
}
