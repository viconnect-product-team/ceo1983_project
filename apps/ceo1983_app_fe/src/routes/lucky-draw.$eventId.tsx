import { createFileRoute } from "@tanstack/react-router";
import { fetchNestApi } from "@/lib/api-client";
import { LuckyDrawWheel } from "@/components/events/LuckyDrawWheel";

export const Route = createFileRoute("/lucky-draw/$eventId")({
  ssr: false,
  loader: async ({ params }) => {
    let event = await fetchNestApi<any>(`/events/${params.eventId}`).catch(() => null);
    if (!event) {
      const allEvents = await fetchNestApi<any[]>("/events").catch(() => []);
      if (Array.isArray(allEvents) && allEvents.length > 0) {
        event =
          allEvents.find(
            (e: any) => e.id === params.eventId || e.slug === params.eventId
          ) || (params.eventId === "latest" ? allEvents[0] : null);
      }
    }
    if (!event) {
      event = {
        id: params.eventId,
        name: "CHƯƠNG TRÌNH KỶ NIỆM 4 NĂM THÀNH LẬP VIỆN DOANH TRÍ & TRI ÂN NGÀY NHÀ GIÁO VIỆT NAM 20/11",
        title: "CHƯƠNG TRÌNH KỶ NIỆM 4 NĂM THÀNH LẬP VIỆN DOANH TRÍ & TRI ÂN NGÀY NHÀ GIÁO VIỆT NAM 20/11",
        date: "2026-11-21",
        time: "14h30 - 17h30, Thứ 7, ngày 21/11/2026",
        location: "Tầng 2, Nhà hàng Long Phụng, 29T2 Hoàng Đạo Thúy",
      };
    }
    return { event };
  },
  component: PublicLuckyDrawWheelPage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Vòng Quay May Mắn: ${
          loaderData?.event?.name || "Kỷ Niệm 4 Năm Viện Doanh Trí"
        }`,
      },
      {
        name: "description",
        content: "Chương trình Bốc thăm trúng thưởng & Vòng quay may mắn dành cho đại biểu tham dự sự kiện.",
      },
    ],
  }),
});

function PublicLuckyDrawWheelPage() {
  const { event } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-slate-50">
      <LuckyDrawWheel
        eventId={event?.id || "event-doanhtri-20261121"}
        initialEvent={event}
        isPublicScreen={true}
      />
    </div>
  );
}
